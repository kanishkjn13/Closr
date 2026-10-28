from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from knowledge.models import KnowledgeArticle
from customers.models import Customer
from conversations.models import Conversation, Message
from appointments.models import Appointment
from tickets.models import SupportTicket


class AIAgentAPITests(APITestCase):
    def setUp(self):
        # Patient A
        self.patient_a = User.objects.create_user(username="patient_a", email="patient.a@example.com", password="Password123!")
        self.customer_a = Customer.objects.create(name="Patient A", email="patient.a@example.com")
        
        # Patient B
        self.patient_b = User.objects.create_user(username="patient_b", email="patient.b@example.com", password="Password123!")
        self.customer_b = Customer.objects.create(name="Patient B", email="patient.b@example.com")

        # Clinic Doctor (Staff)
        self.doctor = User.objects.create_user(username="dr_mark", first_name="Mark", last_name="Stone", email="dr.mark@opera-ai.clinic", password="Password123!", is_staff=True)
        if hasattr(self.doctor, 'profile'):
            self.doctor.profile.department = "Dermatology"
            self.doctor.profile.save()

        self.chat_url = reverse('agent-chat')
        self.tools_url = reverse('agent-tools')

        # Seed grounded knowledge articles
        KnowledgeArticle.objects.create(
            title="Clinic Operating Hours and Location",
            content="OPERA AI Health Clinic is located at 104 Medical Enclave. Open Monday to Saturday 09:00 AM to 06:00 PM. Closed Sundays.",
            category="General",
            status="published",
        )
        KnowledgeArticle.objects.create(
            title="Consultation Fees and Specialists",
            content="Dr. Mark Stone (Dermatology): $75 (₹1,500). Dr. Sarah Connor (General Physician): $50 (₹1,000).",
            category="Product",
            status="published",
        )

    def test_tool_registry_discovery(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.get(self.tools_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertGreaterEqual(len(res.data['tools']), 5)

    def test_agent_chat_grounded_response(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.post(self.chat_url, {
            "message": "What are your clinic operating hours?",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertGreaterEqual(len(res.data['sources']), 1)
        self.assertIn("Clinic Operating Hours", res.data['sources'][0]['title'])

    def test_agent_chat_escalation_detection(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.post(self.chat_url, {
            "message": "I want to speak to a human manager immediately about my medical record!",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['requires_escalation'])
        self.assertEqual(res.data['intent'], "human_escalation")
        # Ensure a real SupportTicket was created
        ticket = SupportTicket.objects.filter(customer=self.customer_a, is_escalated=True).first()
        self.assertIsNotNone(ticket)
        self.assertIn(ticket.ticket_number, res.data['message'])

    def test_multilingual_hindi_chat(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.post(self.chat_url, {
            "message": "मुझे डॉक्टर से अपॉइंटमेंट बुक करना है।",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['language'], "hi")
        self.assertEqual(res.data['intent'], "scheduling")

    def test_multilingual_hinglish_chat(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.post(self.chat_url, {
            "message": "Mujhe kal doctor se appointment book karna hai.",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['language'], "hinglish")
        self.assertEqual(res.data['intent'], "scheduling")

    def test_medical_emergency_detection(self):
        self.client.force_authenticate(user=self.patient_a)
        res = self.client.post(self.chat_url, {
            "message": "I am experiencing severe chest pain and difficulty breathing right now!",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('is_emergency'))
        self.assertIn("112", res.data['message'])
        self.assertIn("EMERGENCY", res.data['message'])

    def test_multi_turn_booking_workflow_with_confirmation(self):
        self.client.force_authenticate(user=self.patient_a)
        
        # Turn 1: Patient expresses booking intent
        res1 = self.client.post(self.chat_url, {
            "message": "I want to book an appointment with a dermatologist tomorrow at 10 AM",
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        conv_id = res1.data['conversation_id']
        self.assertEqual(res1.data['action_state'].get('status'), 'awaiting_confirmation')
        self.assertIn("confirm", res1.data['message'].lower())

        # Turn 2: Patient explicitly confirms booking
        res2 = self.client.post(self.chat_url, {
            "conversation_id": conv_id,
            "message": "Yes, please confirm this booking.",
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['action_state'].get('status'), 'completed')
        self.assertIn("successfully booked", res2.data['message'].lower())

        # Verify real Appointment persisted in database
        apt_id = res2.data['action_state'].get('appointment_id')
        self.assertIsNotNone(apt_id)
        apt = Appointment.objects.get(pk=apt_id)
        self.assertEqual(apt.customer, self.customer_a)
        self.assertEqual(apt.status, 'confirmed')

    def test_multi_turn_booking_cancellation_by_user(self):
        self.client.force_authenticate(user=self.patient_a)
        
        # Turn 1: Propose slot
        res1 = self.client.post(self.chat_url, {
            "message": "Book an appointment for tomorrow at 2 PM",
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        conv_id = res1.data['conversation_id']

        # Turn 2: User changes mind and says No
        res2 = self.client.post(self.chat_url, {
            "conversation_id": conv_id,
            "message": "No, cancel it please",
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['action_state'], {})
        self.assertIn("cancelled", res2.data['message'].lower())

    def test_cross_patient_isolation_in_chat(self):
        """Patient B cannot post messages to Patient A's conversation or spoof patient ID."""
        conv_a = Conversation.objects.create(
            customer=self.customer_a,
            channel="web_chat",
            subject="Private Chat Session",
        )

        self.client.force_authenticate(user=self.patient_b)

        # 1. Access Patient A's conversation ID
        res1 = self.client.post(self.chat_url, {
            "conversation_id": conv_a.id,
            "message": "Unauthorized inquiry attempt",
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Access with Patient A's customer ID
        res2 = self.client.post(self.chat_url, {
            "customer_id": self.customer_a.id,
            "message": "Impersonation attempt",
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)
