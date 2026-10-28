from unittest.mock import patch
from django.db import DatabaseError
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import AuditLog


class CoreSystemAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="admin_tester", password="Password123!")

    def test_health_check_endpoint(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "success": True,
                "message": "CLOSR backend is running",
                "service": "CLOSR API",
            },
        )

    def test_database_health_check_success(self):
        url = reverse('database-health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        self.assertIn("database", response.data)

    @patch('core.views.connection.cursor')
    def test_database_health_check_failure(self, mock_cursor):
        mock_cursor.side_effect = DatabaseError("Access denied or connection dropped")
        url = reverse('database-health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(response.data.get("success"))
        self.assertEqual(response.data.get("message"), "Database connection failed")
        self.assertNotIn("Access denied", str(response.data))

    def test_analytics_dashboard_endpoint(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('analytics-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        self.assertIn("customers", response.data["data"])
        self.assertIn("conversations", response.data["data"])
        self.assertIn("tickets", response.data["data"])
        self.assertIn("appointments", response.data["data"])
        self.assertIn("leads", response.data["data"])

    def test_audit_logs_list(self):
        AuditLog.objects.create(
            actor=self.user,
            action='LOGIN',
            resource_type='User',
            resource_id=str(self.user.id),
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('audit-logs-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 1)
