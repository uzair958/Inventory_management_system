from django.db import models
from django.utils import timezone

class Store(models.Model):
    """
    Represents a physical store location where products are stocked.
    """
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    manager = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_stores')
    employees = models.ManyToManyField('users.CustomUser', related_name='assigned_stores', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    """
    Represents a supplier who provides products to the stores.
    """
    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    stores = models.ManyToManyField(Store, related_name='suppliers', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """
    Represents a product in the inventory.
    """
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    threshold = models.IntegerField(default=10, help_text="Minimum quantity before restock alert")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def is_low_stock(self):
        """Check if the product is below the threshold quantity."""
        return self.quantity <= self.threshold
