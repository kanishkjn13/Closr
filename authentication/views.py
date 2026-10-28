import secrets
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from core.models import AuditLog


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            AuditLog.objects.create(
                actor=user,
                action='CREATE',
                resource_type='User',
                resource_id=str(user.id),
                outcome='success',
                metadata={'username': user.username, 'role': user.profile.role},
            )

            return Response(
                {
                    "success": True,
                    "message": "User registered successfully",
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                    "user": UserProfileSerializer(user.profile).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Support login with either username or email
            user = authenticate(request, username=username, password=password)
            if not user and '@' in username:
                try:
                    user_obj = User.objects.get(email__iexact=username)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None

            if user is not None:
                if not user.is_active:
                    return Response(
                        {"success": False, "message": "This account has been deactivated."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                refresh = RefreshToken.for_user(user)
                AuditLog.objects.create(
                    actor=user,
                    action='LOGIN',
                    resource_type='User',
                    resource_id=str(user.id),
                    outcome='success',
                )
                return Response(
                    {
                        "success": True,
                        "message": "Login successful",
                        "tokens": {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh),
                        },
                        "user": UserProfileSerializer(user.profile).data,
                    },
                    status=status.HTTP_200_OK,
                )
            
            return Response(
                {"success": False, "message": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user.profile)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user.profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "message": "Profile updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        AuditLog.objects.create(
            actor=request.user,
            action='LOGOUT',
            resource_type='User',
            resource_id=str(request.user.id),
            outcome='success',
        )
        return Response(
            {"success": True, "message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email__iexact=email).first()
            if user:
                token = secrets.token_urlsafe(32)
                profile = user.profile
                profile.reset_token = token
                profile.reset_token_created_at = timezone.now()
                profile.save()
                # In real production, send email; for development/testing, return token
                return Response(
                    {
                        "success": True,
                        "message": "If that email is registered, password reset instructions have been generated.",
                        "debug_reset_token": token,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    "success": True,
                    "message": "If that email is registered, password reset instructions have been generated.",
                },
                status=status.HTTP_200_OK,
            )
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            profile = UserProfile.objects.filter(reset_token=token).first()
            if not profile or not profile.reset_token_created_at:
                return Response(
                    {"success": False, "message": "Invalid or expired password reset token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check expiration (e.g., 2 hours)
            if timezone.now() - profile.reset_token_created_at > timedelta(hours=2):
                profile.reset_token = None
                profile.reset_token_created_at = None
                profile.save()
                return Response(
                    {"success": False, "message": "Password reset token has expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = profile.user
            user.set_password(new_password)
            user.save()

            profile.reset_token = None
            profile.reset_token_created_at = None
            profile.save()

            AuditLog.objects.create(
                actor=user,
                action='UPDATE',
                resource_type='User',
                resource_id=str(user.id),
                outcome='success',
                metadata={'event': 'password_reset'},
            )

            return Response(
                {"success": True, "message": "Password has been successfully updated. You may now log in."},
                status=status.HTTP_200_OK,
            )
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
