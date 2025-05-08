import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledLink = styled(RouterLink)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'none',
  },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// CSS-based icons for navigation
const MenuButton = styled(IconButton)({
  '&::before': {
    content: '"☰"',
    fontSize: '1.5rem'
  }
});

const DashboardIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"📊"',
    fontSize: '1.2rem'
  }
});

const ProductsIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"📦"',
    fontSize: '1.2rem'
  }
});

const StoresIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🏪"',
    fontSize: '1.2rem'
  }
});

const SuppliersIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"👥"',
    fontSize: '1.2rem'
  }
});

const UsersIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"👤"',
    fontSize: '1.2rem'
  }
});

const LoginIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🔑"',
    fontSize: '1.2rem'
  }
});

const RegisterIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"📝"',
    fontSize: '1.2rem'
  }
});

const ArrowDownIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"▼"',
    fontSize: '0.7rem'
  }
});

const ProfileIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"👤"',
    fontSize: '1.2rem'
  }
});

const SettingsIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"⚙️"',
    fontSize: '1.2rem'
  }
});

const LogoutIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"🚪"',
    fontSize: '1.2rem'
  }
});

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    handleProfileMenuClose();
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.includes(path);
  };

  // Navigation items with CSS-based icons
  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/products', label: 'Products', icon: <ProductsIcon /> },
    { path: '/stores', label: 'Stores', icon: <StoresIcon /> },
    { path: '/suppliers', label: 'Suppliers', icon: <SuppliersIcon /> },
    ...(user?.role === 'admin' ? [
      { path: '/users', label: 'Users', icon: <UsersIcon /> }
    ] : []),
  ] : [
    { path: '/login', label: 'Login', icon: <LoginIcon /> },
    { path: '/register', label: 'Register', icon: <RegisterIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ width: 240 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Typography variant="h6" component="div" color="primary">
          Inventory MS
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            component={StyledLink}
            to={item.path}
            key={item.path}
            sx={{
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
              bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <MenuButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            />
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            <StyledLink to="/">
              Inventory MS
            </StyledLink>
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  component={StyledLink}
                  to={item.path}
                  active={isActive(item.path) ? 1 : 0}
                  startIcon={item.icon}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>
          )}

          {isAuthenticated && (
            <Box>
              <Button
                onClick={handleProfileMenuOpen}
                color="inherit"
                endIcon={<ArrowDownIcon />}
                startIcon={
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                }
              >
                {!isMobile && (user?.username || 'User')}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 1, px: 2 }}>
                  <Typography variant="subtitle2">{user?.role || 'User'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'email@example.com'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={StyledLink} to="/profile" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <ProfileIcon />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem component={StyledLink} to="/settings" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;