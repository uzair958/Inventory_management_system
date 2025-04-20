from django.shortcuts import render
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum
from users.decorators import admin_required, manager_or_admin_required, staff_or_above_required
from .models import Product, Store, Supplier

# Create your views here.

@staff_or_above_required
def product_list(request):
    """
    Get a list of all products.
    Accessible by all authenticated users.
    """
    products = Product.objects.all()
    product_data = []
    
    for product in products:
        product_data.append({
            'id': product.id,
            'name': product.name,
            'sku': product.sku,
            'price': str(product.price),
            'quantity': product.quantity,
            'threshold': product.threshold,
            'supplier': {
                'id': product.supplier.id,
                'name': product.supplier.name
            },
            'store': {
                'id': product.store.id,
                'name': product.store.name
            },
            'is_low_stock': product.is_low_stock
        })
    
    return JsonResponse({'products': product_data})

@staff_or_above_required
def product_detail(request, product_id):
    """
    Get detailed information for a specific product.
    Accessible by all authenticated users.
    """
    product = get_object_or_404(Product, id=product_id)
    
    product_data = {
        'id': product.id,
        'name': product.name,
        'sku': product.sku,
        'description': product.description,
        'price': str(product.price),
        'quantity': product.quantity,
        'threshold': product.threshold,
        'supplier': {
            'id': product.supplier.id,
            'name': product.supplier.name,
            'contact_person': product.supplier.contact_person,
            'phone': product.supplier.phone,
            'email': product.supplier.email
        },
        'store': {
            'id': product.store.id,
            'name': product.store.name,
            'address': product.store.address
        },
        'is_low_stock': product.is_low_stock,
        'created_at': product.created_at.isoformat(),
        'updated_at': product.updated_at.isoformat()
    }
    
    return JsonResponse({'product': product_data})

@csrf_exempt
@manager_or_admin_required
def product_create(request):
    """
    Create a new product.
    Accessible by managers and admins only.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['name', 'sku', 'price', 'quantity', 'supplier_id', 'store_id']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Field {field} is required'}, status=400)
        
        # Check if SKU already exists
        if Product.objects.filter(sku=data['sku']).exists():
            return JsonResponse({'error': 'SKU already exists'}, status=400)
        
        # Get supplier and store
        supplier = get_object_or_404(Supplier, id=data['supplier_id'])
        store = get_object_or_404(Store, id=data['store_id'])
        
        # Create product
        product = Product.objects.create(
            name=data['name'],
            sku=data['sku'],
            description=data.get('description', ''),
            price=data['price'],
            quantity=data['quantity'],
            threshold=data.get('threshold', 10),
            supplier=supplier,
            store=store
        )
        
        return JsonResponse({
            'message': 'Product created successfully',
            'product': {
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'price': str(product.price),
                'quantity': product.quantity
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@manager_or_admin_required
def product_update(request, product_id):
    """
    Update an existing product.
    Accessible by managers and admins only.
    """
    if request.method != 'PUT' and request.method != 'PATCH':
        return JsonResponse({'error': 'Only PUT/PATCH methods are allowed'}, status=405)
    
    product = get_object_or_404(Product, id=product_id)
    
    try:
        data = json.loads(request.body)
        
        # Update product fields if provided in the request
        if 'name' in data:
            product.name = data['name']
        
        if 'sku' in data and data['sku'] != product.sku:
            # Check if the new SKU already exists
            if Product.objects.filter(sku=data['sku']).exists():
                return JsonResponse({'error': 'SKU already exists'}, status=400)
            product.sku = data['sku']
        
        if 'description' in data:
            product.description = data['description']
            
        if 'price' in data:
            product.price = data['price']
            
        if 'quantity' in data:
            product.quantity = data['quantity']
            
        if 'threshold' in data:
            product.threshold = data['threshold']
            
        if 'supplier_id' in data:
            supplier = get_object_or_404(Supplier, id=data['supplier_id'])
            product.supplier = supplier
            
        if 'store_id' in data:
            store = get_object_or_404(Store, id=data['store_id'])
            product.store = store
        
        product.save()
        
        return JsonResponse({
            'message': 'Product updated successfully',
            'product': {
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'price': str(product.price),
                'quantity': product.quantity,
                'is_low_stock': product.is_low_stock
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@admin_required
def product_delete(request, product_id):
    """
    Delete a product.
    Accessible by admins only.
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)
    
    product = get_object_or_404(Product, id=product_id)
    product_name = product.name
    product.delete()
    
    return JsonResponse({
        'message': f'Product "{product_name}" deleted successfully'
    })

@staff_or_above_required
def low_stock_products(request):
    """
    Get a list of products that are low in stock (below threshold).
    Accessible by all authenticated users.
    """
    products = Product.objects.all()
    low_stock = []
    
    for product in products:
        if product.is_low_stock:
            low_stock.append({
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'quantity': product.quantity,
                'threshold': product.threshold,
                'store': {
                    'id': product.store.id,
                    'name': product.store.name
                },
                'supplier': {
                    'id': product.supplier.id,
                    'name': product.supplier.name,
                    'phone': product.supplier.phone
                }
            })
    
    return JsonResponse({'low_stock_products': low_stock})

# Store views
@staff_or_above_required
def store_list(request):
    """
    Get a list of all stores.
    Accessible by all authenticated users.
    """
    stores = Store.objects.all()
    store_data = []
    
    for store in stores:
        store_data.append({
            'id': store.id,
            'name': store.name,
            'address': store.address,
            'phone': store.phone,
            'email': store.email
        })
    
    return JsonResponse({'stores': store_data})

@staff_or_above_required
def store_detail(request, store_id):
    """
    Get detailed information for a specific store.
    Accessible by all authenticated users.
    """
    store = get_object_or_404(Store, id=store_id)
    
    store_data = {
        'id': store.id,
        'name': store.name,
        'address': store.address,
        'phone': store.phone,
        'email': store.email,
        'created_at': store.created_at.isoformat(),
        'updated_at': store.updated_at.isoformat()
    }
    
    return JsonResponse({'store': store_data})

@csrf_exempt
@manager_or_admin_required
def store_create(request):
    """
    Create a new store.
    Accessible by managers and admins only.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('name') or not data.get('address'):
            return JsonResponse({'error': 'Name and address are required'}, status=400)
        
        # Create store
        store = Store.objects.create(
            name=data['name'],
            address=data['address'],
            phone=data.get('phone', ''),
            email=data.get('email', '')
        )
        
        return JsonResponse({
            'message': 'Store created successfully',
            'store': {
                'id': store.id,
                'name': store.name,
                'address': store.address
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@manager_or_admin_required
def store_update(request, store_id):
    """
    Update an existing store.
    Accessible by managers and admins only.
    """
    if request.method != 'PUT' and request.method != 'PATCH':
        return JsonResponse({'error': 'Only PUT/PATCH methods are allowed'}, status=405)
    
    store = get_object_or_404(Store, id=store_id)
    
    try:
        data = json.loads(request.body)
        
        # Update store fields if provided in the request
        if 'name' in data:
            store.name = data['name']
        
        if 'address' in data:
            store.address = data['address']
            
        if 'phone' in data:
            store.phone = data['phone']
            
        if 'email' in data:
            store.email = data['email']
        
        store.save()
        
        return JsonResponse({
            'message': 'Store updated successfully',
            'store': {
                'id': store.id,
                'name': store.name,
                'address': store.address,
                'phone': store.phone,
                'email': store.email
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@admin_required
def store_delete(request, store_id):
    """
    Delete a store.
    Accessible by admins only.
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)
    
    store = get_object_or_404(Store, id=store_id)
    
    # Check if store has products
    if Product.objects.filter(store=store).exists():
        return JsonResponse({
            'error': 'Cannot delete store because it has associated products'
        }, status=400)
    
    store_name = store.name
    store.delete()
    
    return JsonResponse({
        'message': f'Store "{store_name}" deleted successfully'
    })

# Supplier views
@staff_or_above_required
def supplier_list(request):
    """
    Get a list of all suppliers.
    Accessible by all authenticated users.
    """
    suppliers = Supplier.objects.all()
    supplier_data = []
    
    for supplier in suppliers:
        supplier_data.append({
            'id': supplier.id,
            'name': supplier.name,
            'contact_person': supplier.contact_person,
            'phone': supplier.phone,
            'email': supplier.email
        })
    
    return JsonResponse({'suppliers': supplier_data})

@staff_or_above_required
def supplier_detail(request, supplier_id):
    """
    Get detailed information for a specific supplier.
    Accessible by all authenticated users.
    """
    supplier = get_object_or_404(Supplier, id=supplier_id)
    
    supplier_data = {
        'id': supplier.id,
        'name': supplier.name,
        'contact_person': supplier.contact_person,
        'phone': supplier.phone,
        'email': supplier.email,
        'address': supplier.address,
        'created_at': supplier.created_at.isoformat(),
        'updated_at': supplier.updated_at.isoformat()
    }
    
    return JsonResponse({'supplier': supplier_data})

@csrf_exempt
@manager_or_admin_required
def supplier_create(request):
    """
    Create a new supplier.
    Accessible by managers and admins only.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('name') or not data.get('phone'):
            return JsonResponse({'error': 'Name and phone are required'}, status=400)
        
        # Create supplier
        supplier = Supplier.objects.create(
            name=data['name'],
            contact_person=data.get('contact_person', ''),
            phone=data['phone'],
            email=data.get('email', ''),
            address=data.get('address', '')
        )
        
        return JsonResponse({
            'message': 'Supplier created successfully',
            'supplier': {
                'id': supplier.id,
                'name': supplier.name,
                'phone': supplier.phone
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@manager_or_admin_required
def supplier_update(request, supplier_id):
    """
    Update an existing supplier.
    Accessible by managers and admins only.
    """
    if request.method != 'PUT' and request.method != 'PATCH':
        return JsonResponse({'error': 'Only PUT/PATCH methods are allowed'}, status=405)
    
    supplier = get_object_or_404(Supplier, id=supplier_id)
    
    try:
        data = json.loads(request.body)
        
        # Update supplier fields if provided in the request
        if 'name' in data:
            supplier.name = data['name']
        
        if 'contact_person' in data:
            supplier.contact_person = data['contact_person']
            
        if 'phone' in data:
            supplier.phone = data['phone']
            
        if 'email' in data:
            supplier.email = data['email']
            
        if 'address' in data:
            supplier.address = data['address']
        
        supplier.save()
        
        return JsonResponse({
            'message': 'Supplier updated successfully',
            'supplier': {
                'id': supplier.id,
                'name': supplier.name,
                'contact_person': supplier.contact_person,
                'phone': supplier.phone,
                'email': supplier.email
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@admin_required
def supplier_delete(request, supplier_id):
    """
    Delete a supplier.
    Accessible by admins only.
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)
    
    supplier = get_object_or_404(Supplier, id=supplier_id)
    
    # Check if supplier has products
    if Product.objects.filter(supplier=supplier).exists():
        return JsonResponse({
            'error': 'Cannot delete supplier because it has associated products'
        }, status=400)
    
    supplier_name = supplier.name
    supplier.delete()
    
    return JsonResponse({
        'message': f'Supplier "{supplier_name}" deleted successfully'
    })

@staff_or_above_required
def dashboard_overview(request):
    """
    Get an overview of the inventory system for the dashboard.
    Accessible by all authenticated users.
    """
    # Count total products, stores, and suppliers
    total_products = Product.objects.count()
    total_stores = Store.objects.count()
    total_suppliers = Supplier.objects.count()
    
    # Get low stock products count
    low_stock_count = 0
    for product in Product.objects.all():
        if product.is_low_stock:
            low_stock_count += 1
    
    # Get products per store
    store_products = []
    for store in Store.objects.all():
        store_products.append({
            'store_name': store.name,
            'product_count': Product.objects.filter(store=store).count()
        })
    
    # Get products per supplier
    supplier_products = []
    for supplier in Supplier.objects.all():
        supplier_products.append({
            'supplier_name': supplier.name,
            'product_count': Product.objects.filter(supplier=supplier).count()
        })
    
    # Calculate total inventory value
    total_value = 0
    for product in Product.objects.all():
        total_value += product.price * product.quantity
    
    return JsonResponse({
        'overview': {
            'total_products': total_products,
            'total_stores': total_stores,
            'total_suppliers': total_suppliers,
            'low_stock_count': low_stock_count,
            'total_inventory_value': str(total_value),
        },
        'store_products': store_products,
        'supplier_products': supplier_products
    })
