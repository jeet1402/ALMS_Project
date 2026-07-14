# backend/library_app/permissions.py
from rest_framework import permissions


class IsLibrarian(permissions.BasePermission):
    """Allows access only to authenticated staff users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsLibrarianOrReadOnly(permissions.BasePermission):
    """Anyone can read (GET/HEAD/OPTIONS); only staff can write."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
