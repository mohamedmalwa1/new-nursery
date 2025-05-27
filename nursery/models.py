from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


# ---------------------- CLASSROOM ----------------------
class Classroom(models.Model):
    GRADE_LEVELS = [
        ('INFANT', 'Infant (0-1)'),
        ('TODDLER', 'Toddler (1-2)'),
        ('PRESCHOOL', 'Preschool (3-4)'),
        ('PRE_K', 'Pre-K (4-5)')
    ]

    name = models.CharField(max_length=100)
    grade_level = models.CharField(max_length=20, choices=GRADE_LEVELS)
    capacity = models.PositiveIntegerField()
    teacher = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_grade_level_display()} - {self.name}"


# ---------------------- STUDENT ----------------------
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

# Assuming these already exist above:
# - Classroom
# - Staff

class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]

    # Personal Information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    profile_image = models.ImageField(upload_to='students/profiles/', null=True, blank=True)

    # Academic
    classroom = models.ForeignKey('Classroom', on_delete=models.SET_NULL, null=True, related_name='students')
    teacher = models.ForeignKey('Staff', on_delete=models.SET_NULL, null=True, related_name='assigned_students')
    enrollment_date = models.DateField(default=timezone.now)
    enrollment_history = models.TextField(blank=True, help_text="Previous classrooms, e.g., 'Infant 2022 → Toddler 2023'")

    # Documents
    uploaded_documents = models.FileField(upload_to='students/documents/', null=True, blank=True)

    # Evaluation
    evaluation_notes = models.TextField(blank=True, help_text="Summarized observations, strengths, or notes.")

    # Status
    is_active = models.BooleanField(default=True)

    # Health
    allergies = models.TextField(blank=True)
    medical_notes = models.TextField(blank=True)

    # Guardian
    guardian_name = models.CharField(max_length=100)
    guardian_contact = models.CharField(max_length=20)
    emergency_contact = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['classroom', 'is_active'])
        ]

    def __str__(self):
        return f"{self.full_name} ({self.classroom})"



# ---------------------- STAFF ----------------------
class Staff(models.Model):
    ROLES = [
        ('TEACHER', 'Teacher'),
        ('ASSISTANT', 'Assistant'),
        ('ADMIN', 'Administrator'),
        ('SUPPORT', 'Support Staff')
    ]

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLES)
    hire_date = models.DateField(default=timezone.now)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    document = models.FileField(upload_to='staff/documents/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-hire_date']
        verbose_name_plural = 'Staff'

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"


# ---------------------- ATTENDANCE ----------------------
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('SICK', 'Sick')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='attendances')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, null=True, blank=True, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = [('student', 'date'), ('staff', 'date')]
        ordering = ['-date']
        verbose_name_plural = 'Attendance Records'

    def clean(self):
        if self.date > timezone.now().date():
            raise ValidationError("Attendance date cannot be in the future")
        if not self.student and not self.staff:
            raise ValidationError("Attendance must be linked to a student or a staff member.")

    def __str__(self):
        target = self.student or self.staff
        return f"{target} - {self.date} ({self.status})"



# ---------------------- MEDICAL RECORD ----------------------
class MedicalRecord(models.Model):
    RECORD_TYPES = [
        ('ALLERGY', 'Allergy'),
        ('MEDICATION', 'Medication'),
        ('TREATMENT', 'Treatment'),
        ('VACCINATION', 'Vaccination')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='medical_records')
    record_type = models.CharField(max_length=20, choices=RECORD_TYPES)
    date = models.DateField(default=timezone.now)
    description = models.TextField()
    attachment = models.FileField(upload_to='medical_records/', blank=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.student} - {self.get_record_type_display()} ({self.date})"


# ---------------------- INVOICE ----------------------
class Invoice(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('UNPAID', 'Unpaid'),
        ('PARTIAL', 'Partially Paid')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='UNPAID')

    # Business Logic
    is_income = models.BooleanField(default=True)
    is_expense = models.BooleanField(default=False)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_purchase = models.BooleanField(default=False)

    @property
    def days_remaining(self):
        return (self.due_date - timezone.now().date()).days

    @property
    def taxed_amount(self):
        if self.tax_percentage:
            return self.amount + (self.amount * self.tax_percentage / 100)
        return self.amount

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"Invoice #{self.id} - {self.student} ({self.status})"


# ---------------------- PAYMENT ----------------------
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Credit/Debit Card'),
        ('TRANSFER', 'Bank Transfer')
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(default=timezone.now)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment #{self.id} - {self.invoice}"


# ---------------------- INVENTORY ----------------------
class InventoryItem(models.Model):
    CATEGORIES = [
        ('UNIFORM', 'Uniform'),
        ('BOOK', 'Book'),
        ('STATIONERY', 'Stationery'),
        ('TOY', 'Toy'),
        ('EQUIPMENT', 'Equipment'),
        ('ASSET', 'Asset'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    quantity = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    last_restock = models.DateField(null=True, blank=True)

    # Custody
    staff_custodian = models.ForeignKey('Staff', on_delete=models.SET_NULL, null=True, blank=True, related_name='custodied_items')
    assigned_to_student = models.ForeignKey('Student', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_items')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"



# ---------------------- STUDENT DOCUMENT ----------------------
class StudentDocument(models.Model):
    DOC_TYPES = [
        ('BIRTH_CERT', 'Birth Certificate'),
        ('MEDICAL', 'Medical Record'),
        ('CONSENT', 'Consent Form'),
        ('OTHER', 'Other')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=20, choices=DOC_TYPES)
    file = models.FileField(upload_to='student_documents/')
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)

    @property
    def is_expired(self):
        if self.expiration_date:
            return timezone.now().date() > self.expiration_date
        return False

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.student} - {self.get_doc_type_display()}"


#Payroll Contract
class PayrollContract(models.Model):
    staff = models.OneToOneField('Staff', on_delete=models.CASCADE, related_name='payroll_contract')
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    max_advance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    contract_start = models.DateField()
    contract_end = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.staff.full_name} Payroll Contract"

#Salary Record
class SalaryRecord(models.Model):
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='salary_records')
    contract = models.ForeignKey('PayrollContract', on_delete=models.SET_NULL, null=True, blank=True)
    month = models.DateField(help_text="Use first day of month, e.g. 2024-05-01")
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    advance_taken = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_applied = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    payment_reference = models.ForeignKey('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='salary_links')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['staff', 'month']
        ordering = ['-month']

    def __str__(self):
        return f"{self.staff.full_name} – {self.month.strftime('%B %Y')} – Net: {self.net_salary}"

