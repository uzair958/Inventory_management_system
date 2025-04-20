import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ims_project.settings')
django.setup()

# Import User model after Django setup
from django.contrib.auth import get_user_model
User = get_user_model()

def create_admin_user():
    # Admin credentials
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin1234'
    
    try:
        # Check if admin user already exists
        if User.objects.filter(username=username).exists():
            print(f"Admin user '{username}' already exists. Updating password and role...")
            admin = User.objects.get(username=username)
            admin.set_password(password)
            
            # Make sure role is set
            if hasattr(admin, 'role'):
                admin.role = 'admin'
                
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
        else:
            # Create new admin user
            admin = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            
            # Set admin role
            if hasattr(admin, 'role'):
                admin.role = 'admin'
                
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            
        print(f"Admin user created/updated successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Email: {email}")
        print(f"Role: admin")
        print(f"You can now log in with these credentials.")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        # Print User model fields for debugging
        print(f"Available User model fields: {[f.name for f in User._meta.get_fields()]}")

if __name__ == '__main__':
    create_admin_user() 