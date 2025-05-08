import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { storeService, userService } from '../../utils/api';
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
  OutlinedInput,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  StyledTextField,
  StyledFormControl,
  StyledSelect,
  StyledMenuItem,
  StyledInputLabel
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
    manager_id: '',
    employee_ids: []
  });

  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch managers and staff
        const [managersResponse, staffResponse] = await Promise.all([
          userService.getAllManagers(),
          userService.getAllStaff()
        ]);

        if (managersResponse.data && managersResponse.data.users) {
          setManagers(managersResponse.data.users);
        }

        if (staffResponse.data && staffResponse.data.users) {
          setEmployees(staffResponse.data.users);
        }

        // If in edit mode, fetch store data
        if (isEditMode) {
          const storeResponse = await storeService.getStore(id);
          const store = storeResponse.data.store || storeResponse.data;

          setFormData({
            name: store.name || '',
            address: store.address || '',
            location: store.location || '',
            manager_id: store.manager?.id || store.manager_id || '',
            phone: store.phone || '',
            email: store.email || '',
            employee_ids: store.employees?.map(emp => emp.id) || store.employee_ids || []
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        // Use the error message from the server if available
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load data. Please try again later.');
        }
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

  const handleEmployeeChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      employee_ids: typeof value === 'string' ? value.split(',') : value
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
      console.error('Failed to save store:', err);
      // Use the error message from the server if available
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save store. Please try again later.');
      }
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
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <StyledTextField
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
                <StyledTextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
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

              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <StyledFormControl fullWidth disabled={submitting}>
                  <StyledInputLabel id="manager-label">Store Manager</StyledInputLabel>
                  <StyledSelect
                    labelId="manager-label"
                    name="manager_id"
                    value={formData.manager_id}
                    onChange={handleChange}
                    label="Store Manager"
                  >
                    <StyledMenuItem value="">
                      <em>Select a manager</em>
                    </StyledMenuItem>
                    {managers.map(manager => (
                      <StyledMenuItem key={manager.id} value={manager.id}>
                        {manager.first_name && manager.last_name
                          ? `${manager.first_name} ${manager.last_name} (${manager.username})`
                          : manager.username}
                      </StyledMenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12} md={4}>
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
                <StyledFormControl fullWidth disabled={submitting}>
                  <StyledInputLabel id="employees-label">Assign Employees</StyledInputLabel>
                  <StyledSelect
                    labelId="employees-label"
                    id="employees"
                    multiple
                    value={formData.employee_ids}
                    onChange={handleEmployeeChange}
                    input={<OutlinedInput label="Assign Employees" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
                        {selected.map((value) => {
                          const employee = employees.find(emp => emp.id === value);
                          return (
                            <Chip
                              key={value}
                              label={employee ?
                                (employee.first_name && employee.last_name
                                  ? `${employee.first_name} ${employee.last_name}`
                                  : employee.username)
                                : value}
                              size="small"
                              sx={{ margin: '2px' }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          width: 'auto',
                          minWidth: 250
                        }
                      }
                    }}
                  >
                    {employees.map((employee) => (
                      <StyledMenuItem key={employee.id} value={employee.id}>
                        {employee.first_name && employee.last_name
                          ? `${employee.first_name} ${employee.last_name} (${employee.username})`
                          : employee.username}
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