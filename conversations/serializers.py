from rest_framework import serializers
from .models import Conversation, Message
from customers.models import Customer


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender_type',
            'sender_name',
            'content',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), required=False)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'customer',
            'customer_name',
            'customer_email',
            'assigned_to',
            'assigned_to_name',
            'channel',
            'status',
            'language',
            'action_state',
            'subject',
            'messages_count',
            'last_message',
            'created_at',
            'updated_at',
            'closed_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                "id": last.id,
                "sender_type": last.sender_type,
                "content": last.content[:100],
                "created_at": last.created_at,
            }
        return None
