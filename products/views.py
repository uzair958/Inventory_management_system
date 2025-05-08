from django.shortcuts import render
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum
from users.decorators import admin_required, manager_or_admin_required, staff_or_above_required, store_manager_or_admin_required
from .models import Product, Store, Supplier

# Create your views here.

@staff_or_above_required
def product_list(request):
    """
    Get a list of all products.
    Accessible by all authenticated users.
    Can filter by store_id using query parameter.
    """
    # Get query parameters
    store_id = request.GET.get('store_id')

    # Filter products by store if store_id is provided
    if store_id:
        products = Product.objects.filter(store_id=store_id)
    else:
        # Filter based on user role
        if request.user.role == 'admin':
            # Admins see all products
            products = Product.objects.all()
        elif request.user.role == 'manager':
            # Managers only see products from stores they manage
            managed_stores = Store.objects.filter(manager=request.user)
            products = Product.objects.filter(store__in=managed_stores)
        else:
            # Staff only see products from stores they are assigned to
            assigned_stores = request.user.assigned_stores.all()
            products = Product.objects.filter(store__in=assigned_stores)

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
    Accessible by all authenticated users, but managers can only view products in their stores.
    """
    product = get_object_or_404(Product, id=product_id)

    # Check if user has access to this product based on their role
    if request.user.role == 'admin':
        # Admins have access to all products
        pass
    elif request.user.role == 'manager':
        # Managers can only access products from stores they manage
        if not product.store.manager or product.store.manager.id != request.user.id:
            return JsonResponse({'error': 'Access denied. You can only view products from stores that you manage.'}, status=403)
    else:
        # Staff can only access products from stores they are assigned to
        if not request.user.assigned_stores.filter(id=product.store.id).exists():
            return JsonResponse({'error': 'Access denied. You can only view products from stores that you are assigned to.'}, status=403)

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
    Accessible by managers (for their stores only) and admins.
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

        # Check if the user is a manager and if they manage the store for this product
        if request.user.role == 'manager':
            store_id = data.get('store_id')
            try:
                store = Store.objects.get(id=store_id)
                if not store.manager or store.manager.id != request.user.id:
                    return JsonResponse({'error': 'Access denied. You can only add products to stores that you manage. Please contact an administrator if you need access to this store.'}, status=403)
            except Store.DoesNotExist:
                return JsonResponse({'error': 'Store not found'}, status=404)

        # Check if SKU already exists
        if Product.objects.filter(sku=data['sku']).exists():
            return JsonResponse({'error': 'SKU already exists'}, status=400)

        # Get supplier and store
        supplier = get_object_or_404(Supplier, id=data['supplier_id'])
        store = get_object_or_404(Store, id=data['store_id'])

        # Validate that the supplier serves the store
        if not supplier.stores.filter(id=store.id).exists():
            return JsonResponse({'error': 'The selected supplier does not serve the selected store'}, status=400)

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
    Accessible by managers (for their stores only) and admins.
    """
    if request.method != 'PUT' and request.method != 'PATCH':
        return JsonResponse({'error': 'Only PUT/PATCH methods are allowed'}, status=405)

    product = get_object_or_404(Product, id=product_id)

    # Check if the user is a manager and if they manage the store this product belongs to
    if request.user.role == 'manager':
        if not product.store.manager or product.store.manager.id != request.user.id:
            return JsonResponse({'error': 'Access denied. You can only edit products from stores that you manage. Please contact an administrator if you need access to this product.'}, status=403)

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

        # Handle supplier and store updates with validation
        new_supplier = None
        new_store = None

        if 'supplier_id' in data:
            new_supplier = get_object_or_404(Supplier, id=data['supplier_id'])

        if 'store_id' in data:
            new_store = get_object_or_404(Store, id=data['store_id'])

        # If both supplier and store are being updated, validate their relationship
        if new_supplier and new_store:
            if not new_supplier.stores.filter(id=new_store.id).exists():
                return JsonResponse({'error': 'The selected supplier does not serve the selected store'}, status=400)
            product.supplier = new_supplier
            product.store = new_store
        # If only supplier is being updated, validate with existing store
        elif new_supplier:
            if not new_supplier.stores.filter(id=product.store.id).exists():
                return JsonResponse({'error': 'The selected supplier does not serve the current store'}, status=400)
            product.supplier = new_supplier
        # If only store is being updated, validate with existing supplier
        elif new_store:
            if not product.supplier.stores.filter(id=new_store.id).exists():
                return JsonResponse({'error': 'The current supplier does not serve the selected store'}, status=400)
            product.store = new_store

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
    Managers only see products from their stores.
    """
    # Filter based on user role
    if request.user.role == 'admin':
        # Admins see all products
        products = Product.objects.all()
    elif request.user.role == 'manager':
        # Managers only see products from stores they manage
        managed_stores = Store.objects.filter(manager=request.user)
        products = Product.objects.filter(store__in=managed_stores)
    else:
        # Staff only see products from stores they are assigned to
        assigned_stores = request.user.assigned_stores.all()
        products = Product.objects.filter(store__in=assigned_stores)

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
    Managers see only stores they manage.
    Staff see only stores they are assigned to.
    Admins see all stores.
    """
    # Filter stores based on user role
    if request.user.role == 'admin':
        # Admins see all stores
        stores = Store.objects.all()
    elif request.user.role == 'manager':
        # Managers see only stores they manage
        stores = Store.objects.filter(manager=request.user)
    else:
        # Staff see only stores they are assigned to
        stores = request.user.assigned_stores.all()

    store_data = []

    for store in stores:
        store_info = {
            'id': store.id,
            'name': store.name,
            'address': store.address,
            'phone': store.phone,
            'email': store.email,
            'productCount': Product.objects.filter(store=store).count()  # Add product count
        }

        # Add manager information if available
        if store.manager:
            store_info['manager'] = {
                'id': store.manager.id,
                'username': store.manager.username,
                'name': f"{store.manager.first_name} {store.manager.last_name}".strip() or store.manager.username
            }
            store_info['manager_id'] = store.manager.id

        # Add suppliers information
        suppliers = store.suppliers.all()
        if suppliers:
            store_info['suppliers'] = []
            store_info['supplier_ids'] = []
            for supplier in suppliers:
                store_info['suppliers'].append({
                    'id': supplier.id,
                    'name': supplier.name
                })
                store_info['supplier_ids'].append(supplier.id)

        store_data.append(store_info)

    return JsonResponse({'stores': store_data})

@staff_or_above_required
def store_detail(request, store_id):
    """
    Get detailed information for a specific store.
    Accessible by all authenticated users with proper permissions.
    Managers can only view stores they manage.
    Staff can only view stores they are assigned to.
    Admins can view all stores.
    """
    store = get_object_or_404(Store, id=store_id)

    # Check if user has access to this store
    if request.user.role == 'admin':
        # Admins have access to all stores
        pass
    elif request.user.role == 'manager':
        # Managers can only access stores they manage
        if store.manager != request.user:
            return JsonResponse({'error': 'Access denied. You can only view stores that you manage.'}, status=403)
    else:
        # Staff can only access stores they are assigned to
        if not request.user.assigned_stores.filter(id=store_id).exists():
            return JsonResponse({'error': 'Access denied. You can only view stores that you are assigned to.'}, status=403)

    store_data = {
        'id': store.id,
        'name': store.name,
        'address': store.address,
        'phone': store.phone,
        'email': store.email,
        'created_at': store.created_at.isoformat(),
        'updated_at': store.updated_at.isoformat(),
        'productCount': Product.objects.filter(store=store).count()  # Add product count
    }

    # Add manager information if available
    if store.manager:
        store_data['manager'] = {
            'id': store.manager.id,
            'username': store.manager.username,
            'email': store.manager.email,
            'first_name': store.manager.first_name,
            'last_name': store.manager.last_name
        }
        store_data['manager_id'] = store.manager.id

    # Add suppliers information
    suppliers = store.suppliers.all()
    if suppliers:
        store_data['suppliers'] = []
        store_data['supplier_ids'] = []
        for supplier in suppliers:
            store_data['suppliers'].append({
                'id': supplier.id,
                'name': supplier.name
            })
            store_data['supplier_ids'].append(supplier.id)

    # Add employees information
    employees = store.employees.all()
    if employees:
        store_data['employees'] = []
        store_data['employee_ids'] = []
        for employee in employees:
            store_data['employees'].append({
                'id': employee.id,
                'username': employee.username,
                'name': f"{employee.first_name} {employee.last_name}".strip() or employee.username
            })
            store_data['employee_ids'].append(employee.id)

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

        # Set manager if provided
        if data.get('manager_id'):
            from users.models import CustomUser
            try:
                manager = CustomUser.objects.get(id=data['manager_id'])
                if manager.role == 'manager':
                    store.manager = manager
                    store.save()
            except CustomUser.DoesNotExist:
                pass

        # Set employees if provided
        if data.get('employee_ids') and isinstance(data['employee_ids'], list):
            from users.models import CustomUser
            # Clear existing employees first
            store.employees.clear()
            # Add new employees
            for employee_id in data['employee_ids']:
                try:
                    employee = CustomUser.objects.get(id=employee_id, role='staff')
                    store.employees.add(employee)
                except CustomUser.DoesNotExist:
                    pass

        store_response = {
            'id': store.id,
            'name': store.name,
            'address': store.address,
            'productCount': 0  # New store, so no products yet
        }

        # Add manager information if available
        if store.manager:
            store_response['manager'] = {
                'id': store.manager.id,
                'username': store.manager.username,
                'name': f"{store.manager.first_name} {store.manager.last_name}".strip() or store.manager.username
            }
            store_response['manager_id'] = store.manager.id

        return JsonResponse({
            'message': 'Store created successfully',
            'store': store_response
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@store_manager_or_admin_required
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

        # Update manager if provided
        if 'manager_id' in data:
            if data['manager_id']:
                from users.models import CustomUser
                try:
                    manager = CustomUser.objects.get(id=data['manager_id'])
                    if manager.role == 'manager':
                        store.manager = manager
                    else:
                        return JsonResponse({'error': 'Selected user is not a manager'}, status=400)
                except CustomUser.DoesNotExist:
                    return JsonResponse({'error': 'Manager not found'}, status=404)
            else:
                # If manager_id is empty, remove the manager
                store.manager = None

        # Update employees if provided
        if 'employee_ids' in data and isinstance(data['employee_ids'], list):
            from users.models import CustomUser
            # Clear existing employees first
            store.employees.clear()
            # Add new employees
            for employee_id in data['employee_ids']:
                try:
                    employee = CustomUser.objects.get(id=employee_id, role='staff')
                    store.employees.add(employee)
                except CustomUser.DoesNotExist:
                    pass

        store.save()

        store_response = {
            'id': store.id,
            'name': store.name,
            'address': store.address,
            'phone': store.phone,
            'email': store.email,
            'productCount': Product.objects.filter(store=store).count()  # Add product count
        }

        # Add manager information if available
        if store.manager:
            store_response['manager'] = {
                'id': store.manager.id,
                'username': store.manager.username,
                'name': f"{store.manager.first_name} {store.manager.last_name}".strip() or store.manager.username
            }
            store_response['manager_id'] = store.manager.id

        # Add employees information
        employees = store.employees.all()
        if employees:
            store_response['employees'] = []
            store_response['employee_ids'] = []
            for employee in employees:
                store_response['employees'].append({
                    'id': employee.id,
                    'username': employee.username,
                    'name': f"{employee.first_name} {employee.last_name}".strip() or employee.username
                })
                store_response['employee_ids'].append(employee.id)

        return JsonResponse({
            'message': 'Store updated successfully',
            'store': store_response
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
        supplier_info = {
            'id': supplier.id,
            'name': supplier.name,
            'contact_person': supplier.contact_person,
            'phone': supplier.phone,
            'email': supplier.email,
            'productCount': Product.objects.filter(supplier=supplier).count()  # Add product count
        }

        # Add basic store information
        stores = supplier.stores.all()
        if stores:
            supplier_info['stores'] = []
            supplier_info['store_ids'] = []
            for store in stores:
                supplier_info['stores'].append({
                    'id': store.id,
                    'name': store.name
                })
                supplier_info['store_ids'].append(store.id)

        supplier_data.append(supplier_info)

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
        'updated_at': supplier.updated_at.isoformat(),
        'productCount': Product.objects.filter(supplier=supplier).count()  # Add product count
    }

    # Add stores information
    stores = supplier.stores.all()
    if stores:
        supplier_data['stores'] = []
        supplier_data['store_ids'] = []
        for store in stores:
            supplier_data['stores'].append({
                'id': store.id,
                'name': store.name
            })
            supplier_data['store_ids'].append(store.id)

    return JsonResponse({'supplier': supplier_data})

@csrf_exempt
@admin_required
def supplier_create(request):
    """
    Create a new supplier.
    Accessible by admins only.
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

        # Add stores if provided
        if 'store_ids' in data and isinstance(data['store_ids'], list):
            for store_id in data['store_ids']:
                try:
                    store = Store.objects.get(id=store_id)
                    supplier.stores.add(store)
                except Store.DoesNotExist:
                    pass

        # Prepare response
        supplier_response = {
            'id': supplier.id,
            'name': supplier.name,
            'phone': supplier.phone,
            'productCount': 0  # New supplier, so no products yet
        }

        # Add stores information
        stores = supplier.stores.all()
        if stores:
            supplier_response['stores'] = []
            supplier_response['store_ids'] = []
            for store in stores:
                supplier_response['stores'].append({
                    'id': store.id,
                    'name': store.name
                })
                supplier_response['store_ids'].append(store.id)

        return JsonResponse({
            'message': 'Supplier created successfully',
            'supplier': supplier_response
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@admin_required
def supplier_update(request, supplier_id):
    """
    Update an existing supplier.
    Accessible by admins only.
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

        # Update stores if provided
        if 'store_ids' in data and isinstance(data['store_ids'], list):
            # Clear existing stores
            supplier.stores.clear()

            # Add new stores
            for store_id in data['store_ids']:
                try:
                    store = Store.objects.get(id=store_id)
                    supplier.stores.add(store)
                except Store.DoesNotExist:
                    pass

        supplier.save()

        # Prepare response
        supplier_response = {
            'id': supplier.id,
            'name': supplier.name,
            'contact_person': supplier.contact_person,
            'phone': supplier.phone,
            'email': supplier.email,
            'productCount': Product.objects.filter(supplier=supplier).count()  # Add product count
        }

        # Add stores information
        stores = supplier.stores.all()
        if stores:
            supplier_response['stores'] = []
            supplier_response['store_ids'] = []
            for store in stores:
                supplier_response['stores'].append({
                    'id': store.id,
                    'name': store.name
                })
                supplier_response['store_ids'].append(store.id)

        return JsonResponse({
            'message': 'Supplier updated successfully',
            'supplier': supplier_response
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
