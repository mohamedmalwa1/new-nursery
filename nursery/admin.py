# nursery/admin.py
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.html import format_html

from .models import (
    Student, Staff, Classroom, Attendance,
    MedicalRecord, Invoice, Payment,
    InventoryItem, StudentDocument,
    PayrollContract, SalaryRecord,
)

# ───────────────────────────────────────────────
# 1) Embed Staff profile inside the User form
# ───────────────────────────────────────────────
class StaffInline(admin.StackedInline):
    model = Staff
    can_delete = False
    verbose_name_plural = "Staff profile"
    fk_name = "user"                 # uses staff.user OneToOneField
    extra = 0                        # don’t show empty inline on list view

class CustomUserAdmin(UserAdmin):
    inlines = [StaffInline]

# Replace Django’s default User admin with our version
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# ───────────────────────────────────────────────
# 2) Staff admin with a “Login account” column
# ───────────────────────────────────────────────
@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display  = ("full_name", "role", "email", "login_account", "is_active")
    list_filter   = ("role", "is_active")
    search_fields = ("first_name", "last_name", "email")

    # clickable username, or ❌ if none
    def login_account(self, obj):
        if obj.user_id:
            url = reverse("admin:auth_user_change", args=[obj.user_id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return format_html('<span style="color:#d9534f;">❌ None</span>')

    login_account.short_description = "Login"

# ───────────────────────────────────────────────
# 3) Keep your original registrations untouched
# ───────────────────────────────────────────────
admin.site.register(Student)
admin.site.register(Classroom)
admin.site.register(Attendance)
admin.site.register(MedicalRecord)
admin.site.register(Invoice)
admin.site.register(Payment)
admin.site.register(InventoryItem)
admin.site.register(StudentDocument)
admin.site.register(PayrollContract)
admin.site.register(SalaryRecord)

