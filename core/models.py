from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Abstract base model for all ERP models
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='%(class)s_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='%(class)s_updated')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True

# Menu management model
class MenuItem(BaseModel):
    """Store navigation menu structure"""
    label = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    route = models.CharField(max_length=200, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.IntegerField(default=0)
    permission = models.CharField(max_length=100, blank=True, help_text="Required permission to view this menu")
    
    class Meta:
        ordering = ['order', 'label']
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'
    
    def __str__(self):
        return self.label
    
    def get_children(self):
        return MenuItem.objects.filter(parent=self, is_active=True).order_by('order')

# Role-based access control
class Role(BaseModel):
    """Custom roles for RBAC"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField('auth.Permission', blank=True)
    
    def __str__(self):
        return self.name

class UserRole(BaseModel):
    """Assign roles to users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['user', 'role']
    
    def __str__(self):
        return f"{self.user.username} - {self.role.name}"

# Company/Organization settings
class Company(BaseModel):
    """Multi-tenant support"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    class Meta:
        verbose_name_plural = 'Companies'
    
    def __str__(self):
        return self.name

# Audit logging
class AuditLog(models.Model):
    """Track all changes"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE
    model_name = models.CharField(max_length=100)
    object_id = models.IntegerField()
    changes = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name}"

# Notification system
class Notification(BaseModel):
    """User notifications"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    ], default='info')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

# File attachments
class Attachment(BaseModel):
    """Reusable file attachment model"""
    file = models.FileField(upload_to='attachments/%Y/%m/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.filename
