from django.core.management.base import BaseCommand
from django.utils import timezone
from nursery.models import Attendance
from django.db.models import Count, Q

class Command(BaseCommand):
    help = 'Generate summary of student and staff attendance for the current month.'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        student_summary = Attendance.objects.filter(
            date__gte=month_start,
            student__isnull=False
        ).values('status').annotate(count=Count('id'))

        staff_summary = Attendance.objects.filter(
            date__gte=month_start,
            staff__isnull=False
        ).values('status').annotate(count=Count('id'))

        self.stdout.write(self.style.SUCCESS("\n📊 ATTENDANCE SUMMARY"))

        self.stdout.write(self.style.SUCCESS("\n🧑‍🎓 Students:"))
        if student_summary:
            for entry in student_summary:
                self.stdout.write(f"- {entry['status']}: {entry['count']}")
        else:
            self.stdout.write("No student attendance records this month.")

        self.stdout.write(self.style.WARNING("\n🧑‍🏫 Staff:"))
        if staff_summary:
            for entry in staff_summary:
                self.stdout.write(f"- {entry['status']}: {entry['count']}")
        else:
            self.stdout.write("No staff attendance records this month.")

        self.stdout.write(self.style.SUCCESS("\n✅ Summary Complete"))

