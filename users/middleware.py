import logging
import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import login

# Set up logging
logger = logging.getLogger(__name__)

# Global dictionary to store user tokens (in a real app, this would be in a database)
# Format: {token: user_id}
USER_TOKENS = {}

class TokenAuthMiddleware:
    """
    Middleware to authenticate users via Bearer token in Authorization header.
    This is a simple implementation that works alongside Django's session authentication.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip token auth if user is already authenticated via session
        if request.user.is_authenticated:
            return self.get_response(request)

        # Check for Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Log the token for debugging
            logger.debug(f"Received token: {token}")

            # Check if token exists in our global dictionary
            user_id = USER_TOKENS.get(token)
            if user_id:
                try:
                    # Get the user from the database
                    User = get_user_model()
                    user = User.objects.get(id=user_id)

                    # Set the user on the request
                    request.user = user

                    # Log successful authentication
                    logger.debug(f"Authenticated user {user.username} via token")
                except Exception as e:
                    logger.error(f"Error authenticating token: {str(e)}")

        return self.get_response(request)

# Function to store a user's token
def store_user_token(user_id, token):
    USER_TOKENS[token] = user_id
    logger.debug(f"Stored token for user {user_id}")

# Function to remove a user's token
def remove_user_token(token):
    if token in USER_TOKENS:
        del USER_TOKENS[token]
        logger.debug(f"Removed token")
