from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import (
    Student, Staff, Classroom, Attendance, MedicalRecord,
    Invoice, Payment, InventoryItem, StudentDocument,
    PayrollContract, SalaryRecord
)

from .serializers import (
    StudentSerializer, StaffSerializer, ClassroomSerializer, AttendanceSerializer,
    MedicalRecordSerializer, InvoiceSerializer, PaymentSerializer,
    InventoryItemSerializer, StudentDocumentSerializer, PayrollContractSerializer,
    SalaryRecordSerializer
)

# ───── Generic full-CRUD viewsets ─────
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

