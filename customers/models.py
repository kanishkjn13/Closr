from django.db import models
from django.contrib.auth.models import User


class Customer(models.Model):
    STATUS_CHOICES = [
        ('lead', 'Lead'),
        ('active', 'Active Customer'),
        ('inactive', 'Inactive'),
        ('churned', 'Churned'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_customers')
    is_archived = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'company']),
            models.Index(fields=['status', 'is_archived']),
        ]

    def __str__(self):
        return f"{self.name} ({self.company or 'Individual'})"
