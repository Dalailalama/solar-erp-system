from django.core.management.base import BaseCommand
from core.models import MenuItem

class Command(BaseCommand):
    help = 'Add Toast Demo to menu'

    def handle(self, *args, **options):
        # Create or get UI Components parent menu
        ui_components, created = MenuItem.objects.get_or_create(
            label='UI Components',
            defaults={
                'icon': 'palette',
                'route': None,
                'order': 100,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created "UI Components" menu'))
        
        # Create Toast Demo menu item
        toast_demo, created = MenuItem.objects.get_or_create(
            label='Toast Demo',
            parent=ui_components,
            defaults={
                'icon': 'bell',
                'route': '/toast-demo',
                'order': 1,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created "Toast Demo" menu item'))
        else:
            self.stdout.write(self.style.WARNING('Toast Demo menu item already exists'))
        
        self.stdout.write(self.style.SUCCESS('Menu setup complete!'))
