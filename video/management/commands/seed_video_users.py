from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create video_user group and seed admin/vinay/siya users."

    def handle(self, *args, **options):
        video_group, _ = Group.objects.get_or_create(name="video_user")

        admin, created_admin = User.objects.get_or_create(
            username="admin",
            defaults={
                "is_staff": True,
                "is_superuser": True,
                "first_name": "Admin",
                "last_name": "",
            },
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.set_password("admin@2003")
        admin.save()

        vinay, created_vinay = User.objects.get_or_create(
            username="vinay",
            defaults={
                "first_name": "Vinay",
                "last_name": "Rathod",
                "is_active": True,
            },
        )
        vinay.first_name = "Vinay"
        vinay.last_name = "Rathod"
        vinay.is_active = True
        vinay.set_password("vinay@2003")
        vinay.save()
        vinay.groups.add(video_group)

        siya, created_siya = User.objects.get_or_create(
            username="siya",
            defaults={
                "first_name": "Siya",
                "last_name": "",
                "is_active": True,
            },
        )
        siya.first_name = "Siya"
        siya.last_name = ""
        siya.is_active = True
        siya.set_password("siya@2009")
        siya.save()
        siya.groups.add(video_group)

        self.stdout.write(self.style.SUCCESS("video_user group ready"))
        self.stdout.write(
            self.style.SUCCESS(
                f"admin ({'created' if created_admin else 'updated'}), "
                f"vinay ({'created' if created_vinay else 'updated'}), "
                f"siya ({'created' if created_siya else 'updated'})"
            )
        )
