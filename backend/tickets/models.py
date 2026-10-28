import uuid
from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer
from conversations.models import Conversation


class SupportTicket(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    CATEGORY_CHOICES = [
        ('billing', 'Billing & Payments'),
        ('technical', 'Technical Issue'),
        ('inquiry', 'General Inquiry'),
        ('escalation', 'Human Escalation'),
    ]

    ticket_number = models.CharField(max_length=30, unique=True, editable=False, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tickets')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='inquiry')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    internal_notes = models.TextField(blank=True)
    is_escalated = models.BooleanField(default=False, db_index=True)
    escalation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['priority', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TIK-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.ticket_number}] {self.subject} ({self.status})"
