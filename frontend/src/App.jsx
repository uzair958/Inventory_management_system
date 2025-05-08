import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ProductDetail from './components/products/ProductDetail';
import StoreList from './components/stores/StoreList';
import StoreForm from './components/stores/StoreForm';
import StoreDetail from './components/stores/StoreDetail';
import SupplierList from './components/suppliers/SupplierList';
import SupplierForm from './components/suppliers/SupplierForm';
import SupplierDetail from './components/suppliers/SupplierDetail';
import UserManagement from './components/users/UserManagement';
import UserDetail from './components/users/UserDetail';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import NotFound from './components/NotFound';
import { Box, Container } from '@mui/material';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Protected Routes for all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="/stores" element={<StoreList />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/stores/new" element={<StoreForm />} />
                <Route path="/stores/:id/edit" element={<StoreForm />} />
                <Route path="/suppliers" element={<SupplierList />} />
                <Route path="/suppliers/:id" element={<SupplierDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Admin-only Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/suppliers/new" element={<SupplierForm />} />
                <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
        </Box>
      </AuthProvider>
    </Router>
  );
}

export default App;
