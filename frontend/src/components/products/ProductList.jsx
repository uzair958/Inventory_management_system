import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  TableSortLabel,
  Stack,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for CSS-based icons
const StyledLink = styled(Link)({
  textDecoration: 'none',
});

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

const SearchIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔍"',
    fontSize: '1.2rem'
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

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const isAdmin = user && user.role === 'admin';
  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        
        // Handle different response formats
        if (response.data) {
          if (Array.isArray(response.data)) {
            setProducts(response.data);
          } else if (response.data.products && Array.isArray(response.data.products)) {
            setProducts(response.data.products);
          } else {
            console.error('Unexpected data format:', response.data);
            setProducts([]);
            setError('Received invalid data format from server.');
          }
        } else {
          setProducts([]);
          setError('No data received from server.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Sort products
  const sortedProducts = Array.isArray(products) ? [...products].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    // For price, convert to number first
    if (sortField === 'price') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  // Filter products
  const filteredProducts = sortedProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStockStatus = (product) => {
    if (product.quantity <= 0) {
      return 'Out of Stock';
    } else if (product.quantity <= product.threshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts(products.filter(product => product.id !== productToDelete.id));
      closeDeleteConfirm();
    } catch (err) {
      setError('Failed to delete product. It may have associated data.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Products</Typography>
        {isManagerOrAdmin && (
          <AddButton 
            component={StyledLink} 
            to="/products/new" 
            variant="contained" 
            color="primary"
          >
            Add New Product
          </AddButton>
        )}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or description..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No products found. {isManagerOrAdmin && 'Add a new product to get started.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'sku'}
                    direction={sortField === 'sku' ? sortDirection : 'asc'}
                    onClick={() => handleSort('sku')}
                  >
                    SKU
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'price'}
                    direction={sortField === 'price' ? sortDirection : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'quantity'}
                    direction={sortField === 'quantity' ? sortDirection : 'asc'}
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
                    active={sortField === 'supplier'}
                    direction={sortField === 'supplier' ? sortDirection : 'asc'}
                    onClick={() => handleSort('supplier')}
                  >
                    Supplier
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
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
                      {isAdmin && (
                        <DeleteButton
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => openDeleteConfirm(product)}
                        >
                          Delete
                        </DeleteButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product '{productToDelete?.name}'? This action cannot be undone.
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

export default ProductList; 