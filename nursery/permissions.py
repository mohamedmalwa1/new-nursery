# nursery/permissions.py
"""
Central place for all role-based permissions.

Usage
-----
from nursery import permissions

class ClassroomViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdmin | permissions.IsManager]
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


# ────────────────────────────────────────────────────────────────
#  HELPER  — fetch the Staff.role linked to request.user
# ────────────────────────────────────────────────────────────────
def _get_staff_role(user):
    """
    Returns role string such as 'TEACHER', 'ADMIN', etc.,
    or None if the user isn't linked to a Staff row.
    Works with either `.staff` (default OneToOne)
    or `.staff_profile` (if you set related_name).
    """
    if not user or not user.is_authenticated:
        return None
    staff_obj = getattr(user, "staff", None) or getattr(user, "staff_profile", None)
    return getattr(staff_obj, "role", None)


# ────────────────────────────────────────────────────────────────
#  BASE CLASS  — you can inherit to make new roles quickly
# ────────────────────────────────────────────────────────────────
class HasRole(BasePermission):
    """
    Allow access if request.user.staff.role is in `required_roles`.

    Example:
        class IsTeacher(HasRole):
            required_roles = {"TEACHER"}
    """
    required_roles: set[str] = set()

    def has_permission(self, request, view):
        # Superusers bypass all role checks
        if request.user and request.user.is_superuser:
            return True

        return _get_staff_role(request.user) in self.required_roles


# ────────────────────────────────────────────────────────────────
#  COMMON ROLES  — extend ROLES list from your Staff model
# ────────────────────────────────────────────────────────────────
class IsAdmin(HasRole):
    required_roles = {"ADMIN"}


class IsManager(HasRole):
    required_roles = {"MANAGER"}


class IsTeacher(HasRole):
    required_roles = {"TEACHER"}


class IsAccountant(HasRole):
    required_roles = {"ACCOUNTANT"}


class IsNurse(HasRole):
    required_roles = {"NURSE"}


class IsAccountantOrAdmin(HasRole):
    required_roles = {"ADMIN", "ACCOUNTANT"}


# ────────────────────────────────────────────────────────────────
#  READ-ONLY FOR EVERYONE, WRITE FOR ADMINS
#  (handy for standard list/detail views)
# ────────────────────────────────────────────────────────────────
class ReadOnlyUnlessAdmin(BasePermission):
    """
    GET / HEAD / OPTIONS are open to any authenticated user.
    POST / PUT / PATCH / DELETE require ADMIN role.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return _get_staff_role(request.user) == "ADMIN"

