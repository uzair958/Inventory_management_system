import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
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

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
    password: '',
    password_confirm: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({});
  
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isNewUser = id === 'new';
  const isSelf = currentUser && currentUser.id === parseInt(id);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setError('You do not have permission to edit users.');
      return;
    }

    const fetchUser = async () => {
      if (isNewUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        
        if (response.data) {
          // Remove password fields from form data as they should be blank
          const userData = { ...response.data };
          delete userData.password;
          delete userData.password_confirm;
          
          setFormData(userData);
        } else {
          setError('User not found.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isAdmin, isNewUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Clear password error when either password field changes
    if (name === 'password' || name === 'password_confirm') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    // Validate required fields
    const requiredFields = ['username', 'email', 'role'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required.`);
        return false;
      }
    }
    
    // Validate password fields for new user or if either field is filled
    if (isNewUser || formData.password || formData.password_confirm) {
      if (formData.password !== formData.password_confirm) {
        setPasswordError('Passwords do not match');
        return false;
      }
      
      if (isNewUser && !formData.password) {
        setPasswordError('Password is required for new users');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Create a copy of the form data to send
      const userData = { ...formData };
      
      // Remove password confirm field
      delete userData.password_confirm;
      
      // If password is empty and not a new user, remove it
      if (!isNewUser && !userData.password) {
        delete userData.password;
      }
      
      if (isNewUser) {
        await userService.createUser(userData);
        setSuccessMessage('User created successfully!');
        // Redirect to users list after short delay
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        await userService.updateUser(id, userData);
        setSuccessMessage('User updated successfully!');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.detail || 'Failed to save user. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading user details...</Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 4 }}>You do not have permission to edit users.</Alert>
        <BackButton 
          component={StyledLink} 
          to="/users" 
          variant="outlined"
        >
          Back to Users
        </BackButton>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {isNewUser ? 'Create New User' : `Edit User: ${formData.username}`}
        </Typography>
        <BackButton 
          component={StyledLink} 
          to={isNewUser ? "/users" : `/users/${id}`} 
          variant="outlined"
        >
          {isNewUser ? 'Back to Users' : 'Cancel Changes'}
        </BackButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    error={touched.username && !formData.username}
                    helperText={touched.username && !formData.username ? "Username is required" : ""}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    error={touched.email && !formData.email}
                    helperText={touched.email && !formData.email ? "Email is required" : ""}
                  />
                  
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  <FormControl fullWidth required disabled={saving}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleChange}
                      label="Role"
                      error={touched.role && !formData.role}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="employee">Employee</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="is_active"
                      value={formData.is_active === undefined ? true : formData.is_active}
                      onChange={handleChange}
                      label="Status"
                      disabled={saving}
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required={isNewUser}
                    disabled={saving}
                    error={!!passwordError}
                    helperText={isNewUser ? "Required for new user" : "Leave blank to keep unchanged"}
                  />
                  
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="password_confirm"
                    type="password"
                    value={formData.password_confirm || ''}
                    onChange={handleChange}
                    required={isNewUser}
                    disabled={saving}
                    error={!!passwordError}
                    helperText={passwordError || ""}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <CancelButton
            component={StyledLink}
            to={isNewUser ? "/users" : `/users/${id}`}
            variant="outlined"
            color="error"
            disabled={saving}
          >
            Cancel
          </CancelButton>
          <SaveButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isNewUser ? 'Create User' : 'Save Changes')}
          </SaveButton>
        </Box>
      </form>
    </Box>
  );
};

export default UserEdit; 