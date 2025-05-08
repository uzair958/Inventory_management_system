import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supplierService, storeService } from '../../utils/api';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Box as MuiBox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  StyledTextField,
  StyledFormControl,
  StyledSelect,
  StyledMenuItem,
  StyledInputLabel,
  StyledOutlinedInput
} from '../common/FormStyles';

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

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    store_ids: []
  });

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all stores
        const storesResponse = await storeService.getAllStores();
        if (storesResponse.data && storesResponse.data.stores) {
          setStores(storesResponse.data.stores);
        }

        // If in edit mode, fetch supplier data
        if (isEditMode) {
          const supplierResponse = await supplierService.getSupplier(id);
          const supplier = supplierResponse.data.supplier || supplierResponse.data;

          // Get the store IDs that this supplier serves
          let storeIds = [];
          if (supplier.stores && Array.isArray(supplier.stores)) {
            storeIds = supplier.stores.map(store => store.id);
          } else if (supplier.store_ids && Array.isArray(supplier.store_ids)) {
            storeIds = supplier.store_ids;
          }

          setFormData({
            name: supplier.name || '',
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            store_ids: storeIds
          });
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Special handler for multi-select
  const handleStoreChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      store_ids: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEditMode) {
        await supplierService.updateSupplier(id, formData);
      } else {
        await supplierService.createSupplier(formData);
      }

      navigate('/suppliers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save supplier');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading supplier data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
        </Typography>
        <BackButton
          component={StyledLink}
          to="/suppliers"
          variant="outlined"
        >
          Back to Suppliers
        </BackButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Supplier Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Contact Person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} sx={{ mb: 2 }}>
                <StyledFormControl fullWidth disabled={submitting}>
                  <StyledInputLabel id="stores-label">Stores Served</StyledInputLabel>
                  <StyledSelect
                    labelId="stores-label"
                    multiple
                    value={formData.store_ids}
                    onChange={handleStoreChange}
                    input={<StyledOutlinedInput id="select-multiple-stores" label="Stores Served" />}
                    renderValue={(selected) => (
                      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const store = stores.find(s => s.id === value);
                          return (
                            <Chip key={value} label={store ? store.name : value} />
                          );
                        })}
                      </MuiBox>
                    )}
                  >
                    {stores.map((store) => (
                      <StyledMenuItem key={store.id} value={store.id}>
                        {store.name}
                      </StyledMenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <CancelButton
                component={StyledLink}
                to="/suppliers"
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
                {submitting ? 'Saving...' : (isEditMode ? 'Update Supplier' : 'Create Supplier')}
              </SaveButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupplierForm;