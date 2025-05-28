from django.core.management.base import BaseCommand
from django.utils import timezone
from nursery.models import SalaryRecord

class Command(BaseCommand):
    help = 'List staff who have unpaid salaries for the current month.'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        current_month = today.replace(day=1)

        unpaid_salaries = SalaryRecord.objects.filter(
            month=current_month,
            is_paid=False
        ).select_related('staff', 'contract')

        if not unpaid_salaries.exists():
            self.stdout.write(self.style.SUCCESS("✅ All salaries are paid for this month."))
            return

        self.stdout.write(self.style.WARNING(f"🔔 Unpaid salaries for {current_month}:\n"))

        for salary in unpaid_salaries:
            self.stdout.write(
                f"- {salary.staff.full_name} | Net: {salary.net_salary:.2f} | Base: {salary.base_salary:.2f} | "
                f"Allowance: {salary.allowance:.2f} | Contract ID: {salary.contract.id if salary.contract else 'N/A'}"
            )

        self.stdout.write(self.style.WARNING(f"\nTotal unpaid: {unpaid_salaries.count()}"))

