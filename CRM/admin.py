from django.contrib import admin
from .models import Category, Lead, FormSubmission, Subscriber

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'slug', 'order', 'is_active')
    list_filter = ('group', 'is_active')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'source')
    search_fields = ('full_name', 'email', 'phone')
    readonly_fields = ('created_at', 'extra_data')

@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('form_name', 'lead', 'created_at')
    readonly_fields = ('data', 'created_at')

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('email', 'name')
