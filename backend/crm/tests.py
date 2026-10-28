from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from customers.models import Customer
from .models import Lead


class CRMAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="sales_rep", password="Password123!")
        self.client.force_authenticate(user=self.user)
        self.leads_url = reverse('lead-list-create')

    def test_lead_lifecycle_and_conversion(self):
        # 1. Create Lead
        lead_res = self.client.post(self.leads_url, {
            "name": "David Wallace",
            "email": "dwallace@dundermifflin.com",
            "company": "Dunder Mifflin",
            "source": "website",
            "notes": "Looking for 50 customer service seats",
        })
        self.assertEqual(lead_res.status_code, status.HTTP_201_CREATED)
        lead_id = lead_res.data['id']

        # 2. Convert to customer
        conv_url = reverse('lead-convert', kwargs={'pk': lead_id})
        conv_res = self.client.post(conv_url, {})
        self.assertEqual(conv_res.status_code, status.HTTP_200_OK)
        self.assertTrue(conv_res.data['success'])
        customer_data = conv_res.data['customer']
        self.assertEqual(customer_data['name'], "David Wallace")
        self.assertEqual(customer_data['email'], "dwallace@dundermifflin.com")

        # Verify Lead status is now 'converted'
        lead = Lead.objects.get(pk=lead_id)
        self.assertEqual(lead.status, 'converted')
        self.assertEqual(lead.converted_customer.id, customer_data['id'])
