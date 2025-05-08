import json
import logging
import secrets
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.conf import settings

from .models import CustomUser
from .auth import CustomAuthBackend
from .middleware import store_user_token, remove_user_token

# Set up logging
logger = logging.getLogger(__name__)

@csrf_exempt
def register_user(request):
    """
    Register a new user and return JSON response.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        # Log the raw request body for debugging
        logger.error(f"Request body: {request.body}")

        data = json.loads(request.body)
        logger.error(f"Parsed data: {data}")

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'staff')  # Default role is staff

        # Log extracted values
        logger.error(f"Username: {username}, Email: {email}, Password length: {len(password) if password else 0}")

        # Validate required fields
        if not username or not email or not password:
            return JsonResponse({'error': 'Username, email and password are required'}, status=400)

        # Check if username or email already exists
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        # Create new user
        user = CustomUser.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            role=role
        )

        # If the user is a staff member and store_ids are provided, assign them to stores
        if role == 'staff' and 'store_ids' in data and isinstance(data['store_ids'], list):
            from products.models import Store
            for store_id in data['store_ids']:
                try:
                    store = Store.objects.get(id=store_id)
                    store.employees.add(user)
                except Store.DoesNotExist:
                    pass

        # Get assigned stores for response
        assigned_stores = []
        if role == 'staff':
            for store in user.assigned_stores.all():
                assigned_stores.append({
                    'id': store.id,
                    'name': store.name
                })

        return JsonResponse({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'assigned_stores': assigned_stores
            }
        }, status=201)

    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {str(e)}")
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def login_user(request):
    """
    Authenticate a user and return JSON response with session cookie and token.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)

        # Authenticate user with custom backend
        auth_backend = CustomAuthBackend()
        user = auth_backend.authenticate(request, username=username, password=password)

        if user is None:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        # Login user (create session) with explicit backend
        login(request, user, backend='users.auth.CustomAuthBackend')

        # Generate a simple token using secrets module
        token = secrets.token_hex(32)

        # Store the token in our global dictionary
        store_user_token(user.id, token)

        return JsonResponse({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def logout_user(request):
    """
    Log out a user and return JSON response.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    # Check for token in Authorization header
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # Remove the token from our global dictionary
        remove_user_token(token)

    # Also perform regular session logout
    logout(request)

    return JsonResponse({'message': 'Logged out successfully'})

@csrf_exempt
def get_current_user(request):
    """
    Get information about the currently logged-in user.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    # Get assigned stores if user is staff
    assigned_stores = []
    if request.user.role == 'staff':
        for store in request.user.assigned_stores.all():
            assigned_stores.append({
                'id': store.id,
                'name': store.name
            })

    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': request.user.role,
            'firstName': request.user.first_name,
            'lastName': request.user.last_name,
            'assigned_stores': assigned_stores
        }
    })

@csrf_exempt
def update_profile(request):
    """
    Update the current user's profile information.
    """
    if request.method != 'PUT' and request.method != 'POST':
        return JsonResponse({'error': 'Only PUT and POST methods are allowed'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    try:
        data = json.loads(request.body)
        user = request.user

        # Update fields if provided
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'email' in data:
            # Check if email is already taken by another user
            if CustomUser.objects.exclude(id=user.id).filter(email=data['email']).exists():
                return JsonResponse({'error': 'Email already in use by another account'}, status=400)
            user.email = data['email']
        if 'phone' in data:
            # Assuming you have a phone field in your CustomUser model
            # If not, you'll need to add it or remove this part
            if hasattr(user, 'phone'):
                user.phone = data['phone']

        # Save the updated user
        user.save()

        return JsonResponse({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'firstName': user.first_name,
                'lastName': user.last_name
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def list_users(request):
    """
    Get a list of all users.
    Only accessible by admin users.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Check if user is admin
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Access denied'}, status=403)

    users = CustomUser.objects.all()
    user_data = []

    for user in users:
        user_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
            'first_name': user.first_name,
            'last_name': user.last_name
        })

    return JsonResponse({'users': user_data})

@csrf_exempt
def list_managers(request):
    """
    Get a list of all users with manager role.
    Accessible by all authenticated users.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Get all users with manager role
    managers = CustomUser.objects.filter(role='manager')
    manager_data = []

    for manager in managers:
        manager_data.append({
            'id': manager.id,
            'username': manager.username,
            'email': manager.email,
            'first_name': manager.first_name,
            'last_name': manager.last_name
        })

    return JsonResponse({'users': manager_data})

@csrf_exempt
def list_staff(request):
    """
    Get a list of all users with staff role.
    Accessible by all authenticated users.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Get all users with staff role
    staff = CustomUser.objects.filter(role='staff')
    staff_data = []

    for employee in staff:
        staff_data.append({
            'id': employee.id,
            'username': employee.username,
            'email': employee.email,
            'first_name': employee.first_name,
            'last_name': employee.last_name
        })

    return JsonResponse({'users': staff_data})

@csrf_exempt
def get_user(request, user_id):
    """
    Get details of a specific user.
    Only accessible by admin users or the user themselves.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Check if user is admin or the user themselves
    if request.user.role != 'admin' and request.user.id != user_id:
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        user = CustomUser.objects.get(id=user_id)

        # Get assigned stores if user is staff
        assigned_stores = []
        if user.role == 'staff':
            for store in user.assigned_stores.all():
                assigned_stores.append({
                    'id': store.id,
                    'name': store.name
                })

        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'assigned_stores': assigned_stores
            }
        })
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
def update_user_role(request, user_id):
    """
    Update a user's role.
    Only accessible by admin users.
    """
    if request.method != 'PUT' and request.method != 'POST':
        return JsonResponse({'error': 'Only PUT and POST methods are allowed'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Check if user is admin
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        data = json.loads(request.body)
        role = data.get('role')

        if not role:
            return JsonResponse({'error': 'Role is required'}, status=400)

        if role not in [r[0] for r in CustomUser.ROLE_CHOICES]:
            return JsonResponse({'error': f'Invalid role. Must be one of: {", ".join([r[0] for r in CustomUser.ROLE_CHOICES])}'}, status=400)

        try:
            user = CustomUser.objects.get(id=user_id)

            # Prevent non-superusers from modifying admin users
            if user.role == 'admin' and not request.user.is_superuser:
                return JsonResponse({'error': 'Only superusers can modify admin users'}, status=403)

            # If changing to staff role and store_ids are provided, assign them to stores
            if role == 'staff' and 'store_ids' in data and isinstance(data['store_ids'], list):
                from products.models import Store
                # Clear existing store assignments
                for store in user.assigned_stores.all():
                    store.employees.remove(user)

                # Add new store assignments
                for store_id in data['store_ids']:
                    try:
                        store = Store.objects.get(id=store_id)
                        store.employees.add(user)
                    except Store.DoesNotExist:
                        pass

            # If changing from staff to another role, remove from all stores
            if user.role == 'staff' and role != 'staff':
                for store in user.assigned_stores.all():
                    store.employees.remove(user)

            user.role = role
            user.save()

            # Get assigned stores for response
            assigned_stores = []
            if role == 'staff':
                for store in user.assigned_stores.all():
                    assigned_stores.append({
                        'id': store.id,
                        'name': store.name
                    })

            return JsonResponse({
                'message': 'User role updated successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'assigned_stores': assigned_stores
                }
            })
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Role update error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_user(request, user_id):
    """
    Delete a user.
    Only accessible by admin users.
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Check if user is admin
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        user = CustomUser.objects.get(id=user_id)

        # Prevent non-superusers from deleting admin users
        if user.role == 'admin' and not request.user.is_superuser:
            return JsonResponse({'error': 'Only superusers can delete admin users'}, status=403)

        # Prevent users from deleting themselves
        if user.id == request.user.id:
            return JsonResponse({'error': 'You cannot delete your own account'}, status=400)

        username = user.username
        user.delete()

        return JsonResponse({
            'message': f'User {username} deleted successfully'
        })
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"User deletion error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
