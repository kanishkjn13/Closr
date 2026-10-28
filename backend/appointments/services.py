import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import Appointment
from customers.models import Customer
from core.models import AuditLog

logger = logging.getLogger(__name__)


class AppointmentService:
    """
    Business service layer for appointment management:
    - Operating hours & schedule validation
    - Availability checks
    - Transactional bookings with locking (prevent double-booking)
    - Safe rescheduling and cancellation with audit trails
    """

    CLINIC_OPEN_HOUR = 9   # 09:00 AM
    CLINIC_CLOSE_HOUR = 18 # 06:00 PM (18:00)

    @classmethod
    def get_clinic_hours(cls):
        return {
            "open_time": "09:00",
            "close_time": "18:00",
            "working_days": "Monday to Saturday (Closed Sundays)",
        }

    @classmethod
    def get_available_slots(cls, staff_id=None, date_str=None):
        """
        Calculates verified available consultation slots for a doctor on a given date.
        Respects clinic hours (09:00 to 18:00, Mon-Sat) and excludes existing bookings.
        """
        if not date_str:
            target_date = timezone.now().date()
        else:
            if isinstance(date_str, str):
                try:
                    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    raise ValidationError("Invalid date format. Expected YYYY-MM-DD.")
            else:
                target_date = date_str

        # Sunday check (Sunday is weekday 6 in Python)
        if target_date.weekday() == 6:
            return {
                "date": str(target_date),
                "is_open": False,
                "message": "The clinic is closed on Sundays.",
                "slots": [],
            }

        day_start = timezone.make_aware(datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0))
        day_end = timezone.make_aware(datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59))
        now = timezone.now()

        booked_qs = Appointment.objects.filter(
            status__in=['scheduled', 'confirmed'],
            start_time__gte=day_start,
            start_time__lte=day_end,
        )
        if staff_id:
            booked_qs = booked_qs.filter(staff_member_id=staff_id)

        booked_ranges = list(booked_qs.values_list('start_time', 'end_time'))

        slots = []
        for hour in range(cls.CLINIC_OPEN_HOUR, cls.CLINIC_CLOSE_HOUR):
            slot_start = timezone.make_aware(datetime(target_date.year, target_date.month, target_date.day, hour, 0))
            slot_end = slot_start + timedelta(hours=1)

            # Slot is past
            if slot_start < now:
                is_available = False
            else:
                is_available = not any(b_start < slot_end and b_end > slot_start for b_start, b_end in booked_ranges)

            slots.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "time_label": f"{hour:02d}:00 - {hour+1:02d}:00",
                "available": is_available,
            })

        return {
            "date": str(target_date),
            "is_open": True,
            "staff_id": staff_id,
            "slots": slots,
        }

    @classmethod
    @transaction.atomic
    def book_appointment(cls, customer, staff_member, start_time, end_time=None, title="Medical Consultation", notes="", actor=None):
        """
        Atomically books an appointment with select_for_update locking to prevent race conditions.
        """
        if not end_time:
            end_time = start_time + timedelta(hours=1)

        if start_time < timezone.now():
            raise ValidationError("Cannot book an appointment in the past.")

        if start_time >= end_time:
            raise ValidationError("End time must be after start time.")

        # Check operating hours
        start_local = timezone.localtime(start_time)
        if start_local.weekday() == 6:
            raise ValidationError("The clinic is closed on Sundays.")
        if start_local.hour < cls.CLINIC_OPEN_HOUR or start_local.hour >= cls.CLINIC_CLOSE_HOUR:
            raise ValidationError(f"Appointments can only be booked during clinic hours ({cls.CLINIC_OPEN_HOUR:02d}:00 - {cls.CLINIC_CLOSE_HOUR:02d}:00).")

        # Concurrency protection with select_for_update
        conflicts = Appointment.objects.select_for_update().filter(
            staff_member=staff_member,
            status__in=['scheduled', 'confirmed'],
            start_time__lt=end_time,
            end_time__gt=start_time,
        )
        if conflicts.exists():
            raise ValidationError("The selected doctor already has a confirmed or scheduled booking in this time window.")

        appointment = Appointment.objects.create(
            customer=customer,
            staff_member=staff_member,
            title=title,
            start_time=start_time,
            end_time=end_time,
            status='confirmed',
            notes=notes,
        )

        AuditLog.objects.create(
            actor=actor if (actor and actor.is_authenticated) else None,
            action='BOOK_APPOINTMENT',
            resource_type='Appointment',
            resource_id=str(appointment.id),
            outcome='success',
            metadata={
                'customer': customer.email,
                'staff': staff_member.username,
                'start_time': start_time.isoformat(),
            },
        )
        return appointment

    @classmethod
    @transaction.atomic
    def reschedule_appointment(cls, appointment_id, new_start_time, new_end_time=None, actor=None, reason=""):
        """
        Atomically reschedules an existing appointment, verifying status and slot availability.
        """
        try:
            appointment = Appointment.objects.select_for_update().get(pk=appointment_id)
        except Appointment.DoesNotExist:
            raise ValidationError("Appointment not found.")

        if appointment.status in ['cancelled', 'completed']:
            raise ValidationError(f"Cannot reschedule an appointment that is already {appointment.status}.")

        if not new_end_time:
            new_end_time = new_start_time + timedelta(hours=1)

        if new_start_time < timezone.now():
            raise ValidationError("Cannot reschedule to a past date or time.")

        start_local = timezone.localtime(new_start_time)
        if start_local.weekday() == 6:
            raise ValidationError("The clinic is closed on Sundays.")
        if start_local.hour < cls.CLINIC_OPEN_HOUR or start_local.hour >= cls.CLINIC_CLOSE_HOUR:
            raise ValidationError(f"Rescheduled slot must be within clinic hours ({cls.CLINIC_OPEN_HOUR:02d}:00 - {cls.CLINIC_CLOSE_HOUR:02d}:00).")

        # Check conflicting bookings excluding this appointment
        conflicts = Appointment.objects.select_for_update().filter(
            staff_member=appointment.staff_member,
            status__in=['scheduled', 'confirmed'],
            start_time__lt=new_end_time,
            end_time__gt=new_start_time,
        ).exclude(pk=appointment.pk)

        if conflicts.exists():
            raise ValidationError("The requested new slot is already booked for this doctor.")

        old_start = appointment.start_time
        appointment.start_time = new_start_time
        appointment.end_time = new_end_time
        appointment.status = 'confirmed'
        if reason:
            appointment.notes += f"\n[Rescheduled: {reason}]"
        appointment.save()

        AuditLog.objects.create(
            actor=actor if (actor and actor.is_authenticated) else None,
            action='RESCHEDULE_APPOINTMENT',
            resource_type='Appointment',
            resource_id=str(appointment.id),
            outcome='success',
            metadata={
                'old_start': old_start.isoformat(),
                'new_start': new_start_time.isoformat(),
                'reason': reason,
            },
        )
        return appointment

    @classmethod
    @transaction.atomic
    def cancel_appointment(cls, appointment_id, actor=None, reason=""):
        """
        Atomically cancels an appointment with policy validation and audit logging.
        """
        try:
            appointment = Appointment.objects.select_for_update().get(pk=appointment_id)
        except Appointment.DoesNotExist:
            raise ValidationError("Appointment not found.")

        if appointment.status == 'cancelled':
            raise ValidationError("This appointment is already cancelled.")

        if appointment.status == 'completed':
            raise ValidationError("Cannot cancel an appointment that has already been completed.")

        appointment.status = 'cancelled'
        if reason:
            appointment.notes += f"\n[Cancelled: {reason}]"
        appointment.save(update_fields=['status', 'notes', 'updated_at'])

        AuditLog.objects.create(
            actor=actor if (actor and actor.is_authenticated) else None,
            action='CANCEL_APPOINTMENT',
            resource_type='Appointment',
            resource_id=str(appointment.id),
            outcome='success',
            metadata={
                'cancelled_start': appointment.start_time.isoformat(),
                'reason': reason,
            },
        )
        return appointment
