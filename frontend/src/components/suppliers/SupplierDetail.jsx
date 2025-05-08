import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supplierService, productService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
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
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
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

const ViewButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"👁"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
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

const StatusChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 'bold',
  ...(active && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
  ...(!active && {
    backgroundColor: `${theme.palette.error.light}`,
    color: `${theme.palette.error.dark}`,
  }),
}));

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const supplierResponse = await supplierService.getSupplier(id);

      if (supplierResponse.data && supplierResponse.data.supplier) {
        setSupplier(supplierResponse.data.supplier);
      } else if (supplierResponse.data) {
        setSupplier(supplierResponse.data);
      } else {
        throw new Error('Invalid supplier data received');
      }

      // Get all products and filter by supplier
      const productsResponse = await productService.getAllProducts();
      let productList = [];

      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          productList = productsResponse.data;
        } else if (productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
          productList = productsResponse.data.products;
        }

        // Filter products by supplier ID
        const supplierProducts = productList.filter(
          product => product.supplier && (product.supplier.id === parseInt(id) || product.supplier.id === id)
        );

        setProducts(supplierProducts);
      }
    } catch (err) {
      setError('Failed to load supplier details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [id]);

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    try {
      await supplierService.deleteSupplier(id);
      navigate('/suppliers');
    } catch (err) {
      setError('Failed to delete supplier');
      console.error(err);
    } finally {
      closeDeleteConfirm();
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Sort products
  const sortProducts = (productsToSort) => {
    if (!Array.isArray(productsToSort)) return [];

    return [...productsToSort].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortDirection === 'asc') {
        return String(aValue || '').localeCompare(String(bValue || ''));
      } else {
        return String(bValue || '').localeCompare(String(aValue || ''));
      }
    });
  };

  // Filter products based on search text
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    return (
      product.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(filterText.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(filterText.toLowerCase()))
    );
  }) : [];

  const sortedProducts = sortProducts(filteredProducts);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading supplier details...</Typography>
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
          to="/suppliers"
          variant="contained"
          color="primary"
        >
          Back to Suppliers
        </Button>
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          The supplier you are looking for does not exist or has been removed.
        </Alert>
        <Button
          component={StyledLink}
          to="/suppliers"
          variant="contained"
          color="primary"
        >
          Back to Suppliers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {supplier.name}
        </Typography>
        <Stack direction="row" spacing={2}>
          <BackButton
            component={StyledLink}
            to="/suppliers"
            variant="outlined"
          >
            Back to Suppliers
          </BackButton>
          {isAdmin && (
            <EditButton
              component={StyledLink}
              to={`/suppliers/${id}/edit`}
              variant="contained"
              color="primary"
            >
              Edit Supplier
            </EditButton>
          )}
          {isAdmin && (
            <DeleteButton
              variant="outlined"
              color="error"
              onClick={openDeleteConfirm}
            >
              Delete Supplier
            </DeleteButton>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supplier Information</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Contact Person</Typography>
                <Typography variant="body1">{supplier.contact_name || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{supplier.email || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{supplier.phone || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{supplier.address || 'N/A'}</Typography>
              </Box>

              {supplier.website && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Website</Typography>
                  <Typography variant="body1">
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                      {supplier.website}
                    </a>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{products.length}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Products</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <StatusChip
                        label={supplier.is_active ? 'Active' : 'Inactive'}
                        active={supplier.is_active}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {supplier.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{supplier.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Products</Typography>
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

          {sortedProducts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {filterText
                ? 'No products match your search. Try a different search term or clear the filter.'
                : 'No products found for this supplier.'}
            </Alert>
          ) : (
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
                        <ViewButton
                          component={StyledLink}
                          to={`/products/${product.id}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        >
                          View
                        </ViewButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
      >
        <DialogTitle>Delete Supplier</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the supplier '{supplier?.name}'? This action cannot be undone.
            {products.length > 0 && (
              <span>
                <br /><br />
                <strong>Warning:</strong> This supplier has {products.length} associated products.
                Deleting this supplier may affect these products.
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

export default SupplierDetail;