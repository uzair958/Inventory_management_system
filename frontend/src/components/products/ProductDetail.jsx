import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
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

const EditButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"✏️"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"🗑️"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'Out of Stock' && {
    backgroundColor: `${theme.palette.error.light}`,
    color: `${theme.palette.error.dark}`,
  }),
  ...(status === 'Low Stock' && {
    backgroundColor: `${theme.palette.warning.light}`,
    color: `${theme.palette.warning.dark}`,
  }),
  ...(status === 'In Stock' && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
}));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Check user roles
  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        if (response.data && response.data.product) {
          setProduct(response.data.product);
        } else if (response.data) {
          setProduct(response.data);
        } else {
          throw new Error('Invalid product data received');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        // Use the error message from the server if available
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load product details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getStockStatus = (product) => {
    const quantity = product.stock_count || product.quantity || 0;
    const threshold = product.threshold || 10;

    if (quantity <= 0) {
      return 'Out of Stock';
    } else if (quantity <= threshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Use the error message from the server if available
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete product. Please try again later.');
      }
    } finally {
      closeDeleteConfirm();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading product details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          component={StyledLink}
          to="/products"
          variant="contained"
          color="primary"
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          The product you are looking for does not exist or has been removed.
        </Alert>
        <Button
          component={StyledLink}
          to="/products"
          variant="contained"
          color="primary"
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  const stockStatus = getStockStatus(product);
  const stockCount = product.stock_count || product.quantity || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {product.name}
        </Typography>
        <Stack direction="row" spacing={2}>
          <BackButton
            component={StyledLink}
            to="/products"
            variant="outlined"
          >
            Back to Products
          </BackButton>
          {isManagerOrAdmin && (
            <EditButton
              component={StyledLink}
              to={`/products/${id}/edit`}
              variant="contained"
              color="primary"
            >
              Edit Product
            </EditButton>
          )}
          {isAdmin && (
            <DeleteButton
              variant="outlined"
              color="error"
              onClick={openDeleteConfirm}
            >
              Delete Product
            </DeleteButton>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Product Information</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">SKU</Typography>
                <Typography variant="body1">{product.sku || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{product.description || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Supplier</Typography>
                <Typography variant="body1">
                  {product.supplier ? (
                    <StyledLink to={`/suppliers/${product.supplier.id}`}>
                      {product.supplier.name}
                    </StyledLink>
                  ) : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Store</Typography>
                <Typography variant="body1">
                  {product.store ? (
                    <StyledLink to={`/stores/${product.store.id}`}>
                      {product.store.name}
                    </StyledLink>
                  ) : 'N/A'}
                </Typography>
              </Box>

              {product.category && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{product.category}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Inventory Statistics</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>${parseFloat(product.price).toFixed(2)}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Price</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{stockCount}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Quantity</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <StatusChip
                        label={stockStatus}
                        status={stockStatus}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Threshold</Typography>
                <Typography variant="body1">{product.threshold || 'N/A'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {product.stores && product.stores.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Available at Stores</Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {product.stores.map(store => (
                <Grid item xs={12} sm={6} md={4} key={store.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{store.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {store.location || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Stock: {store.pivot?.stock_count || 0}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          component={StyledLink}
                          to={`/stores/${store.id}`}
                          size="small"
                          variant="outlined"
                        >
                          View Store
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product '{product?.name}'? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductDetail;