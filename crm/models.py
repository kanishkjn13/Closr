from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer


class Lead(models.Model):
    SOURCE_CHOICES = [
        ('website', 'Website Form'),
        ('chat', 'AI Chat Interaction'),
        ('referral', 'Referral'),
        ('ad', 'Marketing Campaign'),
        ('outreach', 'Direct Outreach'),
    ]

    STATUS_CHOICES = [
        ('new', 'New Lead'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('converted', 'Converted to Customer'),
        ('lost', 'Lost / Disqualified'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=200, blank=True)
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='chat')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new', db_index=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_leads')
    notes = models.TextField(blank=True)
    converted_customer = models.OneToOneField(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='originating_lead')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'source']),
        ]

    def __str__(self):
        return f"{self.name} ({self.company or 'No Company'}) - {self.get_status_display()}"
