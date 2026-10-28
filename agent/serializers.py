from rest_framework import serializers


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    customer_id = serializers.IntegerField(required=False, allow_null=True)


class AIChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    conversation_id = serializers.IntegerField()
    message = serializers.CharField()
    intent = serializers.CharField()
    sentiment = serializers.CharField()
    sources = serializers.ListField(child=serializers.DictField())
    tools_executed = serializers.ListField(child=serializers.DictField())
    requires_escalation = serializers.BooleanField()
