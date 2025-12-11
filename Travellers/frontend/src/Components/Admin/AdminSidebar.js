import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import logo from '../logo.png';

const AdminSidebar = () => {
  const location = useLocation();
  
  // Function to check if a path is active
  const isPathActive = (path) => {
    if (path === '/admin' && (location.pathname === '/admin' || location.pathname === '/admin/')) {
      return true;
    }
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Bookings', icon: <CalendarIcon />, path: '/admin/bookings' },
    { text: 'Users', icon: <PersonIcon />, path: '/admin/users' },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/admin/maintenance' },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        width: 250,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1200,
        overflowY: 'auto',
        overflowX: 'hidden',
        transform: 'translateZ(0)', // Prevents vibration during scrolling
        willChange: 'transform', // Optimizes for animations and transformations
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button component={Link} to="/" sx={{ p: 0 }}>
          <img src={logo} alt="Logo" style={{ height: 70 }} />
        </Button>
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 2, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              mb: 0.5,
              py: 1.5,
              px: 2,
              borderRadius: 1,
              color: 'text.primary',
              textDecoration: 'none',
              bgcolor: isPathActive(item.path) ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
              borderLeft: isPathActive(item.path) ? 3 : 0,
              borderLeftColor: 'primary.main',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isPathActive(item.path) ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isPathActive(item.path) ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminSidebar;
