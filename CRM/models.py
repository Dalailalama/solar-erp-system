# crm/models.py
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    GROUP_CHOICES = [
        ('project_type', 'Project Type'),
        ('lead_priority', 'Lead Priority'),
        ('lead_source', 'Lead Source'),
    ]
    group = models.CharField(max_length=50, choices=GROUP_CHOICES)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['group', 'order', 'name']

    def __str__(self):
        return f"[{self.group}] {self.name}"


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)

    # Dynamic categorization
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='leads', limit_choices_to={'group': 'project_type'}
    )
    priority = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='priority_leads', limit_choices_to={'group': 'lead_priority'}
    )
    
    # Keeping original fields for compatibility with raw submissions
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)

    source = models.CharField(max_length=50, default='contact_form')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    is_converted = models.BooleanField(default=False)

    assigned_to = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL
    )

    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.full_name or self.email or f"Lead #{self.pk}"


class FormSubmission(models.Model):
    form_name = models.CharField(max_length=100)   # "contact_us", "feasibility_study"
    data = models.JSONField()                      # raw payload from frontend
    lead = models.ForeignKey(
        Lead, null=True, blank=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    tags = models.JSONField(default=list, blank=True)   # ["newsletter", "solar"]
    created_at = models.DateTimeField(auto_now_add=True)
