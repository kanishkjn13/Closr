from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor',
            'actor_username',
            'action',
            'resource_type',
            'resource_id',
            'outcome',
            'metadata',
            'ip_address',
            'created_at',
        ]
        read_only_fields = fields
