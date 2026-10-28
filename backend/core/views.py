import logging
from django.db import connection
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from .models import AuditLog
from .serializers import AuditLogSerializer

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    Public health check endpoint returning service status.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(
            {
                "success": True,
                "message": "CLOSR backend is running",
                "service": "CLOSR API",
            },
            status=status.HTTP_200_OK,
        )


class DatabaseHealthCheckView(APIView):
    """
    Database diagnostic endpoint executing an actual query to verify database connectivity.
    Does not expose sensitive database credentials or internal exception details.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                if row and row[0] == 1:
                    db_engine = connection.settings_dict.get('ENGINE', 'unknown').split('.')[-1]
                    return Response(
                        {
                            "success": True,
                            "message": "Database connection is healthy",
                            "database": db_engine,
                        },
                        status=status.HTTP_200_OK,
                    )
            return Response(
                {
                    "success": False,
                    "message": "Database query did not return expected result",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.error("Database health check failed: %s", str(e))
            return Response(
                {
                    "success": False,
                    "message": "Database connection failed",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class AuditLogListView(generics.ListAPIView):
    """
    Read-only list of system audit logs for administrative actors.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all().order_by('-created_at')


class AnalyticsDashboardView(APIView):
    """
    Real-time analytics aggregating customers, conversations, appointments, tickets, and leads.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from customers.models import Customer
        from conversations.models import Conversation
        from appointments.models import Appointment
        from tickets.models import SupportTicket
        from crm.models import Lead

        total_customers = Customer.objects.count()
        total_conversations = Conversation.objects.count()
        open_conversations = Conversation.objects.filter(status__in=['open', 'pending']).count()
        
        total_tickets = SupportTicket.objects.count()
        open_tickets = SupportTicket.objects.filter(status__in=['open', 'in_progress']).count()
        resolved_tickets = SupportTicket.objects.filter(status='resolved').count()
        
        total_appointments = Appointment.objects.count()
        upcoming_appointments = Appointment.objects.filter(status__in=['scheduled', 'confirmed']).count()
        
        total_leads = Lead.objects.count()
        converted_leads = Lead.objects.filter(status='converted').count()
        conversion_rate = round((converted_leads / total_leads * 100), 2) if total_leads > 0 else 0.0

        return Response(
            {
                "success": True,
                "data": {
                    "customers": {
                        "total": total_customers,
                    },
                    "conversations": {
                        "total": total_conversations,
                        "open": open_conversations,
                    },
                    "tickets": {
                        "total": total_tickets,
                        "open": open_tickets,
                        "resolved": resolved_tickets,
                    },
                    "appointments": {
                        "total": total_appointments,
                        "upcoming": upcoming_appointments,
                    },
                    "leads": {
                        "total": total_leads,
                        "converted": converted_leads,
                        "conversion_rate_percent": conversion_rate,
                    },
                },
            },
            status=status.HTTP_200_OK,
        )
