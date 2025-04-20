import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledLink = styled(Link)({
  textDecoration: 'none',
});

// CSS-based button styles with icons
const DashboardButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"🏠"',
    marginRight: theme.spacing(1),
    fontSize: '1rem'
  }
}));

const HomeButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"↩"',
    marginRight: theme.spacing(1),
    fontSize: '1rem'
  }
}));

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '60vh',
          py: 8
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <DashboardButton 
            component={StyledLink} 
            to="/dashboard" 
            variant="contained" 
            color="primary"
          >
            Go to Dashboard
          </DashboardButton>
          <HomeButton 
            component={StyledLink} 
            to="/" 
            variant="outlined" 
            color="primary"
          >
            Go to Home
          </HomeButton>
        </Stack>
      </Box>
    </Container>
  );
};

export default NotFound; 