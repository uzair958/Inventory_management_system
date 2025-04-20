import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { storeService } from '../../utils/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Divider
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

const StoreForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    location: '',
    manager: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await storeService.getStore(id);
        const store = response.data.store || response.data;
        
        setFormData({
          name: store.name || '',
          address: store.address || '',
          location: store.location || '',
          manager: store.manager || '',
          phone: store.phone || '',
          email: store.email || ''
        });
      } catch (err) {
        setError('Failed to load store data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id, isEditMode]);

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
      if (isEditMode) {
        await storeService.updateStore(id, formData);
      } else {
        await storeService.createStore(formData);
      }

      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save store');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading store data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Store' : 'Add New Store'}
        </Typography>
        <BackButton 
          component={StyledLink} 
          to="/stores" 
          variant="outlined"
        >
          Back to Stores
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
                  label="Store Name"
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
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Store Manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <CancelButton
                component={StyledLink}
                to="/stores"
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
                {submitting ? 'Saving...' : (isEditMode ? 'Update Store' : 'Create Store')}
              </SaveButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StoreForm; 