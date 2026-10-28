from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SupportTicket
from .serializers import SupportTicketSerializer, TicketEscalateSerializer
from core.models import AuditLog
from core.permissions import IsStaffOrOwner, is_clinic_staff
from customers.models import Customer


class SupportTicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportTicketSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ticket_number', 'subject', 'description', 'customer__name', 'customer__email']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if is_staff:
            qs = SupportTicket.objects.select_related('customer', 'assigned_to', 'conversation').all()
            customer_id = self.request.query_params.get('customer')
            if customer_id:
                qs = qs.filter(customer_id=customer_id)
        else:
            # Patient data isolation: strictly scoped
            qs = SupportTicket.objects.select_related('customer', 'assigned_to', 'conversation').filter(
                customer__email__iexact=user.email
            )

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        priority_param = self.request.query_params.get('priority')
        if priority_param:
            qs = qs.filter(priority=priority_param)

        escalated = self.request.query_params.get('is_escalated')
        if escalated is not None:
            qs = qs.filter(is_escalated=escalated.lower() in ['true', '1'])

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if not is_staff:
            customer, _ = Customer.objects.get_or_create(
                email=user.email,
                defaults={'name': user.get_full_name() or user.username}
            )
            ticket = serializer.save(customer=customer)
        else:
            ticket = serializer.save()

        AuditLog.objects.create(
            actor=user,
            action='CREATE',
            resource_type='SupportTicket',
            resource_id=ticket.ticket_number,
            outcome='success',
            metadata={'subject': ticket.subject, 'customer_id': ticket.customer_id},
        )


class SupportTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrOwner]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        if is_staff:
            return SupportTicket.objects.select_related('customer', 'assigned_to', 'conversation').all()
        return SupportTicket.objects.select_related('customer', 'assigned_to', 'conversation').filter(
            customer__email__iexact=user.email
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        ticket = serializer.save()
        if ticket.status == 'resolved' and old_status != 'resolved':
            ticket.resolved_at = timezone.now()
            ticket.save(update_fields=['resolved_at'])

        AuditLog.objects.create(
            actor=self.request.user,
            action='UPDATE',
            resource_type='SupportTicket',
            resource_id=ticket.ticket_number,
            outcome='success',
            metadata={'status': ticket.status, 'priority': ticket.priority},
        )


class TicketEscalateView(APIView):
    """
    Escalate a support ticket to human management or senior tier.
    Requires staff or ticket ownership.
    """
    permission_classes = [IsAuthenticated, IsStaffOrOwner]

    def post(self, request, pk, *args, **kwargs):
        try:
            ticket = SupportTicket.objects.select_related('customer').get(pk=pk)
        except SupportTicket.DoesNotExist:
            return Response(
                {"success": False, "message": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        self.check_object_permissions(request, ticket)

        serializer = TicketEscalateSerializer(data=request.data)
        if serializer.is_valid():
            reason = serializer.validated_data['reason']
            assigned_to_id = serializer.validated_data.get('assigned_to')
            priority = serializer.validated_data.get('priority', 'urgent')

            ticket.is_escalated = True
            ticket.escalation_reason = reason
            ticket.priority = priority
            ticket.category = 'escalation'

            if assigned_to_id:
                try:
                    ticket.assigned_to = User.objects.get(pk=assigned_to_id)
                except User.DoesNotExist:
                    pass

            ticket.internal_notes += f"\n[Escalated by {request.user.username} at {timezone.now():%Y-%m-%d %H:%M}]: {reason}"
            ticket.save()

            AuditLog.objects.create(
                actor=request.user,
                action='ESCALATE',
                resource_type='SupportTicket',
                resource_id=ticket.ticket_number,
                outcome='success',
                metadata={'reason': reason, 'priority': priority},
            )

            return Response(
                {
                    "success": True,
                    "message": f"Ticket {ticket.ticket_number} has been escalated successfully.",
                    "data": SupportTicketSerializer(ticket).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
