import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../../utils/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledLink = styled(Link)({
  textDecoration: 'none',
});

// Custom CSS classes for buttons with icons
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

const StoreList = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  const isAdmin = user && user.role === 'admin';
  const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await storeService.getAllStores();

        // Handle different response formats
        if (response.data) {
          if (Array.isArray(response.data)) {
            // Direct array response
            setStores(response.data);
          } else if (response.data.stores && Array.isArray(response.data.stores)) {
            // Nested array in 'stores' property
            setStores(response.data.stores);
          } else {
            console.error('Unexpected data format:', response.data);
            setStores([]);
            setError('Received invalid data format from server.');
          }
        } else {
          setStores([]);
          setError('No data received from server.');
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setStores([]);
        setError('Failed to fetch stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Only sort if stores is an array
  const sortedStores = Array.isArray(stores) ? [...stores].sort((a, b) => {
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

  // Only filter if sortedStores is an array
  const filteredStores = sortedStores.filter((store) => {
    return (
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.location && store.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (store.manager && store.manager.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const openDeleteConfirm = (store) => {
    setStoreToDelete(store);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setStoreToDelete(null);
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;

    try {
      await storeService.deleteStore(storeToDelete.id);
      setStores(stores.filter(store => store.id !== storeToDelete.id));
      closeDeleteConfirm();
    } catch (err) {
      setError('Failed to delete store. It may have associated products.');
      console.error(err);
      closeDeleteConfirm();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading stores...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Stores</Typography>
        {isManagerOrAdmin && (
          <AddButton
            component={StyledLink}
            to="/stores/new"
            variant="contained"
            color="primary"
          >
            Add New Store
          </AddButton>
        )}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search stores"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, location, or manager..."
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {filteredStores.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No stores found. {isManagerOrAdmin && 'Add a new store to get started.'}
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
                    active={sortField === 'location'}
                    direction={sortField === 'location' ? sortDirection : 'asc'}
                    onClick={() => handleSort('location')}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'manager'}
                    direction={sortField === 'manager' ? sortDirection : 'asc'}
                    onClick={() => handleSort('manager')}
                  >
                    Manager
                  </TableSortLabel>
                </TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.location || 'N/A'}</TableCell>
                  <TableCell>{store.manager || 'N/A'}</TableCell>
                  <TableCell>{store.productCount || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <ViewButton
                        component={StyledLink}
                        to={`/stores/${store.id}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        View
                      </ViewButton>
                      {isManagerOrAdmin && (
                        <EditButton
                          component={StyledLink}
                          to={`/stores/${store.id}/edit`}
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
                          variant="outlined"
                          color="error"
                          onClick={() => openDeleteConfirm(store)}
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
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Store
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the store "{storeToDelete?.name}"? This action cannot be undone.
            Any products associated with this store will need to be reassigned.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreList;