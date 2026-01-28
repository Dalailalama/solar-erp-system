import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from accounts.models import UserProfile, Employee, Department
from django.utils import timezone

class Command(BaseCommand):
    help = 'Populate database with test users'

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, nargs='?', default=10000, help='Number of users to create')

    def handle(self, *args, **options):
        count = options['count']
        
        self.stdout.write(f'Creating {count} users...')

        # Create Departments if none exist
        departments = list(Department.objects.all())
        if not departments:
            dept_names = ['Sales', 'Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'IT', 'Support']
            departments = [Department.objects.create(name=d, code=d[:3].upper()) for d in dept_names]
            self.stdout.write(f'Created {len(departments)} departments')

        batch_size = 100 
        
        job_titles = ['Manager', 'Developer', 'Designer', 'Analyst', 'Consultant', 'Specialist', 'Coordinator']
        
        for i in range(0, count, batch_size):
            # Atomic transaction for the batch
            with transaction.atomic():
                current_batch = min(batch_size, count - i)
                self.stdout.write(f'Processing batch {i} to {i+current_batch}...')
                
                timestamp = int(timezone.now().timestamp())
                
                for j in range(current_batch):
                    # Deterministic data
                    suffix = f"{timestamp}_{i}_{j}"
                    username = f"user_{suffix}"
                    email = f"{username}@example.com"
                    
                    # Create User
                    user = User(username=username, email=email, is_active=True)
                    user.set_password('password123')
                    user.save()

                    # Create Profile
                    UserProfile.objects.create(
                        user=user,
                        bio="Bio placeholder text.",
                        mobile=f"+1555{random.randint(1000000, 9999999)}",
                        language='en'
                    )
                    
                    # Create Employee
                    dept = random.choice(departments)
                    days_ago = random.randint(0, 365*5)
                    join_date = timezone.now().date() - timedelta(days=days_ago)
                    
                    Employee.objects.create(
                        user=user,
                        employee_id=f"EMP{user.id:06d}",
                        department=dept,
                        designation=random.choice(job_titles),
                        joining_date=join_date,
                        salary=random.randint(50000, 150000),
                        status=random.choice(['active', 'active', 'active', 'on_leave'])
                    )
                
                self.stdout.write(f'Completed batch: {i + current_batch} / {count} users created')

        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} users'))
