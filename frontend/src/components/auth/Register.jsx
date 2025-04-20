import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  Divider,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for icons
const UserIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"👤"',
    fontSize: '1.2rem'
  }
});

const EmailIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"📧"',
    fontSize: '1.2rem'
  }
});

const LockIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔒"',
    fontSize: '1.2rem'
  }
});

const RegisterButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"📝"',
    marginRight: theme.spacing(1),
    fontSize: '1.2rem'
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline'
  }
}));

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Note: Role is not included in payload as staff is the default
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Creating your account...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 100px)' 
    }}>
      <Card sx={{ 
        width: '100%', 
        maxWidth: '450px',
        boxShadow: 3,
        borderRadius: 2,
        py: 2
      }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Create an Account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Sign up to start managing inventory
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              variant="outlined"
              margin="normal"
              value={formData.username}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              You will be registered as a staff member. Only admins can change user roles.
            </Alert>
            
            <RegisterButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 2 }}
            >
              Register
            </RegisterButton>
            
            <Divider sx={{ my: 3 }} />
            
            <Stack direction="row" justifyContent="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account? 
              </Typography>
              <StyledLink to="/login" sx={{ ml: 1 }}>
                Login here
              </StyledLink>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register; 