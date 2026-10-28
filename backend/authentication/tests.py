from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.profile_url = reverse('auth-profile')
        self.logout_url = reverse('auth-logout')
        self.reset_request_url = reverse('auth-password-reset-request')
        self.reset_confirm_url = reverse('auth-password-reset-confirm')

    def test_user_registration_success(self):
        data = {
            "username": "sarah_agent",
            "email": "sarah@closr.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Sarah",
            "last_name": "Connor",
            "role": "agent",
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('success'))
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_registration_password_mismatch(self):
        data = {
            "username": "bad_user",
            "email": "bad@closr.ai",
            "password": "SecurePassword123!",
            "password_confirm": "DifferentPassword456!",
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))

    def test_duplicate_registration_prevention(self):
        User.objects.create_user(username="existing_user", email="existing@closr.ai", password="Password123!")
        
        # Duplicate username
        res1 = self.client.post(self.register_url, {
            "username": "existing_user",
            "email": "different@closr.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)

        # Duplicate email
        res2 = self.client.post(self.register_url, {
            "username": "new_unique_name",
            "email": "existing@closr.ai",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_and_profile_retrieval(self):
        User.objects.create_user(username="agent_mike", email="mike@closr.ai", password="MikePassword123!")
        
        # Login
        login_res = self.client.post(self.login_url, {"username": "agent_mike", "password": "MikePassword123!"})
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data['tokens']['access']

        # Get profile with Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        profile_res = self.client.get(self.profile_url)
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data['data']['username'], 'agent_mike')

        # Logout
        logout_res = self.client.post(self.logout_url)
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

    def test_invalid_credentials_handling(self):
        User.objects.create_user(username="valid_user", email="valid@closr.ai", password="CorrectPassword123!")
        
        # Incorrect password
        res = self.client.post(self.login_url, {"username": "valid_user", "password": "WrongPassword999!"})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(res.data.get('success'))

        # Non-existent user
        res_none = self.client.post(self.login_url, {"username": "ghost_user", "password": "AnyPassword123!"})
        self.assertEqual(res_none.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user_rejection(self):
        user = User.objects.create_user(username="inactive_user", email="inactive@closr.ai", password="Password123!")
        user.is_active = False
        user.save()

        res = self.client.post(self.login_url, {"username": "inactive_user", "password": "Password123!"})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_request_handling(self):
        self.client.credentials()  # clear credentials
        res = self.client.get(self.profile_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_flow(self):
        User.objects.create_user(username="reset_user", email="reset@closr.ai", password="OldPassword123!")
        
        # Request reset
        req_res = self.client.post(self.reset_request_url, {"email": "reset@closr.ai"})
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)
        token = req_res.data.get('debug_reset_token')
        self.assertIsNotNone(token)

        # Confirm reset
        conf_res = self.client.post(self.reset_confirm_url, {"token": token, "new_password": "BrandNewPassword123!"})
        self.assertEqual(conf_res.status_code, status.HTTP_200_OK)

        # Login with new password
        login_res = self.client.post(self.login_url, {"username": "reset_user", "password": "BrandNewPassword123!"})
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
