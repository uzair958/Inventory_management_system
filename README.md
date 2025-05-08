# Inventory Management System

A full-stack inventory management system built with Django (backend) and React (frontend). This application helps businesses manage their inventory across multiple stores, track products, suppliers, and more.

## Features

- **User Management**: Role-based access control (Admin, Manager, Staff)
  - Admins have full access to all features with edit permissions everywhere
  - Managers can only manage stores they are assigned to (limited edit permissions)
  - Staff have read-only access to stores and products they are assigned to (no edit permissions)
  - User registration includes store selection for staff members
  - Clear access control with meaningful error messages
- **Product Management**: Add, edit, delete, and view products
  - Products are associated with specific stores
  - Low stock alerts based on threshold values
  - Detailed product information including price, quantity, and supplier
  - Admins can edit all products
  - Managers can only edit products in their assigned stores
  - Staff can only view products (no edit permissions)
- **Store Management**: Manage multiple store locations
  - Assign managers to stores (admin only)
  - Assign staff members to stores (admin only)
  - Track products by store
  - Managers can only edit their assigned stores
  - Staff can only view their assigned stores (no edit permissions)
- **Supplier Management**: Track suppliers and their products
  - Supplier information visible to all authenticated users
  - Only admins can create, edit, or delete suppliers
  - Associate suppliers with multiple stores
- **Inventory Tracking**: Monitor stock levels with low-stock alerts
  - Automatic calculation of low stock status
  - Dashboard view of low stock items
  - Filter products by store
- **Dashboard**: Overview of inventory status and key metrics
  - Total products, stores, and suppliers
  - Low stock product count
  - Total inventory value

## Tech Stack

### Backend
- Django 5.0.7
- Django REST Framework
- Django CORS Headers
- SQLite (default database)

### Frontend
- React
- Axios for API requests
- React Router for navigation
- Context API for state management

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js and npm
- Git

### Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd inventory-management-system
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Start the Django development server:
   ```
   python manage.py runserver 8080
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```


## API Endpoints

### Authentication
- `POST /api/auth/register/`: Register a new user (with store selection for staff)
- `POST /api/auth/login/`: Login and get authentication token
- `POST /api/auth/logout/`: Logout and invalidate token
- `GET /api/auth/me/`: Get current user information
- `GET /api/auth/users/`: List all users (admin only)
- `GET /api/auth/managers/`: List all managers
- `GET /api/auth/staff/`: List all staff members
- `GET /api/auth/users/<id>/`: Get user details
- `PUT /api/auth/users/<id>/role/`: Update user role (with store assignment)
- `DELETE /api/auth/users/<id>/delete/`: Delete a user
- `PUT /api/auth/profile/update/`: Update current user profile

### Products
- `GET /api/products/`: List all products (filtered by user role)
- `GET /api/products/<id>/`: Get product details
- `POST /api/products/create/`: Create a new product
- `PUT /api/products/<id>/update/`: Update a product
- `DELETE /api/products/<id>/delete/`: Delete a product
- `GET /api/products/low-stock/`: Get low stock products (filtered by user role)

### Stores
- `GET /api/stores/`: List all stores (filtered by user role)
- `GET /api/stores/<id>/`: Get store details
- `POST /api/stores/create/`: Create a new store
- `PUT /api/stores/<id>/update/`: Update a store (with employee assignment)
- `DELETE /api/stores/<id>/delete/`: Delete a store

### Suppliers
- `GET /api/suppliers/`: List all suppliers
- `GET /api/suppliers/<id>/`: Get supplier details
- `POST /api/suppliers/create/`: Create a new supplier (admin only)
- `PUT /api/suppliers/<id>/update/`: Update a supplier (admin only)
- `DELETE /api/suppliers/<id>/delete/`: Delete a supplier (admin only)

### Dashboard
- `GET /api/dashboard/`: Get dashboard overview (filtered by user role)
- `GET /api/dashboard/low-stock/`: Get low stock products (filtered by user role)

## User Roles and Permissions

- **Admin**:
  - Full access to all features
  - Can create, edit, and delete users, stores, products, and suppliers
  - Can view all data across the system
  - Can assign managers to stores
  - Can assign staff to stores
  - Can edit any user's role and permissions
  - Can edit any store, product, or supplier

- **Manager**:
  - Can manage stores they are assigned to
  - Can create, edit, and delete products in their assigned stores
  - Can view supplier information but cannot edit suppliers
  - Can view low stock alerts for their stores
  - Cannot manage users or create/edit suppliers
  - Cannot access or edit stores they don't manage
  - Cannot edit other managers' or admins' information

- **Staff**:
  - Can view stores they are assigned to
  - Can view products in their assigned stores
  - Can view supplier information
  - Cannot edit or delete any data (read-only access)
  - Cannot access stores they aren't assigned to
  - Cannot edit any user, store, product, or supplier information

## Project Structure

```
inventory-management-system/
├── ims_project/           # Django project settings
├── users/                 # User authentication and management
│   ├── models.py          # CustomUser model with role-based access
│   ├── views.py           # Authentication and user management views
│   ├── decorators.py      # Permission decorators for access control
│   ├── middleware.py      # Authentication middleware
│   └── urls.py            # User-related URL routes
├── products/              # Product, Store, and Supplier models and views
│   ├── models.py          # Product, Store, and Supplier models
│   ├── views.py           # API views for products, stores, and suppliers
│   └── urls.py            # Product-related URL routes
├── frontend/              # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── products/  # Product management components
│   │   │   ├── stores/    # Store management components
│   │   │   ├── suppliers/ # Supplier management components
│   │   │   └── users/     # User management components
│   │   ├── context/       # Context providers
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── utils/         # Utility functions and API services
│   │   │   └── api.js     # API service functions
│   │   └── App.jsx        # Main application component with routes
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── manage.py              # Django management script
├── requirements.txt       # Backend dependencies
└── README.md              # Project documentation
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

