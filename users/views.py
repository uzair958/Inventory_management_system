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

        return JsonResponse({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
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

    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': request.user.role,
            'firstName': request.user.first_name,
            'lastName': request.user.last_name
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
