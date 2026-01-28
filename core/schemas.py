from ninja import Schema
from typing import Optional, List
from datetime import datetime

class MenuItemSchema(Schema):
    id: int
    label: str
    icon: Optional[str] = None
    route: Optional[str] = None
    parent_id: Optional[int] = None
    order: int
    has_children: bool = False
    
    @staticmethod
    def resolve_has_children(obj):
        return obj.get_children().exists()

class NotificationSchema(Schema):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

class UserSchema(Schema):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
