import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  DarkMode,
  LightMode,
  Speed,
  AccountCircle,
  ChatOutlined,
  DashboardOutlined,
  ExploreOutlined,
  CompareArrowsOutlined,
  HubOutlined,
  SettingsOutlined,
  LogoutOutlined,
  InfoOutlined
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.js';
import { useAppTheme } from '../context/ThemeContext.js';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, isDark, toggleTheme, reducedMotion, toggleReducedMotion } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Models', path: '/models', icon: <ExploreOutlined fontSize="small" /> },
    { label: 'Compare', path: '/compare', icon: <CompareArrowsOutlined fontSize="small" /> },
    { label: 'Providers', path: '/providers', icon: <HubOutlined fontSize="small" /> },
    { label: 'About', path: '/about', icon: <InfoOutlined fontSize="small" /> }
  ];

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Brand Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.5,
              mr: 4
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(0, 240, 255, 0.45)' : 'none'
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#07080e',
                  border: '2px solid #00f0ff'
                }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: isDark ? '#f8fafc' : '#0f172a',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Vups<span style={{ color: '#00f0ff' }}>Router</span>
            </Typography>
            <Chip
              label="v1.0 Free AI Hub"
              size="small"
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                height: 20,
                fontSize: '0.68rem',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                color: '#00f0ff',
                border: '1px solid rgba(0, 240, 255, 0.25)'
              }}
            />
          </Box>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: active ? '#00f0ff' : 'text.secondary',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                    border: active ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                    '&:hover': {
                      color: isDark ? '#f8fafc' : '#0f172a',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {isAuthenticated && (
              <>
                <Button
                  component={RouterLink}
                  to="/chat"
                  startIcon={<ChatOutlined fontSize="small" />}
                  sx={{
                    color: location.pathname.startsWith('/chat') ? '#00f0ff' : 'text.secondary',
                    fontWeight: location.pathname.startsWith('/chat') ? 700 : 500,
                    backgroundColor: location.pathname.startsWith('/chat') ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                    border: location.pathname.startsWith('/chat') ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent'
                  }}
                >
                  AI Chats
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  startIcon={<DashboardOutlined fontSize="small" />}
                  sx={{
                    color: location.pathname === '/dashboard' ? '#00f0ff' : 'text.secondary',
                    fontWeight: location.pathname === '/dashboard' ? 700 : 500
                  }}
                >
                  Dashboard
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Controls: Theme & Reduced Motion & Auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={reducedMotion ? 'Enable smooth 3D animations' : 'Reduce motion for performance'}>
              <IconButton
                onClick={toggleReducedMotion}
                size="small"
                sx={{
                  color: reducedMotion ? '#f59e0b' : 'text.secondary',
                  border: '1px solid var(--surface-border)'
                }}
                aria-label="Toggle reduced motion"
              >
                <Speed fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{
                  color: isDark ? '#00f0ff' : '#0284c7',
                  border: '1px solid var(--surface-border)'
                }}
                aria-label="Toggle color theme"
              >
                {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Box sx={{ ml: 1 }}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '1px solid #00f0ff' }}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: '#6366f1',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                  sx={{ mt: 1.5 }}
                  PaperProps={{
                    sx: { minWidth: 200, borderRadius: 2 }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard'); }}>
                    <DashboardOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/chat'); }}>
                    <ChatOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                    AI Workspace
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                    <SettingsOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                    Settings
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                    <LogoutOutlined fontSize="small" sx={{ mr: 1.5 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="outlined"
                  size="small"
                >
                  Sign In
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="small"
                >
                  Get Started
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, ml: 0.5 }}
              aria-label="Open mobile menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { width: 280, p: 2 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Vups<span style={{ color: '#00f0ff' }}>Router</span>
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          {navLinks.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                <Box sx={{ mr: 1.5, color: '#00f0ff' }}>{item.icon}</Box>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}

          {isAuthenticated ? (
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/chat"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ChatOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                  <ListItemText primary="AI Workspace" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <DashboardOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <SettingsOutlined fontSize="small" sx={{ mr: 1.5, color: '#00f0ff' }} />
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 2 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setMobileOpen(false); handleLogout(); }} sx={{ color: '#ef4444' }}>
                  <LogoutOutlined fontSize="small" sx={{ mr: 1.5 }} />
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <Divider sx={{ my: 2 }} />
              <ListItem disablePadding sx={{ mb: 1.5 }}>
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="outlined"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Button>
              </ListItem>
              <ListItem disablePadding>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Button>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
