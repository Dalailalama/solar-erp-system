from ninja import Router
from ninja.security import django_auth
from typing import List
from django.contrib.auth.models import User
from .models import MenuItem, Notification
from .schemas import MenuItemSchema, NotificationSchema

router = Router(tags=['Core'])

@router.get('/menu', response=List[MenuItemSchema])
def get_menu(request):
    """Get menu items for current user"""
    # Filter based on user permissions
    menu_items = MenuItem.objects.filter(parent=None, is_active=True)
    return menu_items

@router.get('/menu/{menu_id}/children', response=List[MenuItemSchema])
def get_menu_children(request, menu_id: int):
    """Get children of a menu item"""
    children = MenuItem.objects.filter(parent_id=menu_id, is_active=True)
    return children

@router.get('/notifications', response=List[NotificationSchema], auth=django_auth)
def get_notifications(request):
    """Get user notifications"""
    notifications = Notification.objects.filter(
        user=request.user,
        is_active=True
    )[:10]
    return notifications

@router.post('/notifications/{notification_id}/read')
def mark_notification_read(request, notification_id: int):
    """Mark notification as read"""
    notification = Notification.objects.get(id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return {"success": True}
