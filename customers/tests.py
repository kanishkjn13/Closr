from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Customer


class CustomerAPITests(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(username="agent_tester", password="Password123!", is_staff=True)
        self.client.force_authenticate(user=self.staff_user)
        self.list_create_url = reverse('customer-list-create')

    def test_create_and_list_customers(self):
        data = {
            "name": "Acme Corp",
            "email": "contact@acme.com",
            "phone": "+1-555-0199",
            "company": "Acme Corporation",
            "status": "active",
            "tags": ["vip", "enterprise"],
            "notes": "Key enterprise account",
        }
        create_res = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_res.data['name'], "Acme Corp")

        # List
        list_res = self.client.get(self.list_create_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data.get('results', list_res.data)), 1)

    def test_customer_detail_and_soft_delete(self):
        cust = Customer.objects.create(name="Beta LLC", email="hello@beta.com", company="Beta")
        detail_url = reverse('customer-detail', kwargs={'pk': cust.pk})

        # Update
        patch_res = self.client.patch(detail_url, {"company": "Beta Global Inc"})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['company'], "Beta Global Inc")

        # Soft delete / archive
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        cust.refresh_from_db()
        self.assertTrue(cust.is_archived)

    def test_patient_cross_access_restriction(self):
        """A non-staff patient cannot view or modify another patient's record."""
        cust_a = Customer.objects.create(name="Patient A", email="patient.a@example.com")
        patient_b = User.objects.create_user(username="patient_b", email="patient.b@example.com", password="Password123!")

        self.client.force_authenticate(user=patient_b)

        # 1. Listing should not return Patient A
        list_res = self.client.get(self.list_create_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get('results', list_res.data)
        ids = [c['id'] for c in results]
        self.assertNotIn(cust_a.id, ids)

        # 2. Detail view / modification should be rejected (404 scoped or 403)
        detail_url = reverse('customer-detail', kwargs={'pk': cust_a.pk})
        det_res = self.client.get(detail_url)
        self.assertIn(det_res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
