from ninja import Router, Schema
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.utils import timezone
from typing import List
from .models import (
    UserProfile, Department, Employee, Address, 
    ContactInformation, UserPreferences, LoginHistory, UserDocument
)
from .schemas import (
    UserProfileSchema, DepartmentSchema, EmployeeSchema,
    AddressSchema, ContactSchema, UserPreferencesSchema,
    LoginHistorySchema, UserDocumentSchema, UserPreferencesUpdateSchema
)

router = Router()


# Login Schema
class LoginSchema(Schema):
    username: str
    password: str


class LoginResponseSchema(Schema):
    code: int
    message: str
    user_id: int = None
    username: str = None


# Authentication endpoints
@router.post("/login/", response=LoginResponseSchema, tags=["Authentication"])
def login_user(request, payload: LoginSchema):
    """
    Login endpoint with response codes
    Returns: {code: 1, message: "..."} for success
             {code: 0, message: "..."} for error
    """
    user = authenticate(request, username=payload.username, password=payload.password)
    
    if user is not None:
        if user.is_active:
            login(request, user)
            
            # Track login history
            try:
                # Get client IP
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip_address = x_forwarded_for.split(',')[0]
                else:
                    ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
                
                # Get user agent
                user_agent = request.META.get('HTTP_USER_AGENT', '')
                
                # Create login history
                LoginHistory.objects.create(
                    user=user,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    login_successful=True,
                    session_key=request.session.session_key or ''
                )
            except Exception as e:
                # Don't fail login if history tracking fails
                print(f"Failed to track login history: {e}")
            
            return {
                "code": 1,  # SUCCESS
                "message": "Login successful! Welcome back.",
                "user_id": user.id,
                "username": user.username
            }
        else:
            return {
                "code": 0,  # ERROR
                "message": "Your account has been disabled. Please contact support."
            }
    else:
        # Track failed login attempt
        try:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
            
            # Try to find user by username to track failed attempt
            try:
                failed_user = User.objects.get(username=payload.username)
                LoginHistory.objects.create(
                    user=failed_user,
                    ip_address=ip_address,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    login_successful=False,
                    failure_reason="Invalid password"
                )
            except User.DoesNotExist:
                pass  # User doesn't exist, don't track
        except Exception as e:
            print(f"Failed to track failed login: {e}")
        
        return {
            "code": 0,  # ERROR
            "message": "Invalid username or password. Please try again."
        }


class LogoutResponseSchema(Schema):
    code: int
    message: str


@router.post("/logout/", response=LogoutResponseSchema, tags=["Authentication"])
def logout_user(request):
    """
    Logout the current user
    """
    from django.contrib.auth import logout
    logout(request)
    return {"code": 1, "message": "You have been successfully logged out."}


class UserSchema(Schema):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    is_superuser: bool
    permissions: List[str] = []
    groups: List[str] = []


@router.get("/user/", response=UserSchema, tags=["Authentication"])
def get_current_user(request):
    """
    Get the currently authenticated user's details with permissions
    """
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    
    user = request.user
    
    # Get user permissions
    permissions = list(user.user_permissions.values_list('codename', flat=True))
    
    # Get permissions from groups
    group_permissions = user.groups.values_list('permissions__codename', flat=True)
    permissions.extend(list(group_permissions))
    
    # Remove duplicates
    permissions = list(set(permissions))
    
    # Get group names
    groups = list(user.groups.values_list('name', flat=True))
    
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_superuser': user.is_superuser,
        'permissions': permissions,
        'groups': groups
    }


# UserProfile endpoints
@router.get("/profiles/", response=List[UserProfileSchema], tags=["User Profiles"])
def list_profiles(request):
    """List all user profiles"""
    return UserProfile.objects.select_related('user').filter(is_active=True)


@router.get("/profiles/{user_id}/", response=UserProfileSchema, tags=["User Profiles"])
def get_profile(request, user_id: int):
    """Get specific user profile"""
    return UserProfile.objects.select_related('user').get(user_id=user_id)


# Department endpoints
@router.get("/departments/", response=List[DepartmentSchema], tags=["Departments"])
def list_departments(request):
    """List all departments"""
    return Department.objects.filter(is_active=True)


@router.get("/departments/{department_id}/", response=DepartmentSchema, tags=["Departments"])
def get_department(request, department_id: int):
    """Get specific department"""
    return Department.objects.get(id=department_id)


# Employee endpoints
@router.get("/employees/", response=List[EmployeeSchema], tags=["Employees"])
def list_employees(request):
    """List all employees"""
    return Employee.objects.select_related('user', 'department').filter(is_active=True)


@router.get("/employees/{employee_id}/", response=EmployeeSchema, tags=["Employees"])
def get_employee(request, employee_id: int):
    """Get specific employee"""
    return Employee.objects.select_related('user', 'department').get(id=employee_id)


# Address endpoints
@router.get("/addresses/user/{user_id}/", response=List[AddressSchema], tags=["Addresses"])
def list_user_addresses(request, user_id: int):
    """List all addresses for a user"""
    return Address.objects.filter(user_id=user_id, is_active=True)


# Contact endpoints
@router.get("/contacts/user/{user_id}/", response=List[ContactSchema], tags=["Contacts"])
def list_user_contacts(request, user_id: int):
    """List all contacts for a user"""
    return ContactInformation.objects.filter(user_id=user_id, is_active=True)


@router.get("/login-history/user/{user_id}/", response=List[LoginHistorySchema], tags=["Login History"])
def list_login_history(request, user_id: int, limit: int = 10):
    """Get login history for a user"""
    return LoginHistory.objects.filter(user_id=user_id).order_by('-login_time')[:limit]


# User Management Endpoints
class PaginatedUserResponse(Schema):
    items: List[UserSchema]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("/users/", response=PaginatedUserResponse, tags=["User Management"])
def list_users(
    request, 
    page: int = 1, 
    page_size: int = 10, 
    search: str = None,
    sort_by: str = None,
    sort_order: str = 'asc',
    # New Filters
    role: str = None,
    status: str = None,
    date_joined: str = None
):
    """
    List users with pagination, search, and sorting.
    Compatible with DataTable component.
    """
    # Start with all users (not just active, so we can filter by status)
    users = User.objects.all().select_related('profile')
    
    # Filter: Status
    if status:
        if status.lower() == 'active':
            users = users.filter(is_active=True)
        elif status.lower() == 'inactive':
            users = users.filter(is_active=False)
        elif status.lower() == 'pending':
            users = users.filter(is_active=False) 

    # Filter: Role
    if role:
        if role.lower() == 'admin':
            users = users.filter(is_superuser=True)
        elif role.lower() == 'user':
            users = users.filter(is_superuser=False)
    
    # Filter: Date Joined
    if date_joined:
        try:
            # Validate format or let Django handle it, but catch the error
            users = users.filter(date_joined__date__gte=date_joined)
        except Exception:
            # Ignore invalid date formats instead of 500ing
            pass

    # Search
    if search:
        from django.db.models import Q
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Sort
    if sort_by:
        # Map frontend sort keys to model fields
        sort_mapping = {
            'username': 'username',
            'email': 'email',
            'last_login': 'last_login',
            'date_joined': 'date_joined',
            'status': 'is_active',      # Map 'status' to 'is_active'
            'role': 'is_superuser'      # Map 'role' to 'is_superuser' (proxy)
        }
        
        sort_field = sort_mapping.get(sort_by, 'id') # Default to id if key not found
        
        if sort_order == 'desc':
            sort_field = f'-{sort_field}'
        users = users.order_by(sort_field)
    else:
        users = users.order_by('id')
    
    # Pagination
    total = users.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    # Calculate total pages
    import math
    total_pages = math.ceil(total / page_size) if page_size > 0 else 1
    
    return {
        "items": list(users[start:end]),
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


# Profile Management
class ProfileUpdateSchema(Schema):
    first_name: str
    last_name: str
    email: str


@router.put("/profile/", tags=["User Profiles"])
def update_profile(request, payload: ProfileUpdateSchema):
    """Update current user profile"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    
    user = request.user
    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.email = payload.email
    user.save()
    
    return {"code": 1, "message": "Profile updated successfully"}


class PasswordChangeSchema(Schema):
    new_password: str
    confirm_password: str


@router.post("/change-password/", tags=["User Profiles"])
def change_password(request, payload: PasswordChangeSchema):
    """Change user password with validation"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    
    if payload.new_password != payload.confirm_password:
        return {"code": 0, "message": "Passwords do not match"}
    
    # Password validation logic
    password = payload.new_password
    if len(password) < 8:
        return {"code": 0, "message": "Password must be at least 8 characters long"}
    if not any(char.isupper() for char in password):
        return {"code": 0, "message": "Password must contain at least one uppercase letter"}
    if not any(char.islower() for char in password):
        return {"code": 0, "message": "Password must contain at least one lowercase letter"}
    if not any(char.isdigit() for char in password):
        return {"code": 0, "message": "Password must contain at least one digit"}
    if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in password):
        return {"code": 0, "message": "Password must contain at least one special character"}
    
    user = request.user
    user.set_password(payload.new_password)
    user.save()
    
    # Re-authenticate to keep session active
    login(request, user)
    
    return {"code": 1, "message": "Password changed successfully"}


# User Preferences Endpoints
@router.get("/preferences/", response=UserPreferencesSchema, tags=["User Preferences"])
def get_preferences(request):
    """Get current user's preferences"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    
    preferences, created = UserPreferences.objects.get_or_create(user=request.user)
    return preferences


@router.put("/preferences/", tags=["User Preferences"])
def update_preferences(request, payload: UserPreferencesUpdateSchema):
    """Update current user's preferences"""
    if not request.user.is_authenticated:
        return 401, {"message": "Not authenticated"}
    
    preferences, created = UserPreferences.objects.get_or_create(user=request.user)
    
    # Update fields if provided
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(preferences, attr, value)
    
    preferences.save()
    
    return {"code": 1, "message": "Preferences updated successfully"}
