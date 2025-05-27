from django.urls import path, include
from . import auth_views  # ✅ Imports your token/refresh views
from .views import (
    StaffListView, StudentListView, ClassroomListView,
    AttendanceListView, MedicalRecordListView, InvoiceListView,
    PaymentListView, InventoryItemListView, StudentDocumentListView,
    PayrollContractListView, SalaryRecordListView
)

urlpatterns = [
    # ✅ Authentication (from auth_views.py)
    path('auth/', include(auth_views)),

    # ✅ Core Modules
    path('staff/', StaffListView.as_view(), name='staff-list'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('classrooms/', ClassroomListView.as_view(), name='classroom-list'),

    # ✅ Attendance & Health
    path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('medical/', MedicalRecordListView.as_view(), name='medical-list'),

    # ✅ Finance
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('payments/', PaymentListView.as_view(), name='payment-list'),

    # ✅ Inventory & Documents
    path('inventory/', InventoryItemListView.as_view(), name='inventory-list'),
    path('student-documents/', StudentDocumentListView.as_view(), name='student-doc-list'),

    # ✅ Payroll
    path('payroll/contracts/', PayrollContractListView.as_view(), name='payroll-contract-list'),
    path('payroll/salaries/', SalaryRecordListView.as_view(), name='salary-record-list'),
]

