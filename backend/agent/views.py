import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import GeminiAgentService
from .serializers import AIChatRequestSerializer
from customers.models import Customer
from conversations.models import Conversation, Message
from core.models import AuditLog
from core.permissions import is_clinic_staff

logger = logging.getLogger(__name__)


class AIChatView(APIView):
    """
    Submits a message to the OPERA AI Clinic Operations Agent.
    Supports English, Hindi, and Hinglish.
    Maintains persistent multi-turn action states for confirmed bookings, rescheduling, and cancellations.
    Enforces medical emergency safeguards and strict patient data isolation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AIChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_text = serializer.validated_data['message']
        conv_id = serializer.validated_data.get('conversation_id')
        cust_id = serializer.validated_data.get('customer_id')

        user = request.user
        is_staff = is_clinic_staff(user)
        user_email = (user.email or '').lower()

        # 1. Resolve Customer & enforce patient isolation
        customer = None
        if cust_id:
            customer = Customer.objects.filter(pk=cust_id).first()
            if customer and not is_staff and customer.email.lower() != user_email:
                return Response(
                    {"detail": "You do not have permission to access another patient's data."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # 2. Resolve Conversation & enforce patient isolation
        conversation = None
        if conv_id:
            conversation = Conversation.objects.select_related('customer').filter(pk=conv_id).first()
            if not conversation:
                return Response(
                    {"success": False, "message": "Conversation not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not is_staff and conversation.customer.email.lower() != user_email:
                return Response(
                    {"detail": "You do not have permission to access this conversation."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            customer = conversation.customer

        if not conversation:
            if not customer:
                customer, _ = Customer.objects.get_or_create(
                    email=user.email or f"{user.username}@opera-ai.local",
                    defaults={
                        'name': user.get_full_name() or user.username,
                        'company': 'Clinic Patient',
                        'status': 'active',
                    }
                )
            conversation = Conversation.objects.create(
                customer=customer,
                channel='web_chat',
                status='open',
                subject=user_text[:60] if user_text else 'Clinic Chat Session',
            )

        # 3. Persist Incoming Patient Message
        Message.objects.create(
            conversation=conversation,
            sender_type='customer',
            sender_name=customer.name if customer else user.username,
            content=user_text,
        )

        # 4. Invoke OPERA AI Agent Service Layer
        agent = GeminiAgentService()
        result = agent.process_message(
            user_message=user_text,
            customer=conversation.customer,
            conversation=conversation,
        )

        # 5. Persist Assistant Response
        ai_message = Message.objects.create(
            conversation=conversation,
            sender_type='ai',
            sender_name='OPERA AI Clinic Agent',
            content=result['response'],
            metadata={
                'intent': result['intent'],
                'sentiment': result['sentiment'],
                'language': result.get('language', 'en'),
                'tools_executed': result['tools_executed'],
                'sources': result['sources'],
                'action_state': result.get('action_state', {}),
            },
        )

        # 6. Update Conversation State and Language
        conversation.language = result.get('language', conversation.language)
        conversation.action_state = result.get('action_state', {})
        if result['requires_escalation']:
            conversation.status = 'pending'

        conversation.save(update_fields=['language', 'action_state', 'status', 'updated_at'])

        AuditLog.objects.create(
            actor=user,
            action='AI_INTERACTION',
            resource_type='Conversation',
            resource_id=str(conversation.id),
            outcome='success',
            metadata={
                'intent': result['intent'],
                'language': result.get('language', 'en'),
                'is_emergency': result.get('is_emergency', False),
            },
        )

        return Response(
            {
                "success": True,
                "conversation_id": conversation.id,
                "message": result['response'],
                "intent": result['intent'],
                "sentiment": result['sentiment'],
                "language": result.get('language', 'en'),
                "action_state": result.get('action_state', {}),
                "sources": result['sources'],
                "tools_executed": result['tools_executed'],
                "requires_escalation": result['requires_escalation'],
                "is_emergency": result.get('is_emergency', False),
            },
            status=status.HTTP_200_OK,
        )


class AIToolRegistryView(APIView):
    """
    Returns the catalog of registered server-side tools available to the AI Agent.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tools = [
            {
                "name": "search_knowledge_base",
                "description": "Searches verified clinic knowledge articles (operating hours, fees, doctors, and policies).",
                "parameters": {"query": "string"},
            },
            {
                "name": "check_appointment_availability",
                "description": "Calculates real available consultation time slots during clinic hours (09:00 - 18:00, Mon-Sat).",
                "parameters": {"date": "string (YYYY-MM-DD)", "staff_id": "integer"},
            },
            {
                "name": "book_appointment",
                "description": "Atomically books a consultation slot with select_for_update locking after explicit confirmation.",
                "parameters": {"doctor_id": "integer", "start_time": "ISO 8601 string", "end_time": "ISO 8601 string"},
            },
            {
                "name": "reschedule_appointment",
                "description": "Atomically reschedules an existing appointment to a new slot with verification.",
                "parameters": {"appointment_id": "integer", "new_start_time": "ISO 8601 string"},
            },
            {
                "name": "cancel_appointment",
                "description": "Cancels an upcoming appointment in accordance with clinic policy.",
                "parameters": {"appointment_id": "integer", "reason": "string"},
            },
            {
                "name": "escalate_to_human",
                "description": "Escalates conversation to a human clinic operations manager and generates a support ticket.",
                "parameters": {"customer_id": "integer", "reason": "string"},
            },
        ]
        return Response({"success": True, "tools": tools}, status=status.HTTP_200_OK)
