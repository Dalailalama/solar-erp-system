from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from core.models import BaseModel


class UserProfile(BaseModel):
    """
    Extended user profile information
    One-to-one relationship with Django's User model
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True)
    bio = models.TextField(blank=True, help_text="Short biography or description")
    phone = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ], blank=True)
    
    # Localization
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en', choices=[
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('hi', 'Hindi'),
        ('zh', 'Chinese'),
    ])
    
    # Social links
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    
    # System fields
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def get_full_name(self):
        return self.user.get_full_name() or self.user.username


class Department(BaseModel):
    """
    Organizational department structure with hierarchy support
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Unique department code")
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sub_departments'
    )
    manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='managed_departments'
    )
    email = models.EmailField(blank=True, help_text="Department contact email")
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
    
    def __str__(self):
        return self.name
    
    def get_all_employees(self):
        """Get all employees in this department"""
        return Employee.objects.filter(department=self, is_active=True)
    
    def get_hierarchy_path(self):
        """Get full hierarchy path"""
        path = [self.name]
        parent = self.parent
        while parent:
            path.insert(0, parent.name)
            parent = parent.parent
        return ' > '.join(path)


class Employee(BaseModel):
    """
    Employee information linked to User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    employee_id = models.CharField(max_length=50, unique=True, help_text="Unique employee identifier")
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='employees'
    )
    designation = models.CharField(max_length=100, help_text="Job title or position")
    employment_type = models.CharField(max_length=20, choices=[
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
        ('consultant', 'Consultant'),
    ], default='full_time')
    
    # Dates
    joining_date = models.DateField()
    confirmation_date = models.DateField(null=True, blank=True)
    resignation_date = models.DateField(null=True, blank=True)
    last_working_date = models.DateField(null=True, blank=True)
    
    # Reporting structure
    manager = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='subordinates'
    )
    
    # Compensation
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='USD')
    
    # Work details
    work_location = models.CharField(max_length=200, blank=True)
    work_phone = models.CharField(max_length=20, blank=True)
    work_email = models.EmailField(blank=True)
    
    # Status
    is_probation = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
        ('resigned', 'Resigned'),
    ], default='active')
    
    class Meta:
        ordering = ['employee_id']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name() or self.user.username}"
    
    def get_tenure_days(self):
        """Calculate employment tenure in days"""
        end_date = self.last_working_date or timezone.now().date()
        return (end_date - self.joining_date).days


class Address(BaseModel):
    """
    Reusable address model for users, companies, etc.
    """
    ADDRESS_TYPES = [
        ('home', 'Home'),
        ('office', 'Office'),
        ('billing', 'Billing'),
        ('shipping', 'Shipping'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='home')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    landmark = models.CharField(max_length=200, blank=True)
    
    # Geolocation
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    is_default = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.address_type.title()} - {self.city}, {self.country}"
    
    def get_full_address(self):
        """Return formatted full address"""
        parts = [
            self.address_line1,
            self.address_line2,
            self.city,
            self.state,
            self.country,
            self.postal_code
        ]
        return ', '.join(filter(None, parts))


class ContactInformation(BaseModel):
    """
    Multiple contact methods for users
    """
    CONTACT_TYPES = [
        ('phone', 'Phone'),
        ('mobile', 'Mobile'),
        ('email', 'Email'),
        ('fax', 'Fax'),
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('skype', 'Skype'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES)
    contact_value = models.CharField(max_length=200)
    label = models.CharField(max_length=50, blank=True, help_text="e.g., 'Personal', 'Work'")
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Contact Information'
        verbose_name_plural = 'Contact Information'
        ordering = ['-is_primary', 'contact_type']
    
    def __str__(self):
        return f"{self.user.username} - {self.contact_type}: {self.contact_value}"


class UserPreferences(BaseModel):
    """
    User-specific application preferences and settings
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # UI Preferences
    theme = models.CharField(max_length=20, choices=[
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ], default='light')
    
    sidebar_collapsed = models.BooleanField(default=False)
    dashboard_layout = models.JSONField(default=dict, help_text="Custom dashboard widget layout")
    
    # Notification Preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    notification_frequency = models.CharField(max_length=20, choices=[
        ('realtime', 'Real-time'),
        ('hourly', 'Hourly Digest'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
    ], default='realtime')
    
    # Display Preferences
    items_per_page = models.IntegerField(default=25, choices=[
        (10, '10'),
        (25, '25'),
        (50, '50'),
        (100, '100'),
    ])
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    time_format = models.CharField(max_length=20, default='24h', choices=[
        ('12h', '12 Hour'),
        ('24h', '24 Hour'),
    ])
    
    # Privacy
    profile_visibility = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('private', 'Private'),
        ('connections', 'Connections Only'),
    ], default='connections')
    
    class Meta:
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"{self.user.username}'s Preferences"


class LoginHistory(BaseModel):
    """
    Track user login sessions for security and analytics
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True, help_text="Desktop, Mobile, Tablet")
    browser = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True, help_text="City, Country")
    
    # Security
    login_successful = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=200, blank=True)
    is_suspicious = models.BooleanField(default=False)
    
    # Session
    session_key = models.CharField(max_length=40, blank=True)
    
    class Meta:
        verbose_name = 'Login History'
        verbose_name_plural = 'Login Histories'
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time.strftime('%Y-%m-%d %H:%M')}"
    
    def get_session_duration(self):
        """Calculate session duration"""
        if self.logout_time:
            return self.logout_time - self.login_time
        return None


class UserDocument(BaseModel):
    """
    Store user-related documents (ID proof, certificates, etc.)
    """
    DOCUMENT_TYPES = [
        ('id_proof', 'ID Proof'),
        ('address_proof', 'Address Proof'),
        ('education', 'Education Certificate'),
        ('experience', 'Experience Letter'),
        ('passport', 'Passport'),
        ('driving_license', 'Driving License'),
        ('resume', 'Resume/CV'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    document_name = models.CharField(max_length=200)
    document_file = models.FileField(upload_to='user_documents/%Y/%m/')
    document_number = models.CharField(max_length=100, blank=True, help_text="Document ID/Number")
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    issuing_authority = models.CharField(max_length=200, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'User Document'
        verbose_name_plural = 'User Documents'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.document_type}: {self.document_name}"
    
    def is_expired(self):
        """Check if document is expired"""
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False
