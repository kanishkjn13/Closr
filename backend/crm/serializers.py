from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    converted_customer_id = serializers.IntegerField(source='converted_customer.id', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'company',
            'source',
            'status',
            'owner',
            'owner_name',
            'notes',
            'converted_customer',
            'converted_customer_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'converted_customer', 'created_at', 'updated_at']


class LeadConvertSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default='')
