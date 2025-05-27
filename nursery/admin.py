
from django.contrib import admin
from .models import (
    Student, Staff, Classroom, Attendance,
    MedicalRecord, Invoice, Payment,
    InventoryItem, StudentDocument, PayrollContract, SalaryRecord,
)

admin.site.register(Student)
admin.site.register(Staff)
admin.site.register(Classroom)
admin.site.register(Attendance)
admin.site.register(MedicalRecord)
admin.site.register(Invoice)
admin.site.register(Payment)
admin.site.register(InventoryItem)
admin.site.register(StudentDocument)
admin.site.register(PayrollContract)
admin.site.register(SalaryRecord)
