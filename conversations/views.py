from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from core.models import AuditLog
from core.permissions import IsStaffOrOwner, is_clinic_staff
from customers.models import Customer


class ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject', 'customer__name', 'customer__email']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-updated_at']

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if is_staff:
            qs = Conversation.objects.select_related('customer', 'assigned_to').prefetch_related('messages').all()
            customer_id = self.request.query_params.get('customer')
            if customer_id:
                qs = qs.filter(customer_id=customer_id)
        else:
            # Patient data isolation: only their own conversations
            qs = Conversation.objects.select_related('customer', 'assigned_to').prefetch_related('messages').filter(
                customer__email__iexact=user.email
            )

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        channel_param = self.request.query_params.get('channel')
        if channel_param:
            qs = qs.filter(channel=channel_param)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if not is_staff:
            customer, _ = Customer.objects.get_or_create(
                email=user.email,
                defaults={'name': user.get_full_name() or user.username}
            )
            conv = serializer.save(customer=customer)
        else:
            conv = serializer.save()

        AuditLog.objects.create(
            actor=user,
            action='CREATE',
            resource_type='Conversation',
            resource_id=str(conv.id),
            outcome='success',
            metadata={'customer_id': conv.customer_id, 'subject': conv.subject},
        )


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrOwner]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        if is_staff:
            return Conversation.objects.select_related('customer', 'assigned_to').all()
        return Conversation.objects.select_related('customer', 'assigned_to').filter(
            customer__email__iexact=user.email
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        conv = serializer.save()
        if conv.status == 'closed' and old_status != 'closed':
            conv.closed_at = timezone.now()
            conv.save(update_fields=['closed_at'])


class ConversationMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def _get_conversation_or_check_permission(self):
        conv_id = self.kwargs.get('conversation_id')
        try:
            conversation = Conversation.objects.select_related('customer').get(pk=conv_id)
        except Conversation.DoesNotExist:
            return None, Response(
                {"success": False, "message": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = self.request.user
        is_staff = is_clinic_staff(user)
        if not is_staff and conversation.customer.email.lower() != (user.email or '').lower():
            return None, Response(
                {"detail": "You do not have permission to access this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return conversation, None

    def get_queryset(self):
        conv_id = self.kwargs.get('conversation_id')
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        # Verify conversation ownership
        if not is_staff:
            is_owner = Conversation.objects.filter(pk=conv_id, customer__email__iexact=user.email).exists()
            if not is_owner:
                raise PermissionDenied("You do not have permission to access this conversation.")

        return Message.objects.filter(conversation_id=conv_id).order_by('created_at')

    def create(self, request, *args, **kwargs):
        conversation, err_resp = self._get_conversation_or_check_permission()
        if err_resp:
            return err_resp

        data = request.data.copy()
        data['conversation'] = conversation.id
        if 'sender_name' not in data or not data['sender_name']:
            data['sender_name'] = request.user.get_full_name() or request.user.username

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        # Update conversation timestamp and status if closed
        if conversation.status == 'closed':
            conversation.status = 'open'
            conversation.closed_at = None
        conversation.save(update_fields=['status', 'closed_at', 'updated_at'])

        return Response(serializer.data, status=status.HTTP_201_CREATED)
