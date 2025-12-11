import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Toolbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { sessionsAPI } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const { emitUserLogout } = useSocket();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/bookings') return 'Bookings Management';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/maintenance') return 'Maintenance Management';
    return 'Dashboard';
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Get current user ID before logout
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Emit Socket.IO logout event
      if (currentUser.id) {
        emitUserLogout(currentUser.id);
      }

      // Deactivate session in MongoDB
      await sessionsAPI.logout();
    } catch (error) {
      console.warn('Session logout failed:', error);
      // Continue with logout even if session deactivation fails
    }

    // Clear admin-related data from local storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show logout success message
    setLogoutSuccess(true);
    handleClose();
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <AppBar 
      position="fixed" 
      color="inherit" 
      elevation={2}
      sx={{
        ml: '250px', // Match sidebar width
        width: 'calc(100% - 250px)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ px: 3, py: 1, minHeight: '64px' }}>
        {/* Page Title - Full Width */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1,
          justifyContent: 'space-between'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.primary',
              fontSize: '1.5rem',
              fontWeight: 600,
              flex: 1,
              textAlign: 'left',
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Right side - User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Box 
              onClick={handleProfileClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  '& .MuiTypography-root': {
                    color: 'primary.main',
                  }
                }
              }}
            >
              <Avatar
                src="/Admin/img/admin-avatar.jpg"
                alt="Admin"
                sx={{ 
                  width: 40, 
                  height: 40,
                  mr: 1,
                }}
              />
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Admin
                </Typography>
              </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                sx: { 
                  mt: 1.5,
                  minWidth: 200,
                  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
