import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService, storeService } from '../../utils/api';
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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
  ListItemText,
  Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledLink = styled(Link)({
  textDecoration: 'none',
});

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

const SaveButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"💾"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const CancelButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"❌"',
    marginRight: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const RoleChip = styled(Chip)(({ theme, roleType }) => ({
  fontWeight: 'bold',
  ...(roleType === 'admin' && {
    backgroundColor: `${theme.palette.primary.light}`,
    color: `${theme.palette.primary.dark}`,
  }),
  ...(roleType === 'manager' && {
    backgroundColor: `${theme.palette.success.light}`,
    color: `${theme.palette.success.dark}`,
  }),
  ...(roleType === 'staff' && {
    backgroundColor: `${theme.palette.info.light}`,
    color: `${theme.palette.info.dark}`,
  }),
  ...(roleType === 'inactive' && {
    backgroundColor: `${theme.palette.grey[300]}`,
    color: `${theme.palette.grey[800]}`,
  }),
}));

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStores, setSelectedStores] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Check if current user is a super admin (id: 1)
  const isSuperAdmin = user && user.id === 1;

  useEffect(() => {
    // Check if user is admin, redirect if not
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    // Load user data and stores from the backend
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users and stores in parallel
        const [usersResponse, storesResponse] = await Promise.all([
          userService.getAllUsers(),
          storeService.getAllStores()
        ]);

        if (usersResponse.data && usersResponse.data.users) {
          // Process users to identify superuser (assuming user with ID 1 is superuser)
          const processedUsers = usersResponse.data.users.map(u => ({
            ...u,
            is_superuser: u.id === 1
          }));
          setUsers(processedUsers);
          setError('');
        } else {
          setError('Failed to load users: Invalid response format');
        }

        if (storesResponse.data && storesResponse.data.stores) {
          setStores(storesResponse.data.stores);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');

        // If API fails, use mock data for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for development');
          const mockUsers = [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              role: 'admin',
              date_joined: new Date().toISOString(),
              is_superuser: true
            },
            {
              id: 2,
              username: 'manager1',
              email: 'manager@example.com',
              role: 'manager',
              date_joined: new Date().toISOString()
            }
          ];
          setUsers(mockUsers);

          const mockStores = [
            {
              id: 1,
              name: 'Store 1'
            },
            {
              id: 2,
              name: 'Store 2'
            }
          ];
          setStores(mockStores);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, navigate]);

  // Check if user can modify another user (admins can't modify other admins unless they're a superuser)
  const canModifyUser = (targetUser) => {
    // If target user is admin and current user is not superuser, prevent modification
    if (targetUser.role === 'admin' && !isSuperAdmin) {
      return false;
    }
    return true;
  };

  const handleEditRole = (userId, currentRole) => {
    const targetUser = users.find(u => u.id === userId);

    // Check if user has permission to edit this role
    if (!canModifyUser(targetUser)) {
      setError('You do not have permission to modify other admin users.');
      return;
    }

    setEditingUser(userId);
    setSelectedRole(currentRole);

    // Set selected stores if the user is a staff member
    if (targetUser.role === 'staff' && targetUser.assigned_stores) {
      setSelectedStores(targetUser.assigned_stores.map(store => store.id));
    } else {
      setSelectedStores([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
    setSelectedStores([]);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);

    // If changing from staff to another role, clear selected stores
    if (e.target.value !== 'staff') {
      setSelectedStores([]);
    }
  };

  const handleStoreChange = (event) => {
    const { value } = event.target;
    setSelectedStores(typeof value === 'string' ? value.split(',') : value);
  };

  const handleUpdateRole = async (userId) => {
    const targetUser = users.find(u => u.id === userId);

    // Double-check permission
    if (!canModifyUser(targetUser)) {
      setError('You do not have permission to modify other admin users.');
      return;
    }

    setLoading(true);

    try {
      // Prepare data to send to the API
      const updateData = {
        role: selectedRole
      };

      // If the role is staff, include store_ids
      if (selectedRole === 'staff') {
        updateData.store_ids = selectedStores;
      }

      // Call the API to update the user's role
      const response = await userService.updateUserRole(userId, updateData);

      // Update user in local state
      setUsers(users.map(userItem => {
        const itemId = userItem.id;
        if (itemId === userId) {
          const updatedUser = {
            ...userItem,
            role: selectedRole
          };

          // Update assigned_stores if available in the response
          if (response.data && response.data.user && response.data.user.assigned_stores) {
            updatedUser.assigned_stores = response.data.user.assigned_stores;
          } else if (selectedRole === 'staff') {
            // If no response data, construct assigned_stores from selected store IDs
            updatedUser.assigned_stores = selectedStores.map(storeId => {
              const store = stores.find(s => s.id === storeId);
              return store ? { id: store.id, name: store.name } : { id: storeId, name: `Store ${storeId}` };
            });
          } else {
            // If not staff, clear assigned_stores
            updatedUser.assigned_stores = [];
          }

          return updatedUser;
        }
        return userItem;
      }));

      setEditingUser(null);
      setSelectedRole('');
      setSelectedStores([]);
      setError('');
    } catch (err) {
      setError('Failed to update user role. Please try again.');
      console.error('Error updating role:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (user) => {
    // Check if user has permission to delete
    if (!canModifyUser(user)) {
      setError('You do not have permission to delete other admin users.');
      return;
    }
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);

    try {
      // Call the API to delete the user
      await userService.deleteUser(userToDelete.id);

      // Remove user from local state
      setUsers(users.filter(userItem => userItem.id !== userToDelete.id));
      setError('');
      closeDeleteConfirm();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // If still loading or user check not complete
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Redirect if not admin
  if (user.role !== 'admin') {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6">Unauthorized Access</Typography>
          <Typography variant="body1">You do not have permission to access this page.</Typography>
          <Button
            component={StyledLink}
            to="/dashboard"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>User Management</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are logged in as a super admin and can manage all users including other admins.
        </Alert>
      )}

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          As an admin, you can manage staff and manager users, but not other admins.
        </Alert>
      )}

      {users.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No users found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userItem) => {
                const userId = userItem.id;
                const createdDate = userItem.created_at || userItem.createdAt || new Date().toISOString();
                const isEditableUser = canModifyUser(userItem);

                return (
                  <TableRow key={userId} sx={userItem.role === 'admin' ? { backgroundColor: 'rgba(25, 118, 210, 0.08)' } : {}}>
                    <TableCell>{userItem.username}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      {editingUser === userId ? (
                        <Box>
                          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                            <InputLabel id={`role-select-${userId}`}>Role</InputLabel>
                            <Select
                              labelId={`role-select-${userId}`}
                              value={selectedRole}
                              onChange={handleRoleChange}
                              label="Role"
                            >
                              <MenuItem value="staff">Staff</MenuItem>
                              <MenuItem value="manager">Manager</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          </FormControl>

                          {selectedRole === 'staff' && (
                            <FormControl fullWidth size="small">
                              <InputLabel id={`store-select-${userId}`}>Assigned Stores</InputLabel>
                              <Select
                                labelId={`store-select-${userId}`}
                                multiple
                                value={selectedStores}
                                onChange={handleStoreChange}
                                input={<OutlinedInput label="Assigned Stores" />}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                      const store = stores.find(s => s.id === value);
                                      return (
                                        <Chip
                                          key={value}
                                          label={store ? store.name : `Store ${value}`}
                                          size="small"
                                        />
                                      );
                                    })}
                                  </Box>
                                )}
                              >
                                {stores.map((store) => (
                                  <MenuItem key={store.id} value={store.id}>
                                    <Checkbox checked={selectedStores.indexOf(store.id) > -1} />
                                    <ListItemText primary={store.name} />
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <RoleChip
                            label={userItem.role || 'Unknown'}
                            roleType={userItem.role || 'inactive'}
                            size="small"
                          />

                          {userItem.role === 'staff' && userItem.assigned_stores && userItem.assigned_stores.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {userItem.assigned_stores.map(store => (
                                <Chip
                                  key={store.id}
                                  label={store.name}
                                  color="info"
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{new Date(createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {editingUser === userId ? (
                        <Stack direction="row" spacing={1}>
                          <SaveButton
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateRole(userId)}
                          >
                            Save
                          </SaveButton>
                          <CancelButton
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </CancelButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1}>
                          {isEditableUser && (
                            <>
                              <EditButton
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleEditRole(userId, userItem.role)}
                              >
                                Edit
                              </EditButton>
                              <DeleteButton
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => openDeleteConfirm(userItem)}
                              >
                                Delete
                              </DeleteButton>
                            </>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user '{userToDelete?.username}'? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;