from django.core.management.base import BaseCommand
from django.utils import timezone
from nursery.models import PayrollContract, SalaryRecord

class Command(BaseCommand):
    help = 'Generate monthly salary records for all staff with active payroll contracts.'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        current_month = today.replace(day=1)
        created_count = 0
        skipped_count = 0

        contracts = PayrollContract.objects.select_related('staff').all()

        for contract in contracts:
            staff = contract.staff

            # Skip if already created for this month
            if SalaryRecord.objects.filter(staff=staff, month=current_month).exists():
                self.stdout.write(f"Skipped: {staff.full_name} (already exists for {current_month})")
                skipped_count += 1
                continue

            # Calculate tax
            gross = contract.base_salary + contract.allowance
            tax_amount = gross * (contract.tax_percentage / 100)
            net = gross - tax_amount

            # Create salary record
            SalaryRecord.objects.create(
                staff=staff,
                contract=contract,
                month=current_month,
                base_salary=contract.base_salary,
                allowance=contract.allowance,
                advance_taken=0.00,
                deductions=0.00,
                tax_applied=contract.tax_percentage,
                net_salary=net,
                is_paid=False
            )

            self.stdout.write(self.style.SUCCESS(f"Created: {staff.full_name} - {net:.2f}"))
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"\n✅ Salary generation complete: {created_count} created, {skipped_count} skipped"))

