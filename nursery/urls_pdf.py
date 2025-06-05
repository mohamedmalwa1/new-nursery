from django.urls import path
from .views_pdf import (
    staff_pdf,
    invoices_pdf,
    invoice_single_pdf,
    students_pdf,
    attendance_students_pdf,
    attendance_staff_pdf,
    payments_pdf,
)

urlpatterns = [
    # ─── Staff PDF (bulk) ───
    path('reports/staff/pdf/', staff_pdf, name='staff_pdf'),
    path('reports/payments/pdf/', payments_pdf, name='payments_pdf'),
    path('api/reports/payments/pdf/', payments_pdf, name='api_payments_pdf'),  # New API endpoint

    # ─── Invoices PDF (bulk) ───
    path('reports/invoices/pdf/', invoices_pdf, name='invoices_pdf'),
    
    # ─── Single‐Invoice PDF ───
    path('reports/invoices/<int:pk>/pdf/', invoice_single_pdf, name='invoice_single_pdf'),

    # ─── Students PDF (bulk) ───
    path('reports/students/pdf/', students_pdf, name='students_pdf'),

    # ─── NEW: Student‐only Attendance PDF ───
    path(
        'reports/attendance/students/pdf/',
        attendance_students_pdf,
        name='attendance_students_pdf',
    ),

    # ─── NEW: Staff‐only Attendance PDF ───
    path(
        'reports/attendance/staff/pdf/',
        attendance_staff_pdf,
        name='attendance_staff_pdf',
    ),
]
