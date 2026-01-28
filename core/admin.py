from django.contrib import admin
from .models import MenuItem, Role, UserRole, Company, AuditLog, Notification, Attachment

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['label', 'parent', 'route', 'order', 'is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['label', 'route']
    ordering = ['order', 'label']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    filter_horizontal = ['permissions']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'email', 'phone']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']

admin.site.register(UserRole)
admin.site.register(AuditLog)
admin.site.register(Attachment)
