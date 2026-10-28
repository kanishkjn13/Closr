from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from customers.models import Customer
from .models import SupportTicket


class SupportTicketAPITests(APITestCase):
    def setUp(self):
        # Patient A
        self.patient_a = User.objects.create_user(username="patient_a", email="patient.a@example.com", password="Password123!")
        self.customer_a = Customer.objects.create(name="Patient A", email="patient.a@example.com")
        
        # Patient B
        self.patient_b = User.objects.create_user(username="patient_b", email="patient.b@example.com", password="Password123!")
        self.customer_b = Customer.objects.create(name="Patient B", email="patient.b@example.com")

        # Staff agent & Senior lead
        self.staff_user = User.objects.create_user(username="support_agent", email="agent@opera-ai.clinic", password="Password123!", is_staff=True)
        self.senior_agent = User.objects.create_user(username="senior_lead", email="lead@opera-ai.clinic", password="Password123!", is_staff=True)
        
        self.list_url = reverse('ticket-list-create')

    def test_ticket_lifecycle_and_escalation(self):
        self.client.force_authenticate(user=self.staff_user)
        # 1. Create ticket
        create_res = self.client.post(self.list_url, {
            "customer": self.customer_a.id,
            "subject": "System downtime inquiry",
            "description": "Database queries are failing intermittently.",
            "priority": "medium",
            "category": "technical",
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        ticket_id = create_res.data['id']
        self.assertTrue(create_res.data['ticket_number'].startswith("TIK-"))

        # 2. Escalate ticket
        esc_url = reverse('ticket-escalate', kwargs={'pk': ticket_id})
        esc_res = self.client.post(esc_url, {
            "reason": "Customer is on enterprise SLA and demands immediate senior engineering review.",
            "assigned_to": self.senior_agent.id,
            "priority": "urgent",
        })
        self.assertEqual(esc_res.status_code, status.HTTP_200_OK)
        self.assertTrue(esc_res.data['data']['is_escalated'])
        self.assertEqual(esc_res.data['data']['priority'], "urgent")
        self.assertEqual(esc_res.data['data']['assigned_to'], self.senior_agent.id)

    def test_cross_patient_ticket_isolation(self):
        """Patient B cannot view or escalate Patient A's ticket."""
        ticket_a = SupportTicket.objects.create(
            customer=self.customer_a,
            subject="Private Medical Record Query",
            description="Inquiry about confidential test results.",
            priority="high",
        )

        self.client.force_authenticate(user=self.patient_b)

        # 1. Listing should not contain Patient A's ticket
        list_res = self.client.get(self.list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        ids = [t['id'] for t in results]
        self.assertNotIn(ticket_a.id, ids)

        # 2. Detail view should return 404 (scoped queryset) or 403
        detail_url = reverse('ticket-detail', kwargs={'pk': ticket_a.id})
        det_res = self.client.get(detail_url)
        self.assertIn(det_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

        # 3. Escalation attempt by unauthorized Patient B should be rejected
        esc_url = reverse('ticket-escalate', kwargs={'pk': ticket_a.id})
        esc_res = self.client.post(esc_url, {
            "reason": "Unauthorized escalation attempt",
        })
        self.assertIn(esc_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
