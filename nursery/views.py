# ~/nursery-system/nursery/views.py

from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Student, Staff, Classroom, Attendance,
    MedicalRecord, Invoice, Payment,
    InventoryItem, StudentDocument,
    PayrollContract, SalaryRecord
)
from .serializers import (
    StudentSerializer, StaffSerializer, ClassroomSerializer,
    AttendanceSerializer, MedicalRecordSerializer,
    InvoiceSerializer, PaymentSerializer,
    InventoryItemSerializer, StudentDocumentSerializer,
    PayrollContractSerializer, SalaryRecordSerializer
)
from .utils.pdf import render_to_pdf  # assumes you have this helper


# ───── Full CRUD API ViewSets ───── #
class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Student.objects.select_related('classroom', 'teacher')
    serializer_class = StudentSerializer


class StaffViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Staff.objects.all().order_by('-hire_date')
    serializer_class = StaffSerializer


class ClassroomViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Classroom.objects.all().order_by('name')
    serializer_class = ClassroomSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Attendance.objects.select_related('student', 'staff').order_by('-date')
    serializer_class = AttendanceSerializer


class MedicalRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = MedicalRecord.objects.select_related('student').order_by('-date')
    serializer_class = MedicalRecordSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.select_related('student').order_by('-issue_date')
    serializer_class = InvoiceSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Payment.objects.select_related('invoice__student').order_by('-payment_date')
    serializer_class = PaymentSerializer


class InventoryItemViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = InventoryItem.objects.select_related('staff_custodian', 'assigned_to_student').order_by('name')
    serializer_class = InventoryItemSerializer


class StudentDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = StudentDocument.objects.select_related('student').order_by('-issue_date')
    serializer_class = StudentDocumentSerializer


class PayrollContractViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = PayrollContract.objects.select_related('staff').order_by('-contract_start')
    serializer_class = PayrollContractSerializer


class SalaryRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = SalaryRecord.objects.select_related('staff', 'contract').order_by('-month')
    serializer_class = SalaryRecordSerializer


# ───── Dashboard ───── #
def dashboard(request):
    today = timezone.now().date()

    students_cnt = Student.objects.count()
    staff_cnt = Staff.objects.count()
    classroom_cnt = Classroom.objects.count()
    invoice_total = Invoice.objects.aggregate(total=Sum('amount'))['total'] or 0
    unpaid_cnt = Invoice.objects.filter(status='UNPAID').count()

    present_today = Attendance.objects.filter(
        date=today, status='PRESENT', student__isnull=False
    ).count()
    attendance_pct = round((present_today / students_cnt * 100), 1) if students_cnt else 0

    inv_total = InventoryItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
    inv_low = InventoryItem.objects.filter(quantity__lt=5).count()

    recent_students = Student.objects.order_by('-created_at')[:5]
    recent_invoices = Invoice.objects.filter(status='UNPAID').order_by('-issue_date')[:5]

    context = {
        'students': students_cnt,
        'staff': staff_cnt,
        'classrooms': classroom_cnt,
        'invoice_total': invoice_total,
        'unpaid_invoices': unpaid_cnt,
        'attendance_pct': attendance_pct,
        'inventory_total': inv_total,
        'inventory_low': inv_low,
        'recent_students': recent_students,
        'recent_invoices': recent_invoices,
    }
    return render(request, 'dashboard.html', context)


# ───── Reports (PDF) ───── #
def render_pdf_response(template, context):
    pdf = render_to_pdf(template, context)
    return HttpResponse(pdf, content_type="application/pdf")


def student_report_pdf(request):
    students = Student.objects.select_related('classroom', 'teacher').all()
    return render_pdf_response("reports/student_report.html", {"students": students})


def staff_report_pdf(request):
    staff = Staff.objects.all()
    return render_pdf_response("reports/staff_report.html", {"staff": staff})


def invoice_report_pdf(request):
    invoices = Invoice.objects.select_related('student').all()
    return render_pdf_response("reports/invoice_report.html", {"invoices": invoices})


def payment_report_pdf(request):
    payments = Payment.objects.select_related('invoice__student').all()
    return render_pdf_response("reports/payment_report.html", {"payments": payments})


def medical_report_pdf(request):
    records = MedicalRecord.objects.select_related('student').all()
    return render_pdf_response("reports/medical_report.html", {"records": records})


def inventory_report_pdf(request):
    items = InventoryItem.objects.all()
    return render_pdf_response("reports/inventory_report.html", {"items": items})


def salary_report_pdf(request):
    salaries = SalaryRecord.objects.select_related('staff', 'contract').all()
    return render_pdf_response("reports/salaries_report.html", {"salaries": salaries})


def attendance_report_pdf(request):
    records = Attendance.objects.select_related("student", "staff").all()
    return render_pdf_response("reports/attendance_report.html", {"records": records})


def contract_report_pdf(request):
    contracts = PayrollContract.objects.select_related("staff").all()
    return render_pdf_response("reports/contract_report.html", {"contracts": contracts})


def document_report_pdf(request):
    documents = StudentDocument.objects.select_related("student").all()
    return render_pdf_response("reports/document_report.html", {"documents": documents})


# ───── History (so “View History” button won’t 404) ───── #
@api_view(["GET"])
def inventory_history(request, pk):
    try:
        InventoryItem.objects.get(pk=pk)
    except InventoryItem.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    # No actual history stored, return empty list for now
    return Response([])

