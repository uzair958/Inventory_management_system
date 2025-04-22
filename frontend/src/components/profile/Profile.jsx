import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../utils/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  fontSize: '2.5rem',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.main
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

const RoleChip = styled(Paper)(({ theme, role }) => ({
  display: 'inline-block',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 16,
  fontWeight: 'bold',
  fontSize: '0.875rem',
  color: theme.palette.getContrastText(
    role === 'admin'
      ? theme.palette.error.light
      : role === 'manager'
        ? theme.palette.warning.light
        : theme.palette.info.light
  ),
  backgroundColor:
    role === 'admin'
      ? theme.palette.error.light
      : role === 'manager'
        ? theme.palette.warning.light
        : theme.palette.info.light,
}));

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the API to update the user profile
      const response = await userService.updateProfile(formData);

      // Update the user context with the updated user data
      if (response.data && response.data.user) {
        // Update the user in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Update the user in context (this will trigger a re-render)
        updateUser(response.data.user);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProfileAvatar>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </ProfileAvatar>

              <Typography variant="h5" gutterBottom>
                {user?.username || 'Username'}
              </Typography>

              <RoleChip role={user?.role || 'staff'}>
                {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'Staff'}
              </RoleChip>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isEditing ? 'Edit Profile Information' : 'Profile Information'}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {isEditing ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>

                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <InfoItem>
                    <InfoLabel>Username</InfoLabel>
                    <InfoValue>{user?.username || 'N/A'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{user?.email || 'N/A'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>First Name</InfoLabel>
                    <InfoValue>{user?.firstName || 'N/A'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Last Name</InfoLabel>
                    <InfoValue>{user?.lastName || 'N/A'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Role</InfoLabel>
                    <InfoValue>{user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'Staff'}</InfoValue>
                  </InfoItem>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
