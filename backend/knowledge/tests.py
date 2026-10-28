from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import KnowledgeArticle


class KnowledgeAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="author_user", password="Password123!")
        self.client.force_authenticate(user=self.user)
        self.list_url = reverse('knowledge-list-create')
        self.search_url = reverse('knowledge-search')

    def test_create_and_search_articles(self):
        art_res = self.client.post(self.list_url, {
            "title": "Refund and Billing Policy 2026",
            "content": "All requests for refunds must be filed within 14 calendar days of transaction.",
            "category": "Billing",
            "status": "published",
        })
        self.assertEqual(art_res.status_code, status.HTTP_201_CREATED)

        # Search query
        search_res = self.client.get(f"{self.search_url}?q=refund")
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        self.assertEqual(search_res.data['count'], 1)
        self.assertEqual(search_res.data['data'][0]['title'], "Refund and Billing Policy 2026")
