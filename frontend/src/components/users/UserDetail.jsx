import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Paper
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

const RoleChip = styled(Chip)(({ theme, role }) => ({
  fontWeight: 'bold',
  ...(role === 'admin' && {
    backgroundColor: `${theme.palette.primary.light}`,
    color: `${theme.palette.primary.dark}`,
  }),
  ...(role === 'manager' && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
  ...(role === 'employee' && {
    backgroundColor: `${theme.palette.info.light}`,
    color: `${theme.palette.info.dark}`,
  }),
  ...(role === 'inactive' && {
    backgroundColor: `${theme.palette.grey[300]}`,
    color: `${theme.palette.grey[800]}`,
  }),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
}));

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isAdmin = currentUser && currentUser.role === 'admin';
  const isSelf = currentUser && currentUser.id === parseInt(id);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAdmin && !isSelf) {
        setLoading(false);
        setError('You do not have permission to view this user.');
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getUserById(id);

        if (response.data) {
          setUser(response.data);
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
  }, [id, isAdmin, isSelf]);

  const handleDelete = async () => {
    if (!isAdmin) {
      setError('You do not have permission to delete users.');
      return;
    }

    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(id);
      navigate('/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again later.');
      setLoading(false);
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

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
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

  if (!user) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 4 }}>User not found.</Alert>
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
          User Details: {user.username}
          {user.role && (
            <RoleChip
              label={user.role}
              role={user.role}
              size="medium"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Stack direction="row" spacing={2}>
          <BackButton
            component={StyledLink}
            to="/users"
            variant="outlined"
          >
            Back to Users
          </BackButton>
          {isAdmin && (
            <EditButton
              component={StyledLink}
              to={`/users/${id}/edit`}
              variant="contained"
              color="primary"
            >
              Edit User
            </EditButton>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 3 }} />

              <InfoItem>
                <InfoLabel>Username</InfoLabel>
                <InfoValue>{user.username}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{user.email || 'N/A'}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>First Name</InfoLabel>
                <InfoValue>{user.first_name || 'N/A'}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>Last Name</InfoLabel>
                <InfoValue>{user.last_name || 'N/A'}</InfoValue>
              </InfoItem>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Account Information</Typography>
              <Divider sx={{ mb: 3 }} />

              <InfoItem>
                <InfoLabel>Role</InfoLabel>
                <InfoValue>
                  <RoleChip
                    label={user.role || 'Unknown'}
                    role={user.role || 'inactive'}
                    size="small"
                  />
                </InfoValue>
              </InfoItem>

              {user.role === 'staff' && user.assigned_stores && user.assigned_stores.length > 0 && (
                <InfoItem>
                  <InfoLabel>Assigned Stores</InfoLabel>
                  <InfoValue>
                    <Box sx={{ mt: 1 }}>
                      {user.assigned_stores.map(store => (
                        <Chip
                          key={store.id}
                          label={store.name}
                          color="info"
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </InfoValue>
                </InfoItem>
              )}

              <InfoItem>
                <InfoLabel>Date Joined</InfoLabel>
                <InfoValue>
                  {user.date_joined
                    ? new Date(user.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoLabel>Last Login</InfoLabel>
                <InfoValue>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never'
                  }
                </InfoValue>
              </InfoItem>

              {user.is_active !== undefined && (
                <InfoItem>
                  <InfoLabel>Account Status</InfoLabel>
                  <InfoValue>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </InfoValue>
                </InfoItem>
              )}
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 2, bgcolor: 'error.light' }}>
              <Typography variant="h6" sx={{ color: 'error.dark', mb: 2 }}>Danger Zone</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'error.dark' }}>
                Deleting a user is permanent and cannot be undone. All data associated with this user will be removed.
              </Typography>
              <DeleteButton
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                {deleteConfirm ? 'Click again to confirm deletion' : 'Delete User'}
              </DeleteButton>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserDetail;