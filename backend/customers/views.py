from django.db.models import Q
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Customer
from .serializers import CustomerSerializer
from core.models import AuditLog
from core.permissions import IsStaffOrOwner


class CustomerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsStaffOrOwner]
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company', 'phone']
    ordering_fields = ['name', 'created_at', 'status', 'company']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Customer.objects.all()

        # If ordinary customer, restrict queryset strictly to their own record
        is_staff = user.is_staff or user.is_superuser or (
            hasattr(user, 'profile') and user.profile.role in ['admin', 'agent']
        )
        if not is_staff:
            qs = qs.filter(email__iexact=user.email or f"{user.username}@closr.local")

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        archived_param = self.request.query_params.get('is_archived')
        if archived_param is not None:
            is_archived = archived_param.lower() in ['true', '1']
            qs = qs.filter(is_archived=is_archived)
        else:
            qs = qs.filter(is_archived=False)

        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__contains=[tag])

        return qs

    def perform_create(self, serializer):
        customer = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='CREATE',
            resource_type='Customer',
            resource_id=str(customer.id),
            outcome='success',
            metadata={'name': customer.name, 'email': customer.email},
        )


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStaffOrOwner]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()

    def perform_update(self, serializer):
        customer = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='UPDATE',
            resource_type='Customer',
            resource_id=str(customer.id),
            outcome='success',
            metadata={'name': customer.name},
        )

    def delete(self, request, *args, **kwargs):
        customer = self.get_object()
        customer.is_archived = True
        customer.save()
        AuditLog.objects.create(
            actor=request.user,
            action='DELETE',
            resource_type='Customer',
            resource_id=str(customer.id),
            outcome='success',
            metadata={'archived': True},
        )
        return Response(
            {"success": True, "message": "Customer archived successfully."},
            status=status.HTTP_200_OK,
        )
