from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from customers.models import Customer
from .models import Appointment
from .services import AppointmentService


class AppointmentAPITests(APITestCase):
    def setUp(self):
        # Staff doctor
        self.doctor = User.objects.create_user(username="dr_sarah", email="dr.sarah@opera-ai.clinic", password="Password123!", is_staff=True)
        # Patient A
        self.patient_a = User.objects.create_user(username="patient_a", email="patient.a@example.com", password="Password123!")
        self.customer_a = Customer.objects.create(name="Patient A", email="patient.a@example.com")
        # Patient B
        self.patient_b = User.objects.create_user(username="patient_b", email="patient.b@example.com", password="Password123!")
        self.customer_b = Customer.objects.create(name="Patient B", email="patient.b@example.com")

        self.list_url = reverse('appointment-list-create')
        self.avail_url = reverse('appointment-availability')

    def _get_next_weekday(self):
        """Returns the next non-Sunday date (Monday=0 ... Saturday=5)."""
        dt = timezone.now() + timedelta(days=1)
        while dt.weekday() == 6:  # Skip Sunday
            dt += timedelta(days=1)
        return dt

    def test_appointment_booking_and_overlap_prevention(self):
        self.client.force_authenticate(user=self.doctor)
        booking_day = self._get_next_weekday()
        start_time = booking_day.replace(hour=10, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)

        # 1. Book first appointment
        res1 = self.client.post(self.list_url, {
            "customer": self.customer_a.id,
            "staff_member": self.doctor.id,
            "title": "General Health Check",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        })
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # 2. Attempt conflicting overlapping booking for same staff member
        conflicting_start = start_time + timedelta(minutes=30)
        conflicting_end = conflicting_start + timedelta(hours=1)
        res2 = self.client.post(self.list_url, {
            "customer": self.customer_a.id,
            "staff_member": self.doctor.id,
            "title": "Overlapping Conflict",
            "start_time": conflicting_start.isoformat(),
            "end_time": conflicting_end.isoformat(),
        })
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("overlapping", str(res2.data).lower())

        # 3. Check availability API reflects the booked slot
        date_str = start_time.strftime('%Y-%m-%d')
        avail_res = self.client.get(f"{self.avail_url}?staff_id={self.doctor.id}&date={date_str}")
        self.assertEqual(avail_res.status_code, status.HTTP_200_OK)
        slots = avail_res.data['slots']
        slot_10 = next((s for s in slots if s['time_label'].startswith("10:00")), None)
        self.assertIsNotNone(slot_10)
        self.assertFalse(slot_10['available'])

    def test_reschedule_workflow_and_confirmation(self):
        booking_day = self._get_next_weekday()
        start_time = booking_day.replace(hour=11, minute=0, second=0, microsecond=0)
        apt = Appointment.objects.create(
            customer=self.customer_a,
            staff_member=self.doctor,
            title="Dermatology Consultation",
            start_time=start_time,
            end_time=start_time + timedelta(hours=1),
            status='confirmed',
        )

        reschedule_url = reverse('appointment-reschedule', kwargs={'pk': apt.id})
        self.client.force_authenticate(user=self.patient_a)

        new_day = self._get_next_weekday() + timedelta(days=1)
        if new_day.weekday() == 6:
            new_day += timedelta(days=1)
        new_start = new_day.replace(hour=14, minute=0, second=0, microsecond=0)

        # 1. Preview without confirm
        prev_res = self.client.post(reschedule_url, {
            "new_start_time": new_start.isoformat(),
            "confirm": False,
        }, format='json')
        self.assertEqual(prev_res.status_code, status.HTTP_200_OK)
        self.assertTrue(prev_res.data.get('confirm_required'))

        # 2. Confirm reschedule
        conf_res = self.client.post(reschedule_url, {
            "new_start_time": new_start.isoformat(),
            "confirm": True,
            "reason": "Work schedule conflict",
        }, format='json')
        self.assertEqual(conf_res.status_code, status.HTTP_200_OK)
        apt.refresh_from_db()
        self.assertEqual(apt.start_time, new_start)

    def test_cancel_workflow_and_confirmation(self):
        booking_day = self._get_next_weekday()
        start_time = booking_day.replace(hour=15, minute=0, second=0, microsecond=0)
        apt = Appointment.objects.create(
            customer=self.customer_a,
            staff_member=self.doctor,
            title="Cardiology Consultation",
            start_time=start_time,
            end_time=start_time + timedelta(hours=1),
            status='confirmed',
        )

        cancel_url = reverse('appointment-cancel', kwargs={'pk': apt.id})
        self.client.force_authenticate(user=self.patient_a)

        # 1. Preview cancel without confirm
        prev_res = self.client.post(cancel_url, {"confirm": False}, format='json')
        self.assertEqual(prev_res.status_code, status.HTTP_200_OK)
        self.assertTrue(prev_res.data.get('confirm_required'))

        # 2. Confirm cancel
        conf_res = self.client.post(cancel_url, {"confirm": True, "reason": "Patient requested cancellation"}, format='json')
        self.assertEqual(conf_res.status_code, status.HTTP_200_OK)
        apt.refresh_from_db()
        self.assertEqual(apt.status, 'cancelled')

    def test_cross_patient_access_restriction(self):
        """Patient B cannot view, reschedule, or cancel Patient A's appointment."""
        booking_day = self._get_next_weekday()
        start_time = booking_day.replace(hour=16, minute=0, second=0, microsecond=0)
        apt_a = Appointment.objects.create(
            customer=self.customer_a,
            staff_member=self.doctor,
            title="Private Consultation",
            start_time=start_time,
            end_time=start_time + timedelta(hours=1),
            status='confirmed',
        )

        self.client.force_authenticate(user=self.patient_b)

        # 1. Listing should NOT include Patient A's appointment
        list_res = self.client.get(self.list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        ids = [a['id'] for a in results]
        self.assertNotIn(apt_a.id, ids)

        # 2. Direct detail access should be 404 (scoped queryset) or 403
        detail_url = reverse('appointment-detail', kwargs={'pk': apt_a.id})
        det_res = self.client.get(detail_url)
        self.assertIn(det_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

        # 3. Reschedule should be 404 or 403
        reschedule_url = reverse('appointment-reschedule', kwargs={'pk': apt_a.id})
        res_res = self.client.post(reschedule_url, {
            "new_start_time": (start_time + timedelta(days=2)).isoformat(),
            "confirm": True,
        })
        self.assertIn(res_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    def test_clinic_hours_and_sunday_closure(self):
        # Sunday date
        dt = timezone.now() + timedelta(days=1)
        while dt.weekday() != 6:  # Find Sunday
            dt += timedelta(days=1)

        avail = AppointmentService.get_available_slots(staff_id=self.doctor.id, date_str=dt.strftime('%Y-%m-%d'))
        self.assertFalse(avail['is_open'])
        self.assertEqual(avail['slots'], [])
