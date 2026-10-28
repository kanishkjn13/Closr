from rest_framework import permissions


def is_clinic_staff(user):
    """
    Returns True if user is a clinic staff member or admin.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    if hasattr(user, 'profile') and user.profile.role in ['admin', 'agent'] and user.is_staff:
        return True
    return False


class IsStaffUser(permissions.BasePermission):
    """
    Allows access only to staff members or administrators.
    """

    def has_permission(self, request, view):
        return is_clinic_staff(request.user)


class IsStaffOrOwner(permissions.BasePermission):
    """
    Object-level permission: Patients/Customers can only access their own records.
    Staff and Admins have access to assigned/all records.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff and Admins have full access
        if is_clinic_staff(request.user):
            return True

        user_email = (request.user.email or '').lower()

        # Customer/Patient entity check
        if hasattr(obj, 'email') and hasattr(obj, 'name') and not hasattr(obj, 'customer'):
            return (obj.email.lower() == user_email)

        # Entity linked to customer (Conversation, Appointment, SupportTicket)
        if hasattr(obj, 'customer') and obj.customer:
            cust_email = (obj.customer.email or '').lower()
            if cust_email and cust_email == user_email:
                return True

        # Directly linked user/staff
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'staff_member') and obj.staff_member == request.user:
            return True
        if hasattr(obj, 'assigned_to') and obj.assigned_to == request.user:
            return True

        return False
