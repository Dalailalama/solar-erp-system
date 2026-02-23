from django.core.management.base import BaseCommand
from CRM.models import Category

class Command(BaseCommand):
    help = 'Populates initial CRM categories'

    def handle(self, *args, **options):
        # Project Types
        project_types = [
            ('residential', 'Residential Solar', 10),
            ('commercial', 'Commercial Solar', 20),
            ('maintenance', 'Solar Maintenance', 30),
            ('other', 'Other Inquiry', 40),
        ]

        for slug, name, order in project_types:
            obj, created = Category.objects.get_or_create(
                slug=slug,
                group='project_type',
                defaults={'name': name, 'order': order}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
            else:
                self.stdout.write(f'Category already exists: {name}')

        # Lead Priorities
        priorities = [
            ('low', 'Low', 10),
            ('medium', 'Medium', 20),
            ('high', 'High', 30),
            ('urgent', 'Urgent', 40),
        ]

        for slug, name, order in priorities:
            obj, created = Category.objects.get_or_create(
                slug=slug,
                group='lead_priority',
                defaults={'name': name, 'order': order}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created priority: {name}'))
