from rest_framework import serializers
from .models import SupportTicket
from customers.models import Customer


class SupportTicketSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), required=False)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'customer',
            'customer_name',
            'customer_email',
            'conversation',
            'subject',
            'description',
            'priority',
            'status',
            'category',
            'assigned_to',
            'assigned_to_name',
            'internal_notes',
            'is_escalated',
            'escalation_reason',
            'created_at',
            'updated_at',
            'resolved_at',
        ]
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at']


class TicketEscalateSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True)
    assigned_to = serializers.IntegerField(required=False, allow_null=True)
    priority = serializers.ChoiceField(choices=SupportTicket.PRIORITY_CHOICES, default='urgent')
