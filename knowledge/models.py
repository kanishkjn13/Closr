from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class KnowledgeArticle(models.Model):
    CATEGORY_CHOICES = [
        ('General', 'General Information'),
        ('Billing', 'Billing & Invoicing'),
        ('Technical', 'Technical Support'),
        ('Product', 'Product Features'),
        ('Policy', 'Company Policies & SLA'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    content = models.TextField(help_text="Detailed markdown or plaintext knowledge documentation")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published', db_index=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['status', 'category']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:200]
            slug = base_slug
            counter = 1
            while KnowledgeArticle.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.category}] {self.title} ({self.status})"
