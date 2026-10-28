import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer
from .services import AppointmentService
from core.permissions import IsStaffOrOwner, IsStaffUser, is_clinic_staff
from core.models import AuditLog
from customers.models import Customer

logger = logging.getLogger(__name__)


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    List appointments or book a new appointment.
    Patients can only see their own appointments; staff can see all or filter.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'customer__name', 'customer__email', 'notes']
    ordering_fields = ['start_time', 'end_time', 'status']
    ordering = ['start_time']

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if is_staff:
            qs = Appointment.objects.select_related('customer', 'staff_member').all()
            customer_id = self.request.query_params.get('customer')
            if customer_id:
                qs = qs.filter(customer_id=customer_id)
            staff_id = self.request.query_params.get('staff')
            if staff_id:
                qs = qs.filter(staff_member_id=staff_id)
        else:
            # Patient data isolation: strictly scoped to the patient
            qs = Appointment.objects.select_related('customer', 'staff_member').filter(
                customer__email__iexact=user.email
            )

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        
        if not is_staff:
            # Non-staff users can only book for themselves
            customer, _ = Customer.objects.get_or_create(
                email=user.email,
                defaults={'name': user.get_full_name() or user.username}
            )
            appointment = serializer.save(customer=customer)
        else:
            appointment = serializer.save()

        AuditLog.objects.create(
            actor=user,
            action='CREATE',
            resource_type='Appointment',
            resource_id=str(appointment.id),
            outcome='success',
            metadata={'customer': appointment.customer.name, 'start_time': str(appointment.start_time)},
        )


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an appointment.
    Object-level permission ensures patients cannot view or edit appointments of other patients.
    """
    permission_classes = [IsAuthenticated, IsStaffOrOwner]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        is_staff = is_clinic_staff(user)
        if is_staff:
            return Appointment.objects.select_related('customer', 'staff_member').all()
        return Appointment.objects.select_related('customer', 'staff_member').filter(
            customer__email__iexact=user.email
        )

    def perform_update(self, serializer):
        appointment = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='UPDATE',
            resource_type='Appointment',
            resource_id=str(appointment.id),
            outcome='success',
            metadata={'status': appointment.status},
        )


class AppointmentAvailabilityView(APIView):
    """
    Check booking availability for a doctor/staff on a specific date.
    Respects clinic hours (09:00 - 18:00, Mon-Sat) and excludes existing bookings.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        staff_id = request.query_params.get('staff_id') or request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')

        try:
            availability = AppointmentService.get_available_slots(staff_id=staff_id, date_str=date_str)
            return Response(
                {"success": True, **availability},
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            return Response(
                {"success": False, "message": str(e.message if hasattr(e, 'message') else e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RescheduleAppointmentView(APIView):
    """
    Reschedule an existing appointment.
    Supports a 2-step confirmation workflow:
    - confirm=false (default): validates and previews the proposed change.
    - confirm=true: applies the change transactionally with lock.
    """
    permission_classes = [IsAuthenticated, IsStaffOrOwner]

    def post(self, request, pk, *args, **kwargs):
        try:
            appointment = Appointment.objects.select_related('customer', 'staff_member').get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        self.check_object_permissions(request, appointment)

        new_start_str = request.data.get('new_start_time')
        new_end_str = request.data.get('new_end_time')
        confirm_val = request.data.get('confirm', False)
        if isinstance(confirm_val, str):
            confirm = confirm_val.lower() in ['true', '1', 'yes']
        else:
            confirm = bool(confirm_val)
        reason = request.data.get('reason', '')

        if not new_start_str:
            return Response(
                {"success": False, "message": "new_start_time is required (ISO 8601 format)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_start = datetime.fromisoformat(new_start_str)
            if timezone.is_naive(new_start):
                new_start = timezone.make_aware(new_start)
        except ValueError:
            return Response(
                {"success": False, "message": "Invalid new_start_time format. Use ISO 8601 (e.g. 2026-10-30T10:00:00Z)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_end = None
        if new_end_str:
            try:
                new_end = datetime.fromisoformat(new_end_str)
                if timezone.is_naive(new_end):
                    new_end = timezone.make_aware(new_end)
            except ValueError:
                return Response(
                    {"success": False, "message": "Invalid new_end_time format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not confirm:
            # Preview proposal step
            return Response(
                {
                    "success": True,
                    "action": "reschedule_preview",
                    "appointment_id": appointment.id,
                    "doctor": appointment.staff_member.get_full_name() or appointment.staff_member.username,
                    "current_start": appointment.start_time.isoformat(),
                    "proposed_start": new_start.isoformat(),
                    "confirm_required": True,
                    "message": "Please confirm the reschedule request by sending confirm=true.",
                },
                status=status.HTTP_200_OK,
            )

        try:
            updated_appointment = AppointmentService.reschedule_appointment(
                appointment_id=appointment.id,
                new_start_time=new_start,
                new_end_time=new_end,
                actor=request.user,
                reason=reason,
            )
            return Response(
                {
                    "success": True,
                    "message": "Appointment rescheduled successfully.",
                    "data": AppointmentSerializer(updated_appointment).data,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            msg = e.message if hasattr(e, 'message') else str(e)
            return Response({"success": False, "message": msg}, status=status.HTTP_400_BAD_REQUEST)


class CancelAppointmentView(APIView):
    """
    Cancel an existing appointment.
    Supports confirmation workflow:
    - confirm=false: returns cancellation policy and confirmation prompt.
    - confirm=true: applies the cancellation transactionally.
    """
    permission_classes = [IsAuthenticated, IsStaffOrOwner]

    def post(self, request, pk, *args, **kwargs):
        try:
            appointment = Appointment.objects.select_related('customer', 'staff_member').get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        confirm_val = request.data.get('confirm', False)
        if isinstance(confirm_val, str):
            confirm = confirm_val.lower() in ['true', '1', 'yes']
        else:
            confirm = bool(confirm_val)
        reason = request.data.get('reason', '')

        if not confirm:
            return Response(
                {
                    "success": True,
                    "action": "cancel_preview",
                    "appointment_id": appointment.id,
                    "current_start": appointment.start_time.isoformat(),
                    "doctor": appointment.staff_member.get_full_name() or appointment.staff_member.username,
                    "confirm_required": True,
                    "policy_notice": "Appointments can be cancelled without fee up to 2 hours in advance.",
                    "message": "Are you sure you want to cancel this appointment? Send confirm=true to complete cancellation.",
                },
                status=status.HTTP_200_OK,
            )

        try:
            cancelled_appointment = AppointmentService.cancel_appointment(
                appointment_id=appointment.id,
                actor=request.user,
                reason=reason,
            )
            return Response(
                {
                    "success": True,
                    "message": "Appointment has been cancelled successfully.",
                    "data": AppointmentSerializer(cancelled_appointment).data,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            msg = e.message if hasattr(e, 'message') else str(e)
            return Response({"success": False, "message": msg}, status=status.HTTP_400_BAD_REQUEST)
