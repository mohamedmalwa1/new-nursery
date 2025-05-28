from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentViewSet, StaffViewSet, ClassroomViewSet, AttendanceViewSet,
    MedicalRecordViewSet, InvoiceViewSet, PaymentViewSet,
    InventoryItemViewSet, StudentDocumentViewSet,
    PayrollContractViewSet, SalaryRecordViewSet
)
from .dashboard_summary import dashboard_summary   # keep your summary function

router = DefaultRouter()
router.register(r'students',          StudentViewSet,          basename='student')
router.register(r'staff',             StaffViewSet,            basename='staff')
router.register(r'classrooms',        ClassroomViewSet,        basename='classroom')
router.register(r'attendance',        AttendanceViewSet,       basename='attendance')
router.register(r'medical',           MedicalRecordViewSet,    basename='medical')
router.register(r'invoices',          InvoiceViewSet,          basename='invoice')
router.register(r'payments',          PaymentViewSet,          basename='payment')
router.register(r'inventory',         InventoryItemViewSet,    basename='inventory')
router.register(r'student-documents', StudentDocumentViewSet,  basename='student-doc')
router.register(r'payroll/contracts', PayrollContractViewSet,  basename='payroll-contract')
router.register(r'payroll/salaries',  SalaryRecordViewSet,     basename='salary-record')

urlpatterns = [
    path('', include(router.urls)),                       # all CRUD endpoints
    path('dashboard/summary/', dashboard_summary),        # analytics endpoint
]

