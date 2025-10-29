from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    """
    Custom permission: only users with is_admin=True can create or delete polls
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsAuthenticatedUser(permissions.BasePermission):
    """
    Any authenticated user (admin or regular) can access
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
