from django.core.management.base import BaseCommand
from nursery.models import InventoryItem

class Command(BaseCommand):
    help = 'Show current inventory status: in stock, assigned to staff, and assigned to students.'

    def handle(self, *args, **kwargs):
        unassigned = InventoryItem.objects.filter(staff_custodian__isnull=True, assigned_to_student__isnull=True)
        staff_assigned = InventoryItem.objects.filter(staff_custodian__isnull=False)
        student_assigned = InventoryItem.objects.filter(assigned_to_student__isnull=False)

        self.stdout.write(self.style.SUCCESS("\n📦 INVENTORY REPORT"))

        self.stdout.write(self.style.SUCCESS("\n✅ In Stock (Not Assigned):"))
        for item in unassigned:
            self.stdout.write(f"- {item.name} ({item.category}) | Qty: {item.quantity}")

        self.stdout.write(self.style.WARNING("\n🧑‍🏫 Assigned to Staff:"))
        for item in staff_assigned:
            self.stdout.write(f"- {item.name} ({item.category}) → {item.staff_custodian.full_name}")

        self.stdout.write(self.style.WARNING("\n🧒 Assigned to Students:"))
        for item in student_assigned:
            self.stdout.write(f"- {item.name} ({item.category}) → {item.assigned_to_student.full_name}")

        self.stdout.write(self.style.SUCCESS("\n✅ Report Complete"))

