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

def store_manager_or_admin_required(view_func):
    """
    Decorator to check if the user is an admin or the manager of the specific store.
    For store-specific operations where only the store's manager or an admin should have access.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        # Admins have access to all stores
        if request.user.role == 'admin':
            return view_func(request, *args, **kwargs)

        # For managers, check if they are assigned to the store
        if request.user.role == 'manager':
            # Get store_id from URL parameters
            store_id = kwargs.get('store_id')

            # If no store_id in URL, check if it's in the request body for POST/PUT/PATCH
            if not store_id and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    import json
                    data = json.loads(request.body)
                    store_id = data.get('store_id')
                except:
                    pass

            # If we have a store_id, check if the manager is assigned to this store
            if store_id:
                from products.models import Store
                try:
                    store = Store.objects.get(id=store_id)
                    if store.manager and store.manager.id == request.user.id:
                        return view_func(request, *args, **kwargs)
                except Store.DoesNotExist:
                    pass

            return JsonResponse({'error': 'Access denied. You can only edit stores that you manage. Please contact an administrator if you need access to this store.'}, status=403)

        # Staff and other roles don't have access
        return JsonResponse({'error': 'Access denied'}, status=403)

    return wrapper