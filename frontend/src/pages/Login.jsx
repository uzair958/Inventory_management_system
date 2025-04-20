import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useRedirectIfAuthenticated from '../hooks/useRedirectIfAuthenticated';
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
  Divider
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

const LockIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔒"',
    fontSize: '1.2rem'
  }
});

const LoginIcon = styled('span')({
  display: 'inline-block',
  marginRight: '8px',
  '&::before': {
    content: '"🔑"',
    fontSize: '1.2rem'
  }
});

const Logo = styled('div')(({ theme }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
  color: 'white',
  fontSize: '2rem',
  '&::before': {
    content: '"📦"'
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

const Login = () => {
  // Redirect if already authenticated
  const { isLoading: isRedirecting } = useRedirectIfAuthenticated();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(formData);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 64px)' 
    }}>
      <Card sx={{ 
        width: '100%', 
        maxWidth: '450px',
        boxShadow: 3,
        borderRadius: 2,
        py: 2
      }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo />
          
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Welcome Back
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Sign in to your account to continue
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
              id="password"
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5,
                mb: 2,
                position: 'relative'
              }}
              startIcon={!loading && <LoginIcon />}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px'
                    }}
                  />
                  <Typography sx={{ visibility: 'hidden' }}>Sign In</Typography>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account? <StyledLink to="/register">Sign Up</StyledLink>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login; 