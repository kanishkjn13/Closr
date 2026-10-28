from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'company',
            'status',
            'tags',
            'notes',
            'assigned_to',
            'assigned_to_name',
            'is_archived',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        instance = getattr(self, 'instance', None)
        qs = Customer.objects.filter(email__iexact=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return value.lower()
