import axios from 'axios';

// Update URL to point to Django's default port
const API_URL = 'http://localhost:8000/api';

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/CSRF
});

// Add interceptor to add auth token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    // Debug log to verify Authorization header
    console.log('Authorization Header:', config.headers['Authorization']);
    // Add CSRF token for Django
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service
const authService = {
  login: (credentials) => {
    return api.post('/auth/login/', credentials);
  },
  register: (userData) => {
    return api.post('/auth/register/', userData);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return api.get('/auth/me/');
  },
};

// User management service - updated to match the backend routes
const userService = {
  getAllUsers: () => {
    return api.get('/auth/users/');
  },
  getUserById: (id) => {
    return api.get(`/auth/users/${id}/`);
  },
  updateUserRole: (id, roleData) => {
    return api.put(`/auth/users/${id}/role/`, roleData);
  },
  deleteUser: (id) => {
    return api.delete(`/auth/users/${id}/`);
  },
  updateProfile: (profileData) => {
    return api.put('/auth/profile/update/', profileData);
  },
};

// Product services
export const productService = {
  getAllProducts: () => api.get('/products/'),
  getProduct: (id) => api.get(`/products/${id}/`),
  createProduct: (productData) => api.post('/products/create/', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}/update/`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}/delete/`),
};

// Store services
export const storeService = {
  getAllStores: () => api.get('/stores/'),
  getStore: (id) => api.get(`/stores/${id}/`),
  createStore: (storeData) => api.post('/stores/create/', storeData),
  updateStore: (id, storeData) => api.put(`/stores/${id}/update/`, storeData),
  deleteStore: (id) => api.delete(`/stores/${id}/delete/`),
};

// Supplier services
export const supplierService = {
  getAllSuppliers: () => api.get('/suppliers/'),
  getSupplier: (id) => api.get(`/suppliers/${id}/`),
  createSupplier: (supplierData) => api.post('/suppliers/create/', supplierData),
  updateSupplier: (id, supplierData) => api.put(`/suppliers/${id}/update/`, supplierData),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}/delete/`),
  getSupplierProducts: (id) => api.get(`/suppliers/${id}/products/`),
};

// Dashboard services
export const dashboardService = {
  getOverview: () => api.get('/dashboard/'),
  getLowStockProducts: () => api.get('/dashboard/low-stock/'),
};

// Export all services
export { api, authService, userService };