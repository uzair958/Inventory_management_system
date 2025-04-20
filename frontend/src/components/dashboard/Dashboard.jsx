import { useState, useEffect } from 'react';
import { dashboardService, productService } from '../../utils/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';

// CSS-based icons
const ProductsIcon = styled('span')({
  fontSize: '2rem',
  marginBottom: '8px',
  '&::before': {
    content: '"📦"'
  }
});

const StoresIcon = styled('span')({
  fontSize: '2rem',
  marginBottom: '8px',
  '&::before': {
    content: '"🏪"'
  }
});

const SuppliersIcon = styled('span')({
  fontSize: '2rem',
  marginBottom: '8px',
  '&::before': {
    content: '"👥"'
  }
});

const WarningIcon = styled('span')({
  fontSize: '2rem',
  marginBottom: '8px',
  '&::before': {
    content: '"⚠️"'
  }
});

const ValueIcon = styled('span')({
  fontSize: '2rem',
  marginBottom: '8px',
  '&::before': {
    content: '"💰"'
  }
});

// Styled status chips
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'Out of Stock' && {
    backgroundColor: `${theme.palette.error.light}`,
    color: `${theme.palette.error.dark}`,
  }),
  ...(status === 'Critical' && {
    backgroundColor: `${theme.palette.warning.light}`,
    color: `${theme.palette.warning.dark}`,
  }),
  ...(status === 'Low' && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
}));

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewResponse, lowStockResponse] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getLowStockProducts(),
        ]);
        
        setOverview(overviewResponse.data.overview);
        setLowStockProducts(lowStockResponse.data.low_stock_products);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        <Typography variant="h6">Error</Typography>
        <Typography variant="body1">{error}</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      {overview && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ProductsIcon />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {overview.total_products}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <StoresIcon />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Stores
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {overview.total_stores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SuppliersIcon />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Suppliers
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {overview.total_suppliers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Low Stock Items
                </Typography>
                <Typography variant="h3" fontWeight="bold" color={overview.low_stock_count > 0 ? 'warning.main' : 'text.primary'}>
                  {overview.low_stock_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {overview.total_inventory_value !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ValueIcon />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary">
                    ${overview.total_inventory_value.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Low Stock Products
        </Typography>
        
        {lowStockProducts.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No products are currently low in stock.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.threshold}</TableCell>
                    <TableCell>{product.store.name}</TableCell>
                    <TableCell>
                      {product.supplier.name} 
                      {product.supplier.phone && <span> ({product.supplier.phone})</span>}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={
                          product.quantity === 0 
                            ? 'Out of Stock' 
                            : product.quantity <= product.threshold / 2 
                              ? 'Critical' 
                              : 'Low'
                        }
                        status={
                          product.quantity === 0 
                            ? 'Out of Stock' 
                            : product.quantity <= product.threshold / 2 
                              ? 'Critical' 
                              : 'Low'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard; 