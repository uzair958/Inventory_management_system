import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  AlertTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';

// CSS-based icons
const NotificationIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔔"',
    fontSize: '1.2rem'
  }
});

const SecurityIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔒"',
    fontSize: '1.2rem'
  }
});

const ThemeIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🎨"',
    fontSize: '1.2rem'
  }
});

const LanguageIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🌐"',
    fontSize: '1.2rem'
  }
});

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      lowStock: true,
      newProducts: false
    },
    appearance: {
      darkMode: false,
      compactView: false
    },
    security: {
      twoFactorAuth: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSettingChange = (category, setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: event.target.checked
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would call an API to save the settings
      // await userService.saveSettings(settings);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
    setPasswordError('');
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would call an API to change the password
      // await userService.changePassword(passwordForm);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      handlePasswordDialogClose();
      setSuccess('Password changed successfully!');
    } catch (err) {
      setPasswordError('Failed to change password. Please check your current password and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>Development Notice</AlertTitle>
        The settings functionality is currently under development. The interface displayed below represents the planned features that will be implemented in future updates. Thank you for your understanding.
      </Alert>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List component="nav">
                <ListItem button component="a" href="#notifications">
                  <ListItemIcon>
                    <NotificationIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItem>

                <ListItem button component="a" href="#appearance">
                  <ListItemIcon>
                    <ThemeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Appearance" />
                </ListItem>

                <ListItem button component="a" href="#security">
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Security" />
                </ListItem>

                <ListItem button component="a" href="#language">
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Language" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }} id="notifications">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={handleSettingChange('notifications', 'email')}
                    disabled={true}
                  />
                }
                label="Email Notifications"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Receive notifications via email for important updates.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.browser}
                    onChange={handleSettingChange('notifications', 'browser')}
                    disabled={true}
                  />
                }
                label="Browser Notifications"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Receive notifications in your browser when you're logged in.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.lowStock}
                    onChange={handleSettingChange('notifications', 'lowStock')}
                    disabled={true}
                  />
                }
                label="Low Stock Alerts"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Get notified when products are running low on stock.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.newProducts}
                    onChange={handleSettingChange('notifications', 'newProducts')}
                    disabled={true}
                  />
                }
                label="New Product Notifications"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Get notified when new products are added to the inventory.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }} id="appearance">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appearance Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.appearance.darkMode}
                    onChange={handleSettingChange('appearance', 'darkMode')}
                    disabled={true}
                  />
                }
                label="Dark Mode"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Use dark theme for the application interface.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.appearance.compactView}
                    onChange={handleSettingChange('appearance', 'compactView')}
                    disabled={true}
                  />
                }
                label="Compact View"
              />

              <Box sx={{ ml: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Display more items per page with reduced spacing.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }} id="security">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={handleSettingChange('security', 'twoFactorAuth')}
                    disabled={true}
                  />
                }
                label="Two-Factor Authentication"
              />

              <Box sx={{ ml: 3, mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Add an extra layer of security to your account.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                color="primary"
                onClick={handlePasswordDialogOpen}
                disabled={true}
                title="This functionality is not yet implemented"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }} id="language">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Language Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" paragraph>
                Select your preferred language for the application interface.
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" sx={{ mr: 1, mb: 1 }} disabled={true}>
                  English
                </Button>
                <Button variant="outlined" sx={{ mr: 1, mb: 1 }} disabled={true}>
                  Spanish
                </Button>
                <Button variant="outlined" sx={{ mr: 1, mb: 1 }} disabled={true}>
                  French
                </Button>
                <Button variant="outlined" sx={{ mr: 1, mb: 1 }} disabled={true}>
                  German
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Note: Language settings are currently in development and may not affect all parts of the application.
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              disabled={true}
              title="This functionality is not yet implemented"
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your current password and a new password.
          </DialogContentText>

          {passwordError && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {passwordError}
            </Alert>
          )}

          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
