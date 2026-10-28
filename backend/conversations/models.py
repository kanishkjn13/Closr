from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer


class Conversation(models.Model):
    CHANNEL_CHOICES = [
        ('web_chat', 'Web Chat'),
        ('email', 'Email'),
        ('phone', 'Phone Call'),
        ('manual', 'Manual Entry'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('pending', 'Pending Customer Action'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('hinglish', 'Hinglish'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='conversations')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_conversations')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web_chat')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    language = models.CharField(max_length=15, choices=LANGUAGE_CHOICES, default='en', db_index=True)
    action_state = models.JSONField(default=dict, blank=True, help_text="Multi-turn action state: intent, collected parameters, confirmation status")
    subject = models.CharField(max_length=255, default='General Inquiry')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"[{self.get_channel_display()}] {self.customer.name} - {self.subject} ({self.status})"


class Message(models.Model):
    SENDER_CHOICES = [
        ('customer', 'Customer'),
        ('agent', 'Human Agent'),
        ('ai', 'AI Assistant'),
        ('system', 'System Notification'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES, default='customer')
    sender_name = models.CharField(max_length=150, blank=True)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender_type.upper()}: {self.content[:40]}"
