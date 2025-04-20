from functools import wraps
from django.http import JsonResponse

def role_required(allowed_roles):
    """
    Decorator to restrict access to views based on user roles.
    
    Args:
        allowed_roles: List of role names that are allowed to access the view.
    
    Returns:
        Decorator function that checks if the current user has one of the allowed roles.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Check if user is authenticated
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            # Check if user has one of the allowed roles
            if request.user.role not in allowed_roles:
                return JsonResponse({'error': 'Access denied'}, status=403)
            
            # User has permission, proceed with the view
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Convenience decorators for specific roles
def admin_required(view_func):
    """Decorator to restrict access to admin users only."""
    return role_required(['admin'])(view_func)

def manager_or_admin_required(view_func):
    """Decorator to restrict access to manager and admin users only."""
    return role_required(['admin', 'manager'])(view_func)

def staff_or_above_required(view_func):
    """Decorator that allows all authenticated users to access the view."""
    return role_required(['admin', 'manager', 'staff'])(view_func) 