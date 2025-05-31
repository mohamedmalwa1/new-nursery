# nursery/dashboard_summary.py
#
# Single responsibility: return the numbers the React dashboard needs.
# No authentication yet (AllowAny) – tighten later when JWT is re-enabled.

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Sum

from .models import (
    Student,
    Staff,
    Invoice,
    Attendance,
    InventoryItem,
)


@api_view(["GET"])
@permission_classes([AllowAny])  # temporary – keep endpoints public
def dashboard_summary(request):
    """Return key metrics for the dashboard cards & chart."""

    today = now().date()

    # ── Students / Staff ────────────────────────────────────────────────────
    students_cnt = Student.objects.count()
    staff_cnt = Staff.objects.count()

    # ── Finance ─────────────────────────────────────────────────────────────
    invoice_total = Invoice.objects.aggregate(t=Sum("amount"))["t"] or 0
    unpaid_cnt = Invoice.objects.filter(status="UNPAID").count()

    # ── Attendance (today) ──────────────────────────────────────────────────
    present_today = Attendance.objects.filter(
        date=today, status="PRESENT", student__isnull=False
    ).count()
    attendance_pct = (
        round((present_today / students_cnt) * 100, 1) if students_cnt else 0
    )

    # ── Inventory insight ───────────────────────────────────────────────────
    inv_total = InventoryItem.objects.aggregate(q=Sum("quantity"))["q"] or 0
    inv_low = InventoryItem.objects.filter(quantity__lt=5).count()  # threshold < 5

    # ── Response ────────────────────────────────────────────────────────────
    return Response(
        {
            "students": students_cnt,
            "staff": staff_cnt,
            "attendance_pct": attendance_pct,
            "total_invoices": float(invoice_total),
            "unpaid_invoices": unpaid_cnt,
            "inventory_total": inv_total,
            "inventory_low": inv_low,
        }
    )

