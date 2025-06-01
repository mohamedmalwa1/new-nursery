from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .dashboard_summary import dashboard_summary

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'staff', views.StaffViewSet)
router.register(r'classrooms', views.ClassroomViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'medical', views.MedicalRecordViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'inventory', views.InventoryItemViewSet)
router.register(r'student-documents', views.StudentDocumentViewSet)
router.register(r'payroll/contracts', views.PayrollContractViewSet)
router.register(r'payroll/salaries', views.SalaryRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/summary/', dashboard_summary),  # Dashboard route
    # PDF report endpoints (all defined)
    path('reports/students/pdf/', views.student_report_pdf, name='student_report_pdf'),
    path('reports/staff/pdf/', views.staff_report_pdf, name='staff_report_pdf'),
    path('reports/invoices/pdf/', views.invoice_report_pdf, name='invoice_report_pdf'),
    path('reports/payments/pdf/', views.payment_report_pdf, name='payment_report_pdf'),
    path('reports/medical/pdf/', views.medical_report_pdf, name='medical_report_pdf'),
    path('reports/inventory/pdf/', views.inventory_report_pdf, name='inventory_report_pdf'),
    path('reports/salaries/pdf/', views.salary_report_pdf, name='salary_report_pdf'),
    path('reports/attendance/pdf/', views.attendance_report_pdf, name='attendance_report_pdf'),
    path('reports/contracts/pdf/', views.contract_report_pdf, name='contract_report_pdf'),
    path('reports/documents/pdf/', views.document_report_pdf, name='document_report_pdf'),
]
