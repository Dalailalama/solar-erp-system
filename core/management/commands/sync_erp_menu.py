from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import MenuItem


class Command(BaseCommand):
    help = 'Create/update ERP navigation buttons in main menu'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Syncing ERP menu items...')

        # Top-level pages
        self._upsert_menu(
            label='Dashboard',
            defaults={'icon': 'home', 'route': '/dashboard', 'order': 1},
        )
        self._upsert_menu(
            label='My Profile',
            defaults={'icon': 'user', 'route': '/profile', 'order': 2},
        )
        self._upsert_menu(
            label='User Management',
            defaults={'icon': 'users', 'route': '/accounts/users', 'order': 3},
        )
        self._upsert_menu(
            label='Settings',
            defaults={'icon': 'cog', 'route': '/accounts/settings', 'order': 4},
        )

        examples_parent = self._upsert_menu(
            label='Framework Examples',
            defaults={'icon': 'flask', 'route': None, 'order': 50},
        )

        # Child example pages
        self._upsert_menu(
            label='Search & Filter',
            parent=examples_parent,
            defaults={'icon': 'search', 'route': '/examples/search-filter', 'order': 1},
        )
        self._upsert_menu(
            label='Virtual Scroll',
            parent=examples_parent,
            defaults={'icon': 'rocket', 'route': '/examples/virtual-scroll', 'order': 2},
        )
        self._upsert_menu(
            label='Form Validation',
            parent=examples_parent,
            defaults={'icon': 'check-double', 'route': '/examples/validation', 'order': 3},
        )
        self._upsert_menu(
            label='Collaboration',
            parent=examples_parent,
            defaults={'icon': 'users-cog', 'route': '/examples/collaboration', 'order': 4},
        )

        self.stdout.write(self.style.SUCCESS('ERP menu sync complete.'))

    def _upsert_menu(self, label, defaults, parent=None):
        item, created = MenuItem.objects.get_or_create(
            label=label,
            parent=parent,
            defaults={**defaults, 'is_active': True},
        )

        changed = False
        for key, value in defaults.items():
            if getattr(item, key) != value:
                setattr(item, key, value)
                changed = True

        if item.is_active is not True:
            item.is_active = True
            changed = True

        if changed:
            item.save(update_fields=[*defaults.keys(), 'is_active'])

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created: {label}'))
        elif changed:
            self.stdout.write(self.style.WARNING(f'Updated: {label}'))
        else:
            self.stdout.write(f'Unchanged: {label}')

        return item
