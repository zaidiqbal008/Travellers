import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Snackbar,
  InputAdornment
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from '../utils/api';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setNotification({
        open: true,
        message: "Invalid reset link. Please request a new password reset.",
        severity: 'error'
      });
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000);
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setNotification({
        open: true,
        message: "All fields are required.",
        severity: 'error'
      });
      return false;
    }

    if (formData.password.length < 6) {
      setNotification({
        open: true,
        message: "Password must be at least 6 characters long.",
        severity: 'error'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setNotification({
        open: true,
        message: "Passwords do not match.",
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Frontend: Sending password reset request');
      console.log('Token:', token);
      console.log('New password:', formData.password);
      console.log('Password length:', formData.password.length);
      
      await authAPI.resetPassword(token, formData.password);
      
      console.log('✅ Frontend: Password reset successful');
      
      setNotification({
        open: true,
        message: "Password reset successful! Redirecting to login...",
        severity: 'success'
      });

      // Reset form
      setFormData({
        password: "",
        confirmPassword: ""
      });
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('❌ Frontend: Reset password error:', error);
      console.error('Error response:', error.response?.data);
      setNotification({
        open: true,
        message: error.response?.data?.message || "An error occurred. Please try again.",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault();
  };

  if (!token) {
    return null; // Don't render the form if no token
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3a60ab 50%, #F3BD00 50%)",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "90%",
          maxWidth: 400,
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          position: "relative",
          boxShadow: 3
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 10, left: 10 }}
          onClick={() => navigate("/login")}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
        </Typography>

        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          Enter your new password below.
        </Typography>

        <TextField
          fullWidth
          label="New Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          margin="normal"
          required
          disabled={loading}
          helperText="Password must be at least 6 characters long"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          margin="normal"
          required
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownConfirmPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ 
            mt: 3, 
            mb: 2,
            backgroundColor: '#3a60ab',
            '&:hover': {
              backgroundColor: '#F3BD00',
            },
            '&:disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Reset Password'
          )}
        </Button>

        <Typography variant="body2" align="center">
          Remember your password?{" "}
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ 
              textTransform: 'none',
              color: '#3a60ab',
              '&:hover': {
                color: '#F3BD00'
              }
            }}
          >
            Login here
          </Button>
        </Typography>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ResetPassword; 