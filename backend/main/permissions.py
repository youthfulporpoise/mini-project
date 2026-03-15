from rest_framework import permissions


class RolePermission(permissions.BasePermission):
  allowed_roles = []
  
  def has_permission(self, request, view):
    return request.user.is_authenticated and request.user.role in self.allowed_roles


class IsAdmin(RolePermission):
  allowed_roles = ["ADMIN"]


class IsHOD(RolePermission):
  allowed_roles = ["HOD"]


class IsPrincipal(RolePermission):
  allowed_roles = ["PRINCIPAL"]


class IsAccountant(RolePermission):
  allowed_roles = ["ACCOUNTANT"]


class IsVendor(RolePermission):
  allowed_roles = ["VENDOR"]
