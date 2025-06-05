# ~/nursery-system/nursery/views_pdf.py

from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.shortcuts import get_object_or_404

from weasyprint import HTML

from .models import Attendance, Student, Invoice

# … any existing imports for your other models …

# ─── Staff PDF ────────────────────────────────────────────────
def staff_pdf(request):
    # Fetch all staff with select_related if needed...
    # (Example – adapt to your model fields)
    from .models import Staff
    staff_qs = Staff.objects.all()
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/staff_report.html",
        {
            "company": company,
            "staff_list": staff_qs,
            "now": timezone.now(),
        },
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="staff_report.pdf"'
    return response

# ─── Invoices PDF (bulk) ────────────────────────────────────
def invoices_pdf(request):
    invoices = Invoice.objects.select_related("student").all()
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/invoice_report.html",
        {
            "company": company,
            "invoices": invoices,
            "now": timezone.now(),
        }
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="invoices_report.pdf"'
    return response

# ─── Single‐Invoice PDF ──────────────────────────────────────
def invoice_single_pdf(request, pk):
    invoice = get_object_or_404(Invoice.objects.select_related("student"), pk=pk)
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/invoice_single.html",
        {
            "company": company,
            "invoice": invoice,
            "now": timezone.now(),
        },
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="invoice_{invoice.id}.pdf"'
    return response

# ─── Students PDF (bulk) ─────────────────────────────────────
def students_pdf(request):
    students = Student.objects.select_related("classroom", "teacher").all()
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/student_report.html",
        {
            "company": company,
            "students": students,
            "now": timezone.now(),
        }
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="students_report.pdf"'
    return response

# ─── NEW: Student‐only Attendance PDF ─────────────────────────
def attendance_students_pdf(request):
    student_records = Attendance.objects.select_related("student").filter(student__isnull=False)
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/attendance_students_report.html",
        {
            "company": company,
            "records": student_records,
            "now": timezone.now(),
        }
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="student_attendance_report.pdf"'
    return response

# ─── NEW: Staff‐only Attendance PDF ───────────────────────────
def attendance_staff_pdf(request):
    staff_records = Attendance.objects.select_related("staff").filter(staff__isnull=False)
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    html_string = render_to_string(
        "reports/attendance_staff_report.html",
        {
            "company": company,
            "records": staff_records,
            "now": timezone.now(),
        }
    )
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="staff_attendance_report.pdf"'
    return response
# ─── Payments PDF (bulk) ──────────────────────────────────────
def payments_pdf(request):
    # Get payments with fully related data
    payments = Payment.objects.select_related(
        'invoice',
        'invoice__student'
    ).order_by('-payment_date')
    
    # Calculate summary values
    total_amount = sum(p.amount for p in payments)
    payment_count = payments.count()
    paid_count = sum(1 for p in payments if p.invoice.status == 'PAID')
    unpaid_count = sum(1 for p in payments if p.invoice.status == 'UNPAID')
    
    company = {
        "name": "PP Nursery Management",
        "logo_url": "/static/images/company_logo.png",
        "address": "123 Nursery Street, Dubai, UAE",
        "email": "info@ppnursery.com",
        "phone": "+971-4-123-4567",
    }
    
    context = {
        "company": company,
        "payments": payments,
        "total_amount": total_amount,
        "payment_count": payment_count,
        "paid_count": paid_count,
        "unpaid_count": unpaid_count,
        "now": timezone.now(),
    }
    
    html_string = render_to_string("reports/payments_report.html", context)
    html = HTML(string=html_string)
    pdf_bytes = html.write_pdf()
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="payments_report.pdf"'
    return response
    
