from django.db import transaction
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Lead
from .serializers import LeadSerializer, LeadConvertSerializer
from customers.models import Customer
from customers.serializers import CustomerSerializer
from core.models import AuditLog


class LeadListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company', 'phone']
    ordering_fields = ['created_at', 'status', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Lead.objects.select_related('owner', 'converted_customer').all()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        source_param = self.request.query_params.get('source')
        if source_param:
            qs = qs.filter(source=source_param)

        return qs

    def perform_create(self, serializer):
        lead = serializer.save(owner=self.request.user if not serializer.validated_data.get('owner') else None)
        AuditLog.objects.create(
            actor=self.request.user,
            action='CREATE',
            resource_type='Lead',
            resource_id=str(lead.id),
            outcome='success',
            metadata={'name': lead.name, 'email': lead.email},
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    queryset = Lead.objects.select_related('owner', 'converted_customer').all()


class LeadConvertView(APIView):
    """
    Transactionally convert a CRM Lead into an active Customer.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk, *args, **kwargs):
        try:
            lead = Lead.objects.select_for_update().get(pk=pk)
        except Lead.DoesNotExist:
            return Response(
                {"success": False, "message": "Lead not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if lead.status == 'converted' and lead.converted_customer:
            return Response(
                {
                    "success": False,
                    "message": "This lead has already been converted to a customer.",
                    "customer_id": lead.converted_customer.id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if customer with this email already exists
        customer = Customer.objects.filter(email__iexact=lead.email).first()
        if not customer:
            customer = Customer.objects.create(
                name=lead.name,
                email=lead.email.lower(),
                phone=lead.phone,
                company=lead.company,
                status='active',
                notes=f"Converted from Lead #{lead.id}. Source: {lead.source}. {lead.notes}",
                assigned_to=lead.owner or request.user,
                tags=['converted_lead', lead.source],
            )
        else:
            customer.status = 'active'
            customer.notes += f"\n[Converted from Lead #{lead.id}]: {lead.notes}"
            customer.save()

        lead.status = 'converted'
        lead.converted_customer = customer
        lead.save()

        AuditLog.objects.create(
            actor=request.user,
            action='CONVERT',
            resource_type='Lead',
            resource_id=str(lead.id),
            outcome='success',
            metadata={'lead_id': lead.id, 'customer_id': customer.id},
        )

        return Response(
            {
                "success": True,
                "message": f"Lead '{lead.name}' successfully converted to customer.",
                "customer": CustomerSerializer(customer).data,
            },
            status=status.HTTP_200_OK,
        )
