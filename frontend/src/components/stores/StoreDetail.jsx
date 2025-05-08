import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storeService, productService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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

const AddButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"+"',
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1.2rem'
  }
}));

const ViewButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"👁"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const ViewIcon = styled('span')(({ viewMode }) => ({
  display: 'inline-block',
  '&::before': {
    content: viewMode === 'grid' ? '"📊"' : '"📋"',
    fontSize: '1.2rem'
  }
}));

const SearchIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔍"',
    fontSize: '1.2rem'
  }
});

const ClearIcon = styled('span')({
  display: 'inline-block',
  cursor: 'pointer',
  '&::before': {
    content: '"❌"',
    fontSize: '1rem'
  }
});

// Styled status chips
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

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isAdmin = user && user.role === 'admin';
  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const storeResponse = await storeService.getStore(id);

        if (storeResponse.data) {
          if (storeResponse.data.id) {
            setStore(storeResponse.data);
          } else if (storeResponse.data.store && storeResponse.data.store.id) {
            setStore(storeResponse.data.store);
          } else {
            throw new Error('Invalid store data received');
          }
        } else {
          throw new Error('No store data received');
        }

        const productsResponse = await productService.getAllProducts();

        let productsList = [];

        if (productsResponse.data) {
          if (Array.isArray(productsResponse.data)) {
            productsList = productsResponse.data;
          } else if (productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
            productsList = productsResponse.data.products;
          } else {
            console.error('Unexpected products data format:', productsResponse.data);
            setProducts([]);
          }

          if (productsList.length > 0) {
            const storeProducts = productsList.filter(
              product => {
                const storeId =
                  (product.store && product.store.id) ||
                  product.store_id ||
                  (product.store && product.store);

                return storeId === parseInt(id) || storeId === id;
              }
            );
            setProducts(storeProducts);
          }
        } else {
          console.error('No products data received');
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load store details:', err);
        // Use the error message from the server if available
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load store details. Please try again later.');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortProducts = (productsToSort) => {
    if (!Array.isArray(productsToSort)) return [];

    return [...productsToSort].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === 'supplier.name') {
        aValue = a.supplier?.name || '';
        bValue = b.supplier?.name || '';
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    return (
      product.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(filterText.toLowerCase())) ||
      (product.supplier?.name && product.supplier.name.toLowerCase().includes(filterText.toLowerCase()))
    );
  }) : [];

  const sortedProducts = sortProducts(filteredProducts);

  const getStockStatus = (product) => {
    if (product.quantity <= 0) {
      return 'Out of Stock';
    } else if (product.quantity <= product.threshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  const handleDelete = async () => {
    try {
      await storeService.deleteStore(id);
      navigate('/stores');
    } catch (err) {
      setError('Failed to delete store. It may have associated products.');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'grid' : 'table');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading store details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mt: 4, mb: 4 }}>{error}</Alert>
        <BackButton
          component={StyledLink}
          to="/stores"
          variant="outlined"
        >
          Back to Stores
        </BackButton>
      </Box>
    );
  }

  if (!store) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mt: 4, mb: 4 }}>
          Store not found.
        </Alert>
        <BackButton
          component={StyledLink}
          to="/stores"
          variant="outlined"
        >
          Back to Stores
        </BackButton>
      </Box>
    );
  }

  // Count stats
  const outOfStockCount = sortedProducts.filter(p => p.quantity <= 0).length;
  const lowStockCount = sortedProducts.filter(p => p.quantity > 0 && p.quantity <= p.threshold).length;
  const inStockCount = sortedProducts.filter(p => p.quantity > p.threshold).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {store.name}
        </Typography>
        <Stack direction="row" spacing={2}>
          <BackButton
            component={StyledLink}
            to="/stores"
            variant="outlined"
          >
            Back to Stores
          </BackButton>
          {isManagerOrAdmin && (
            <EditButton
              component={StyledLink}
              to={`/stores/${id}/edit`}
              variant="contained"
              color="primary"
            >
              Edit Store
            </EditButton>
          )}
          {isAdmin && (
            <DeleteButton
              variant="outlined"
              color="error"
              onClick={openDeleteConfirm}
            >
              Delete Store
            </DeleteButton>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Store Information</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{store.location || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{store.address || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Manager</Typography>
                <Typography variant="body1">
                  {store.manager
                    ? (typeof store.manager === 'object'
                        ? (store.manager.name || store.manager.username ||
                           (store.manager.first_name && store.manager.last_name
                             ? `${store.manager.first_name} ${store.manager.last_name}`
                             : store.manager.username))
                        : store.manager)
                    : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{store.phone || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{store.email || 'N/A'}</Typography>
              </Box>
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
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="h4" sx={{ color: 'success.dark' }}>{inStockCount}</Typography>
                    <Typography variant="body2" sx={{ color: 'success.dark' }}>In Stock</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                    <Typography variant="h4" sx={{ color: 'warning.dark' }}>{lowStockCount}</Typography>
                    <Typography variant="body2" sx={{ color: 'warning.dark' }}>Low Stock</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                    <Typography variant="h4" sx={{ color: 'error.dark' }}>{outOfStockCount}</Typography>
                    <Typography variant="body2" sx={{ color: 'error.dark' }}>Out of Stock</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Total Products</Typography>
                <Typography variant="body1">{sortedProducts.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Products</Typography>
            <Stack direction="row" spacing={2}>
              {isManagerOrAdmin && (
                <AddButton
                  component={StyledLink}
                  to={`/products/new?store=${id}`}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Add Product
                </AddButton>
              )}
              <Button
                variant="outlined"
                onClick={toggleViewMode}
                startIcon={<ViewIcon viewMode={viewMode} />}
                size="small"
              >
                {viewMode === 'table' ? 'Grid View' : 'Table View'}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Search products..."
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ width: '100%', maxWidth: '400px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilterText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {sortedProducts.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {filterText
                ? 'No products match your search. Try a different search term or clear the filter.'
                : 'No products found in this store. Add a product to get started.'}
            </Alert>
          )}

          {sortedProducts.length > 0 && viewMode === 'table' && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortKey === 'name'}
                        direction={sortKey === 'name' ? sortDirection : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Product Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortKey === 'sku'}
                        direction={sortKey === 'sku' ? sortDirection : 'asc'}
                        onClick={() => handleSort('sku')}
                      >
                        SKU
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortKey === 'price'}
                        direction={sortKey === 'price' ? sortDirection : 'asc'}
                        onClick={() => handleSort('price')}
                      >
                        Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortKey === 'quantity'}
                        direction={sortKey === 'quantity' ? sortDirection : 'asc'}
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      Status
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortKey === 'supplier.name'}
                        direction={sortKey === 'supplier.name' ? sortDirection : 'asc'}
                        onClick={() => handleSort('supplier.name')}
                      >
                        Supplier
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku || 'N/A'}</TableCell>
                      <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={getStockStatus(product)}
                          status={getStockStatus(product)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{product.supplier?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <ViewButton
                            component={StyledLink}
                            to={`/products/${product.id}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          >
                            View
                          </ViewButton>
                          {isManagerOrAdmin && (
                            <EditButton
                              component={StyledLink}
                              to={`/products/${product.id}/edit`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            >
                              Edit
                            </EditButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {sortedProducts.length > 0 && viewMode === 'grid' && (
            <Grid container spacing={3}>
              {sortedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <StatusChip
                          label={getStockStatus(product)}
                          status={getStockStatus(product)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        SKU: {product.sku || 'N/A'}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Quantity: {product.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supplier: {product.supplier?.name || 'N/A'}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        component={StyledLink}
                        to={`/products/${product.id}`}
                        size="small"
                        variant="outlined"
                      >
                        View
                      </Button>
                      {isManagerOrAdmin && (
                        <Button
                          component={StyledLink}
                          to={`/products/${product.id}/edit`}
                          size="small"
                          color="primary"
                          variant="contained"
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
      >
        <DialogTitle>Delete Store</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the store '{store?.name}'? This action cannot be undone.
            {products.length > 0 && (
              <span>
                <br /><br />
                <strong>Warning:</strong> This store has {products.length} associated products.
                Deleting this store may affect these products.
              </span>
            )}
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

export default StoreDetail;