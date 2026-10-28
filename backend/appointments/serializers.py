from django.utils import timezone
from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    staff_member_name = serializers.CharField(source='staff_member.username', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'customer',
            'customer_name',
            'customer_email',
            'staff_member',
            'staff_member_name',
            'title',
            'start_time',
            'end_time',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        start_time = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        staff_member = attrs.get('staff_member', getattr(self.instance, 'staff_member', None))
        status_val = attrs.get('status', getattr(self.instance, 'status', 'scheduled'))

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError({"end_time": "Appointment end time must be after start time."})

            if (end_time - start_time).total_seconds() < 900:  # 15 minutes
                raise serializers.ValidationError({"end_time": "Appointment must be at least 15 minutes long."})

        # Overlap check for the staff member if not cancelled
        if staff_member and start_time and end_time and status_val != 'cancelled':
            qs = Appointment.objects.filter(
                staff_member=staff_member,
                status__in=['scheduled', 'confirmed'],
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"start_time": "The selected staff member already has an overlapping appointment in this time window."}
                )

        return attrs
