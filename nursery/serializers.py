from rest_framework import serializers
from .models import (
    Staff, Student, Classroom, Attendance,
    MedicalRecord, Invoice, Payment,
    InventoryItem, StudentDocument,
    PayrollContract, SalaryRecord
)

# ---------------------- STAFF ----------------------
class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'role', 'email', 'phone', 'hire_date',
            'is_active', 'document'
        ]


# ---------------------- STUDENT ----------------------
class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    age = serializers.SerializerMethodField()
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    def get_age(self, obj):
        return obj.age

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'age',
            'gender', 'date_of_birth', 'profile_image',
            'classroom', 'classroom_name',
            'teacher', 'teacher_name',
            'enrollment_date', 'enrollment_history',
            'uploaded_documents', 'evaluation_notes',
            'is_active', 'allergies', 'medical_notes',
            'guardian_name', 'guardian_contact', 'emergency_contact',
            'created_at', 'updated_at'
        ]


# ---------------------- CLASSROOM ----------------------
class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'


# ---------------------- ATTENDANCE ----------------------
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'date', 'status', 'check_in', 'check_out', 'notes',
            'student', 'student_name',
            'staff', 'staff_name'
        ]


# ---------------------- MEDICAL RECORD ----------------------
class MedicalRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'student', 'student_name',
            'record_type', 'date', 'description', 'attachment', 'resolved'
        ]


# ---------------------- INVOICE ----------------------
class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'student', 'student_name', 'issue_date', 'due_date',
            'amount', 'description', 'status',
            'is_income', 'is_expense', 'tax_percentage', 'is_purchase',
            'days_remaining', 'taxed_amount'
        ]


# ---------------------- PAYMENT ----------------------
class PaymentSerializer(serializers.ModelSerializer):
    invoice_id = serializers.IntegerField(source='invoice.id', read_only=True)
    invoice_student = serializers.CharField(source='invoice.student.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_id', 'invoice_student',
            'amount', 'payment_date', 'method', 'transaction_id'
        ]


# ---------------------- INVENTORY ----------------------
class InventoryItemSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff_custodian.full_name', read_only=True)
    student_name = serializers.CharField(source='assigned_to_student.full_name', read_only=True)

    remaining_quantity = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'name',
            'category',
            'quantity',
            'remaining_quantity',
            'unit_price',
            'total_value',
            'last_restock',
            'staff_custodian',
            'staff_name',
            'assigned_to_student',
            'student_name'
        ]

    def get_remaining_quantity(self, obj):
        return obj.remaining_quantity

    def get_total_value(self, obj):
        return obj.total_value


# ---------------------- STUDENT DOCUMENT ----------------------
class StudentDocumentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = StudentDocument
        fields = [
            'id', 'student', 'student_name',
            'doc_type', 'file', 'issue_date', 'expiration_date', 'is_expired'
        ]


# ---------------------- PAYROLL CONTRACT ----------------------
class PayrollContractSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)

    class Meta:
        model = PayrollContract
        fields = [
            'id', 'staff', 'staff_name',
            'base_salary', 'allowance', 'tax_percentage', 'max_advance',
            'contract_start', 'contract_end'
        ]


# ---------------------- SALARY RECORD ----------------------
class SalaryRecordSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    contract_id = serializers.IntegerField(source='contract.id', read_only=True)

    class Meta:
        model = SalaryRecord
        fields = [
            'id', 'staff', 'staff_name', 'contract', 'contract_id',
            'month', 'base_salary', 'allowance', 'advance_taken',
            'deductions', 'tax_applied', 'net_salary',
            'is_paid', 'payment_date', 'payment_reference',
            'created_at'
        ]

