import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { authAPI } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import { useProfile } from '../../contexts/ProfileContext';
import logo from '../logo.png';

const DriverHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const { emitUserLogout } = useSocket();
  const { profileImage, clearProfileData } = useProfile();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authAPI.getCurrentUser();
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    fetchUser();
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const buttonStyles = (path) => ({
    "&:hover": { backgroundColor: "#3a60aa", color: "white" },
    backgroundColor: isActive(path) ? "#F3BD00" : "inherit",
    color: isActive(path) ? "white" : "inherit",
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
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

      // Logout from server
      await authAPI.logout();
      
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Clear profile data
      clearProfileData();
      
      // Show logout success message
      setLogoutSuccess(true);
      handleMenuClose();
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if logout fails
      navigate('/login');
    }
  };

  const handleCloseSnackbar = () => {
    setLogoutSuccess(false);
  };

  return (
    <>
      {/* Success notification */}
      <Snackbar
        open={logoutSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Logged out successfully!
        </Alert>
      </Snackbar>

      <AppBar position="static" sx={{ backgroundColor: "white", color: "black" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
          <Button component={Link} to="/driver" sx={{ p: 0 }}>
            <img src={logo} alt="Logo" style={{ height: 70 }} />
          </Button>

          <Box sx={{ display: "flex", gap: 2, flexGrow: 1, justifyContent: "center" }}>
            <Button
              component={Link}
              to="/driver"
              color="inherit"
              sx={buttonStyles("/driver")}
              aria-current={isActive("/driver") ? "page" : undefined}
            >
              Home
            </Button>

            <Button
              component={Link}
              to="/driver/assigned-bookings"
              color="inherit"
              sx={buttonStyles("/driver/assigned-bookings")}
              aria-current={isActive("/driver/assigned-bookings") ? "page" : undefined}
            >
              My Bookings
            </Button>

            <Button
              component={Link}
              to="/driver/about"
              color="inherit"
              sx={buttonStyles("/driver/about")}
              aria-current={isActive("/driver/about") ? "page" : undefined}
            >
              About Us
            </Button>

            <Button
              component={Link}
              to="/driver/profile"
              color="inherit"
              sx={buttonStyles("/driver/profile")}
              aria-current={isActive("/driver/profile") ? "page" : undefined}
            >
              Profile
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar 
                alt="Driver" 
                src={profileImage || user?.profilePicture || "/img/team-1.png"} 
                sx={{ width: 40, height: 40 }} 
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 200,
                  p: 1,
                },
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/driver/profile'); }}>
                User Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default DriverHeader;