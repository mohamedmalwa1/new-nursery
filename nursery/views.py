from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .models import (
    Staff, Student, Classroom, Attendance,
    MedicalRecord, Invoice, Payment,
    InventoryItem, StudentDocument,
    PayrollContract, SalaryRecord
)
from .serializers import (
    StaffSerializer, StudentSerializer, ClassroomSerializer,
    AttendanceSerializer, MedicalRecordSerializer, InvoiceSerializer,
    PaymentSerializer, InventoryItemSerializer, StudentDocumentSerializer,
    PayrollContractSerializer, SalaryRecordSerializer
)

# ------------------ STAFF ------------------
class StaffListView(ListAPIView):
    queryset = Staff.objects.all().order_by('-hire_date')
    serializer_class = StaffSerializer

# ------------------ STUDENT ------------------
class StudentListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.select_related('classroom', 'teacher').order_by('-created_at')
    serializer_class = StudentSerializer

# ------------------ CLASSROOM ------------------
class ClassroomListView(ListAPIView):
    queryset = Classroom.objects.all().order_by('name')
    serializer_class = ClassroomSerializer

# ------------------ ATTENDANCE ------------------
class AttendanceListView(ListAPIView):
    queryset = Attendance.objects.select_related('student', 'staff').order_by('-date')
    serializer_class = AttendanceSerializer

# ------------------ MEDICAL ------------------
class MedicalRecordListView(ListAPIView):
    queryset = MedicalRecord.objects.select_related('student').order_by('-date')
    serializer_class = MedicalRecordSerializer

# ------------------ INVOICE ------------------
class InvoiceListView(ListAPIView):
    queryset = Invoice.objects.select_related('student').order_by('-issue_date')
    serializer_class = InvoiceSerializer

# ------------------ PAYMENT ------------------
class PaymentListView(ListAPIView):
    queryset = Payment.objects.select_related('invoice__student').order_by('-payment_date')
    serializer_class = PaymentSerializer

# ------------------ INVENTORY ------------------
class InventoryItemListView(ListAPIView):
    queryset = InventoryItem.objects.select_related('staff_custodian', 'assigned_to_student').order_by('name')
    serializer_class = InventoryItemSerializer

# ------------------ STUDENT DOCUMENT ------------------
class StudentDocumentListView(ListAPIView):
    queryset = StudentDocument.objects.select_related('student').order_by('-issue_date')
    serializer_class = StudentDocumentSerializer

# ------------------ PAYROLL CONTRACT ------------------
class PayrollContractListView(ListAPIView):
    queryset = PayrollContract.objects.select_related('staff').order_by('-contract_start')
    serializer_class = PayrollContractSerializer

# ------------------ SALARY RECORD ------------------
class SalaryRecordListView(ListAPIView):
    queryset = SalaryRecord.objects.select_related('staff', 'contract').order_by('-month')
    serializer_class = SalaryRecordSerializer


class StaffListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

