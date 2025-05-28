from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Sum
from .models import Student, Staff, Invoice, Attendance

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    today = now().date()

    total_students = Student.objects.count()
    total_staff = Staff.objects.count()
    total_invoices = Invoice.objects.aggregate(total=Sum('amount'))['total'] or 0
    unpaid_invoices = Invoice.objects.filter(status='UNPAID').count()

    attendance_today = Attendance.objects.filter(
        date=today,
        status='Present',
        student__isnull=False
    ).count()

    attendance_percent = round((attendance_today / total_students) * 100, 2) if total_students else 0

    return Response({
        "total_students": total_students,
        "total_staff": total_staff,
        "total_invoices": total_invoices,
        "unpaid_invoices": unpaid_invoices,
        "today_attendance": attendance_percent
    })

