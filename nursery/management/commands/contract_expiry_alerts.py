from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from nursery.models import PayrollContract

class Command(BaseCommand):
    help = 'Show payroll contracts expiring within 30 or 60 days.'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        in_30_days = today + timedelta(days=30)
        in_60_days = today + timedelta(days=60)

        contracts_30 = PayrollContract.objects.filter(contract_end__range=[today, in_30_days])
        contracts_60 = PayrollContract.objects.filter(contract_end__range=[in_30_days + timedelta(days=1), in_60_days])

        self.stdout.write(self.style.SUCCESS("\n📅 CONTRACT EXPIRY ALERTS"))

        if not contracts_30 and not contracts_60:
            self.stdout.write("✅ No contracts expiring in the next 60 days.")
            return

        if contracts_30:
            self.stdout.write(self.style.WARNING("\n⚠️ Expiring in 30 days:"))
            for contract in contracts_30:
                self.stdout.write(f"- {contract.staff.full_name} | Role: {contract.staff.role} | Ends: {contract.contract_end}")

        if contracts_60:
            self.stdout.write(self.style.NOTICE("\n🕒 Expiring in 31–60 days:"))
            for contract in contracts_60:
                self.stdout.write(f"- {contract.staff.full_name} | Role: {contract.staff.role} | Ends: {contract.contract_end}")

        self.stdout.write(self.style.SUCCESS("\n✅ Check complete"))

