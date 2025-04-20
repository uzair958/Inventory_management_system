import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { productService, storeService, supplierService } from '../../utils/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for CSS-based icons
const StyledLink = styled(Link)({
  textDecoration: 'none',
});

const BackButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"←"',
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1.2rem'
  }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"💾"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const CancelButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"✖️"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  // Extract store_id from query params if available
  const queryParams = new URLSearchParams(location.search);
  const preselectedStoreId = queryParams.get('store');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    quantity: '',
    threshold: '',
    supplier_id: '',
    store_id: preselectedStoreId || ''
  });
  
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storesResponse, suppliersResponse] = await Promise.all([
          storeService.getAllStores(),
          supplierService.getAllSuppliers()
        ]);
        
        // Handle different API response formats
        const storesList = storesResponse.data.stores || storesResponse.data || [];
        const suppliersList = suppliersResponse.data.suppliers || suppliersResponse.data || [];
        
        setStores(storesList);
        setSuppliers(suppliersList);
        
        if (isEditMode) {
          const productResponse = await productService.getProduct(id);
          const product = productResponse.data.product || productResponse.data;
          
          setFormData({
            name: product.name || '',
            sku: product.sku || '',
            description: product.description || '',
            price: product.price || '',
            quantity: product.quantity || '',
            threshold: product.threshold || '',
            supplier_id: product.supplier?.id || product.supplier_id || '',
            store_id: product.store?.id || product.store_id || ''
          });
        }
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, preselectedStoreId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        threshold: parseInt(formData.threshold, 10)
      };

      if (isEditMode) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }

      if (preselectedStoreId) {
        navigate(`/stores/${preselectedStoreId}`);
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading form data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </Typography>
        <BackButton 
          component={StyledLink} 
          to={preselectedStoreId ? `/stores/${preselectedStoreId}` : "/products"} 
          variant="outlined"
        >
          Back to {preselectedStoreId ? 'Store' : 'Products'}
        </BackButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  name="price"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={formData.price}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  name="threshold"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.threshold}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  helperText="Alert when stock falls below"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={submitting}>
                  <InputLabel id="supplier-label">Supplier</InputLabel>
                  <Select
                    labelId="supplier-label"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    label="Supplier"
                  >
                    <MenuItem value="">
                      <em>Select a supplier</em>
                    </MenuItem>
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required={!preselectedStoreId} disabled={!!preselectedStoreId || submitting}>
                  <InputLabel id="store-label">Store</InputLabel>
                  <Select
                    labelId="store-label"
                    name="store_id"
                    value={formData.store_id}
                    onChange={handleChange}
                    label="Store"
                  >
                    <MenuItem value="">
                      <em>Select a store</em>
                    </MenuItem>
                    {stores.map(store => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <CancelButton
                component={StyledLink}
                to={preselectedStoreId ? `/stores/${preselectedStoreId}` : "/products"}
                variant="outlined"
                color="error"
                disabled={submitting}
              >
                Cancel
              </CancelButton>
              <SaveButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
              </SaveButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductForm; 