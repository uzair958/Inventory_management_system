from django.contrib.auth.hashers import check_password
from django.conf import settings
from .models import CustomUser

class CustomAuthBackend:
    """
    Custom authentication backend for the Inventory Management System.
    Authenticates users using username and password without Django's built-in auth system.
    """
    
    def authenticate(self, request, username=None, password=None):
        """
        Authenticate a user based on username and password.
        """
        if not username or not password:
            return None
        
        try:
            user = CustomUser.objects.get(username=username)
            if check_password(password, user.password):
                if user.is_active:
                    return user
        except CustomUser.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user.
            check_password(password, 'pbkdf2_sha256$600000$unusedhashplaceholder$')
        
        return None
    
    def get_user(self, user_id):
        """
        Retrieve a user by their primary key.
        """
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None 