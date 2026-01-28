from ninja import Schema
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class UserSchema(Schema):
    """Basic user information"""
    id: int
    username: str
    email: str
    first_name: str
    last_name: str


class UserProfileSchema(Schema):
    """User profile schema"""
    id: int
    user: UserSchema
    phone: Optional[str] = None
    mobile: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    timezone: str
    language: str
    email_verified: bool
    phone_verified: bool
    two_factor_enabled: bool
    created_at: datetime
    updated_at: datetime


class DepartmentSchema(Schema):
    """Department schema"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[Decimal] = None
    is_active: bool
    created_at: datetime


class EmployeeSchema(Schema):
    """Employee schema"""
    id: int
    user: UserSchema
    employee_id: str
    department: Optional[DepartmentSchema] = None
    designation: str
    employment_type: str
    joining_date: date
    status: str
    is_probation: bool
    work_location: Optional[str] = None
    work_email: Optional[str] = None
    created_at: datetime


class AddressSchema(Schema):
    """Address schema"""
    id: int
    address_type: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: str
    landmark: Optional[str] = None
    is_default: bool
    created_at: datetime


class ContactSchema(Schema):
    """Contact information schema"""
    id: int
    contact_type: str
    contact_value: str
    label: Optional[str] = None
    is_primary: bool
    is_verified: bool
    created_at: datetime


class UserPreferencesSchema(Schema):
    """User preferences schema"""
    id: int
    theme: str
    sidebar_collapsed: bool
    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool
    notification_frequency: str
    items_per_page: int
    date_format: str
    time_format: str
    profile_visibility: str


class UserPreferencesUpdateSchema(Schema):
    """Schema for updating user preferences"""
    theme: Optional[str] = None
    sidebar_collapsed: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    notification_frequency: Optional[str] = None
    items_per_page: Optional[int] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    profile_visibility: Optional[str] = None


class LoginHistorySchema(Schema):
    """Login history schema"""
    id: int
    login_time: datetime
    logout_time: Optional[datetime] = None
    ip_address: str
    device_type: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    location: Optional[str] = None
    login_successful: bool


class UserDocumentSchema(Schema):
    """User document schema"""
    id: int
    document_type: str
    document_name: str
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    is_verified: bool
    verified_at: Optional[datetime] = None
    created_at: datetime
