import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  DialogTitle
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Check if current user is a super admin (id: 1)
  const isSuperAdmin = user && user.id === 1;

  useEffect(() => {
    // Check if user is admin, redirect if not
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }

    // Load user data
    const initialUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        is_superuser: true  // Mark the main admin as superuser
      },
      {
        id: 2,
        username: 'manager1',
        email: 'manager@example.com',
        role: 'manager',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        username: 'staff1',
        email: 'staff1@example.com',
        role: 'staff',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        username: 'staff2',
        email: 'staff2@example.com',
        role: 'staff',
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        username: 'admin2',
        email: 'admin2@example.com',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ];

    // Add the current user if not already present
    if (user && !initialUsers.find(u => u.id === user.id)) {
      initialUsers.push({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: new Date().toISOString(),
        is_superuser: user.id === 1  // Only the user with ID 1 is a superuser
      });
    }

    setUsers(initialUsers);
    setLoading(false);
    setError('');
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
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
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
      // Update user in local state
      setUsers(users.map(userItem => {
        const itemId = userItem.id;
        return itemId === userId ? { ...userItem, role: selectedRole } : userItem;
      }));
      
      setEditingUser(null);
      setSelectedRole('');
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
                        <Select 
                          value={selectedRole} 
                          onChange={handleRoleChange}
                          size="small"
                          fullWidth
                        >
                          <MenuItem value="staff">Staff</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      ) : (
                        <RoleChip
                          label={userItem.role || 'Unknown'}
                          roleType={userItem.role || 'inactive'}
                          size="small"
                        />
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