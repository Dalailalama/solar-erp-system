from django.contrib import admin
from .models import (
    UserProfile, Department, Employee, Address,
    ContactInformation, UserPreferences, LoginHistory, UserDocument
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'email_verified', 'phone_verified', 'two_factor_enabled', 'is_active']
    list_filter = ['email_verified', 'phone_verified', 'two_factor_enabled', 'gender', 'language', 'is_active']
    search_fields = ['user__username', 'user__email', 'phone', 'mobile']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'avatar', 'bio', 'date_of_birth', 'gender')
        }),
        ('Contact', {
            'fields': ('phone', 'mobile', 'email_verified', 'phone_verified')
        }),
        ('Localization', {
            'fields': ('timezone', 'language')
        }),
        ('Social Links', {
            'fields': ('linkedin_url', 'twitter_url', 'github_url'),
            'classes': ('collapse',)
        }),
        ('Security', {
            'fields': ('two_factor_enabled',)
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'manager', 'location', 'budget', 'is_active']
    list_filter = ['is_active', 'location']
    search_fields = ['name', 'code', 'description', 'email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description', 'parent')
        }),
        ('Management', {
            'fields': ('manager', 'budget')
        }),
        ('Contact', {
            'fields': ('email', 'phone', 'location')
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'department', 'designation', 'employment_type', 'status', 'joining_date']
    list_filter = ['employment_type', 'status', 'is_probation', 'department', 'is_active']
    search_fields = ['employee_id', 'user__username', 'user__email', 'designation', 'work_email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'joining_date'
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'department', 'designation', 'employment_type')
        }),
        ('Employment Dates', {
            'fields': ('joining_date', 'confirmation_date', 'resignation_date', 'last_working_date')
        }),
        ('Reporting', {
            'fields': ('manager',)
        }),
        ('Compensation', {
            'fields': ('salary', 'salary_currency'),
            'classes': ('collapse',)
        }),
        ('Work Details', {
            'fields': ('work_location', 'work_phone', 'work_email')
        }),
        ('Status', {
            'fields': ('is_probation', 'status')
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_type', 'city', 'state', 'country', 'is_default', 'is_active']
    list_filter = ['address_type', 'country', 'is_default', 'is_active']
    search_fields = ['user__username', 'city', 'state', 'country', 'postal_code']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user', 'address_type', 'is_default')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'landmark', 'city', 'state', 'country', 'postal_code')
        }),
        ('Geolocation', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ['user', 'contact_type', 'contact_value', 'label', 'is_primary', 'is_verified', 'is_active']
    list_filter = ['contact_type', 'is_primary', 'is_verified', 'is_active']
    search_fields = ['user__username', 'contact_value', 'label']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'theme', 'notification_frequency', 'items_per_page', 'profile_visibility']
    list_filter = ['theme', 'notification_frequency', 'profile_visibility', 'is_active']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('UI Preferences', {
            'fields': ('theme', 'sidebar_collapsed', 'dashboard_layout')
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'push_notifications', 'sms_notifications', 'notification_frequency')
        }),
        ('Display', {
            'fields': ('items_per_page', 'date_format', 'time_format')
        }),
        ('Privacy', {
            'fields': ('profile_visibility',)
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'login_time', 'logout_time', 'ip_address', 'device_type', 'login_successful', 'is_suspicious']
    list_filter = ['login_successful', 'is_suspicious', 'device_type', 'login_time']
    search_fields = ['user__username', 'ip_address', 'location']
    readonly_fields = ['created_at', 'updated_at', 'login_time']
    date_hierarchy = 'login_time'
    fieldsets = (
        ('User & Time', {
            'fields': ('user', 'login_time', 'logout_time')
        }),
        ('Device Information', {
            'fields': ('ip_address', 'user_agent', 'device_type', 'browser', 'operating_system', 'location')
        }),
        ('Security', {
            'fields': ('login_successful', 'failure_reason', 'is_suspicious')
        }),
        ('Session', {
            'fields': ('session_key',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ['user', 'document_type', 'document_name', 'document_number', 'is_verified', 'expiry_date', 'is_active']
    list_filter = ['document_type', 'is_verified', 'is_active']
    search_fields = ['user__username', 'document_name', 'document_number', 'issuing_authority']
    readonly_fields = ['created_at', 'updated_at', 'verified_at']
    date_hierarchy = 'created_at'
    fieldsets = (
        ('User & Document', {
            'fields': ('user', 'document_type', 'document_name', 'document_file')
        }),
        ('Document Details', {
            'fields': ('document_number', 'issue_date', 'expiry_date', 'issuing_authority')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_by', 'verified_at', 'verification_notes')
        }),
        ('System', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
