from django.contrib import admin
from .models import Product, Store, Supplier

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'quantity', 'threshold', 'is_low_stock', 'supplier', 'store')
    list_filter = ('supplier', 'store', 'created_at')
    search_fields = ('name', 'sku', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'sku', 'description', 'price')
        }),
        ('Inventory', {
            'fields': ('quantity', 'threshold')
        }),
        ('Relationships', {
            'fields': ('supplier', 'store')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone', 'email')
    search_fields = ('name', 'address', 'phone', 'email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'email')
    search_fields = ('name', 'contact_person', 'phone', 'email', 'address')
    readonly_fields = ('created_at', 'updated_at')
