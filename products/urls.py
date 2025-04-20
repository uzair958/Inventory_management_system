from django.urls import path
from . import views

urlpatterns = [
    # Product URLs
    path('products/', views.product_list, name='product_list'),
    path('products/<int:product_id>/', views.product_detail, name='product_detail'),
    path('products/create/', views.product_create, name='product_create'),
    path('products/<int:product_id>/update/', views.product_update, name='product_update'),
    path('products/<int:product_id>/delete/', views.product_delete, name='product_delete'),
    
    # Store URLs
    path('stores/', views.store_list, name='store_list'),
    path('stores/<int:store_id>/', views.store_detail, name='store_detail'),
    path('stores/create/', views.store_create, name='store_create'),
    path('stores/<int:store_id>/update/', views.store_update, name='store_update'),
    path('stores/<int:store_id>/delete/', views.store_delete, name='store_delete'),
    
    # Supplier URLs
    path('suppliers/', views.supplier_list, name='supplier_list'),
    path('suppliers/<int:supplier_id>/', views.supplier_detail, name='supplier_detail'),
    path('suppliers/create/', views.supplier_create, name='supplier_create'),
    path('suppliers/<int:supplier_id>/update/', views.supplier_update, name='supplier_update'),
    path('suppliers/<int:supplier_id>/delete/', views.supplier_delete, name='supplier_delete'),
    
    # Dashboard URLs
    path('dashboard/', views.dashboard_overview, name='dashboard_overview'),
    path('dashboard/low-stock/', views.low_stock_products, name='low_stock_products'),
] 