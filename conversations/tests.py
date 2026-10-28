from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from customers.models import Customer
from .models import Conversation, Message


class ConversationAPITests(APITestCase):
    def setUp(self):
        # Patient A
        self.patient_a = User.objects.create_user(username="patient_a", email="patient.a@example.com", password="Password123!")
        self.customer_a = Customer.objects.create(name="Patient A", email="patient.a@example.com")
        
        # Patient B
        self.patient_b = User.objects.create_user(username="patient_b", email="patient.b@example.com", password="Password123!")
        self.customer_b = Customer.objects.create(name="Patient B", email="patient.b@example.com")

        # Clinic Doctor (Staff)
        self.doctor = User.objects.create_user(username="dr_sarah", email="dr.sarah@opera-ai.clinic", password="Password123!", is_staff=True)

        self.list_url = reverse('conversation-list-create')

    def test_create_conversation_and_send_message(self):
        self.client.force_authenticate(user=self.patient_a)
        conv_res = self.client.post(self.list_url, {
            "channel": "web_chat",
            "subject": "General Health Inquiry",
        })
        self.assertEqual(conv_res.status_code, status.HTTP_201_CREATED)
        conv_id = conv_res.data['id']

        # Add message
        msg_url = reverse('conversation-message-list-create', kwargs={'conversation_id': conv_id})
        msg_res = self.client.post(msg_url, {
            "content": "What are your consultation timings?",
            "sender_type": "customer",
        })
        self.assertEqual(msg_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(msg_res.data['content'], "What are your consultation timings?")

        # List messages
        list_msg_res = self.client.get(msg_url)
        self.assertEqual(list_msg_res.status_code, status.HTTP_200_OK)
        results = list_msg_res.data.get('results', list_msg_res.data)
        self.assertEqual(len(results), 1)

    def test_cross_patient_conversation_isolation(self):
        """Patient B must not be able to view, read messages, or post to Patient A's conversation."""
        # Create conversation for Patient A
        conv_a = Conversation.objects.create(
            customer=self.customer_a,
            channel="web_chat",
            subject="Patient A Confidential Consultation",
            status="open",
        )
        msg_a = Message.objects.create(
            conversation=conv_a,
            sender_type="customer",
            content="Sensitive patient symptom description",
        )

        # Authenticate as Patient B
        self.client.force_authenticate(user=self.patient_b)

        # 1. Listing should not contain Patient A's conversation
        list_res = self.client.get(self.list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        ids = [c['id'] for c in results]
        self.assertNotIn(conv_a.id, ids)

        # 2. Detail view of Patient A's conversation should be 404 or 403
        detail_url = reverse('conversation-detail', kwargs={'pk': conv_a.id})
        det_res = self.client.get(detail_url)
        self.assertIn(det_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

        # 3. Message list should be forbidden
        msg_url = reverse('conversation-message-list-create', kwargs={'conversation_id': conv_a.id})
        msg_get_res = self.client.get(msg_url)
        self.assertIn(msg_get_res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

        # 4. Message post attempt by Patient B should be rejected
        msg_post_res = self.client.post(msg_url, {
            "content": "Malicious intrusion attempt",
            "sender_type": "customer",
        })
        self.assertIn(msg_post_res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_staff_access_to_all_conversations(self):
        """Clinic staff should have access to patient conversations for operations."""
        conv_a = Conversation.objects.create(
            customer=self.customer_a,
            channel="web_chat",
            subject="Inquiry for Dr. Sarah",
        )
        self.client.force_authenticate(user=self.doctor)
        list_res = self.client.get(self.list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        ids = [c['id'] for c in results]
        self.assertIn(conv_a.id, ids)
