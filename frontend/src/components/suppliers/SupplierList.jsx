import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierService } from '../../utils/api';
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
  Card,
  CardContent,
  InputAdornment,
  Stack,
  Chip,
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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'Active' && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
  ...(status === 'Inactive' && {
    backgroundColor: `${theme.palette.grey[300]}`,
    color: `${theme.palette.grey[800]}`,
  }),
}));

const SupplierList = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const isAdmin = user && user.role === 'admin';
  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await supplierService.getAllSuppliers();

        // Handle different response formats
        if (response.data) {
          if (Array.isArray(response.data)) {
            setSuppliers(response.data);
          } else if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
            setSuppliers(response.data.suppliers);
          } else {
            console.error('Unexpected data format:', response.data);
            setSuppliers([]);
            setError('Received invalid data format from server.');
          }
        } else {
          setSuppliers([]);
          setError('No data received from server.');
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setSuppliers([]);
        setError('Failed to fetch suppliers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Sort suppliers
  const sortedSuppliers = Array.isArray(suppliers) ? [...suppliers].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  // Filter suppliers
  const filteredSuppliers = sortedSuppliers.filter((supplier) => {
    return (
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_name && supplier.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const openDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSupplierToDelete(null);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await supplierService.deleteSupplier(supplierToDelete.id);
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
      closeDeleteConfirm();
    } catch (err) {
      setError('Failed to delete supplier. It may have associated products.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading suppliers...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Suppliers</Typography>
        {isAdmin && (
          <AddButton
            component={StyledLink}
            to="/suppliers/new"
            variant="contained"
            color="primary"
          >
            Add New Supplier
          </AddButton>
        )}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search suppliers"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, contact, email, or phone..."
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

      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No suppliers found. {isAdmin && 'Add a new supplier to get started.'}
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
                    active={sortField === 'contact_name'}
                    direction={sortField === 'contact_name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('contact_name')}
                  >
                    Contact Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'email'}
                    direction={sortField === 'email' ? sortDirection : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'phone'}
                    direction={sortField === 'phone' ? sortDirection : 'asc'}
                    onClick={() => handleSort('phone')}
                  >
                    Phone
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  Products
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_name || 'N/A'}</TableCell>
                  <TableCell>{supplier.email || 'N/A'}</TableCell>
                  <TableCell>{supplier.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={supplier.active ? 'Active' : 'Inactive'}
                      status={supplier.active ? 'Active' : 'Inactive'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{supplier.productCount || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <ViewButton
                        component={StyledLink}
                        to={`/suppliers/${supplier.id}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        View
                      </ViewButton>
                      {isAdmin && (
                        <EditButton
                          component={StyledLink}
                          to={`/suppliers/${supplier.id}/edit`}
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
                          onClick={() => openDeleteConfirm(supplier)}
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
        <DialogTitle>Delete Supplier</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the supplier '{supplierToDelete?.name}'? This action cannot be undone.
            {supplierToDelete && supplierToDelete.productCount > 0 && (
              <span>
                <br /><br />
                <strong>Warning:</strong> This supplier has {supplierToDelete.productCount} associated products.
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

export default SupplierList;