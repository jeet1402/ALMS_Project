# backend/library_app/permissions.py
from rest_framework import permissions

class IsLibrarian(permissions.BasePermission):
    """
    Allows access only to authenticated users who are staff members.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff
