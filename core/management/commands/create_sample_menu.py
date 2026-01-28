from django.core.management.base import BaseCommand
from core.models import MenuItem

class Command(BaseCommand):
    help = 'Create sample menu items'
    
    def handle(self, *args, **kwargs):
        # Dashboard
        dashboard = MenuItem.objects.create(label='Dashboard', icon='dashboard', route='/dashboard', order=1)
        
        # Sales
        sales = MenuItem.objects.create(label='Sales', icon='sales', order=2)
        MenuItem.objects.create(label='Customers', route='/sales/customers', parent=sales, order=1)
        MenuItem.objects.create(label='Orders', route='/sales/orders', parent=sales, order=2)
        MenuItem.objects.create(label='Invoices', route='/sales/invoices', parent=sales, order=3)
        
        # Inventory
        inventory = MenuItem.objects.create(label='Inventory', icon='inventory', order=3)
        MenuItem.objects.create(label='Products', route='/inventory/products', parent=inventory, order=1)
        categories = MenuItem.objects.create(label='Categories', parent=inventory, order=2)
        MenuItem.objects.create(label='Main Categories', route='/inventory/categories/main', parent=categories, order=1)
        MenuItem.objects.create(label='Sub Categories', route='/inventory/categories/sub', parent=categories, order=2)
        
        self.stdout.write(self.style.SUCCESS('Sample menu created successfully!'))
