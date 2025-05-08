from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('me/', views.get_current_user, name='current_user'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('users/', views.list_users, name='list_users'),
    path('managers/', views.list_managers, name='list_managers'),
    path('staff/', views.list_staff, name='list_staff'),
    path('users/<int:user_id>/', views.get_user, name='get_user'),
    path('users/<int:user_id>/role/', views.update_user_role, name='update_user_role'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
]