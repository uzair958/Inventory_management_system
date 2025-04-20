# Inventory Management System

A full-stack inventory management system built with Django (backend) and React (frontend). This application helps businesses manage their inventory across multiple stores, track products, suppliers, and more.

## Features

- **User Management**: Role-based access control (Admin, Manager, Staff)
- **Product Management**: Add, edit, delete, and view products
- **Store Management**: Manage multiple store locations
- **Supplier Management**: Track suppliers and their products
- **Inventory Tracking**: Monitor stock levels with low-stock alerts
- **Dashboard**: Overview of inventory status and key metrics

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
   python manage.py runserver
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
   npm start
   ```

4. The application should now be running at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/`: Register a new user
- `POST /api/auth/login/`: Login and get authentication token
- `POST /api/auth/logout/`: Logout and invalidate token
- `GET /api/auth/me/`: Get current user information

### Products
- `GET /api/products/`: List all products
- `GET /api/products/<id>/`: Get product details
- `POST /api/products/create/`: Create a new product
- `PUT /api/products/<id>/update/`: Update a product
- `DELETE /api/products/<id>/delete/`: Delete a product

### Stores
- `GET /api/stores/`: List all stores
- `GET /api/stores/<id>/`: Get store details
- `POST /api/stores/create/`: Create a new store
- `PUT /api/stores/<id>/update/`: Update a store
- `DELETE /api/stores/<id>/delete/`: Delete a store

### Suppliers
- `GET /api/suppliers/`: List all suppliers
- `GET /api/suppliers/<id>/`: Get supplier details
- `POST /api/suppliers/create/`: Create a new supplier
- `PUT /api/suppliers/<id>/update/`: Update a supplier
- `DELETE /api/suppliers/<id>/delete/`: Delete a supplier
- `GET /api/suppliers/<id>/products/`: Get products from a supplier

### Dashboard
- `GET /api/dashboard/`: Get dashboard overview
- `GET /api/dashboard/low-stock/`: Get low stock products

## User Roles and Permissions

- **Admin**: Full access to all features
- **Manager**: Can manage products, view reports, but cannot manage users
- **Staff**: Can view products and basic inventory information

## Project Structure

```
inventory-management-system/
├── ims_project/           # Django project settings
├── users/                 # User authentication and management
├── products/              # Product, Store, and Supplier models and views
├── frontend/              # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions and API services
│   │   └── App.js         # Main application component
│   └── package.json       # Frontend dependencies
├── manage.py              # Django management script
├── requirements.txt       # Backend dependencies
└── README.md              # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Django and React communities for their excellent documentation
- All contributors who have helped shape this project
