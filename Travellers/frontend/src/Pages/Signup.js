import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";
import { authAPI, userProfileAPI } from '../utils/api';

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    phone: ""
  });
  const [userType, setUserType] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault();
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.dob || !formData.phone) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({
        open: true,
        message: "Please enter a valid email address.",
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
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        userType: userType,
        dob: formData.dob,
        phone: formData.phone
      };

      const response = await authAPI.signup(signupData);
      const { user } = response.data;

      // Create user profile
      try {
        await userProfileAPI.updateProfile({
          fullName: formData.username,
          phone: formData.phone,
          dob: formData.dob,
          preferences: {
            language: 'en',
            theme: 'light'
          }
        });
      } catch (profileError) {
        console.warn('Profile creation failed:', profileError);
        // Continue even if profile creation fails
      }

      setNotification({
        open: true,
        message: "Signup successful! Redirecting to login...",
        severity: 'success'
      });

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
        phone: ""
      });

      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "An error occurred during signup. Please try again.",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3a60ab 50%, #f3bd00 50%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: 400,
          padding: 3,
          backgroundColor: "white",
          borderRadius: 2,
          position: "relative",
          boxShadow: 3
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "black",
          }}
          onClick={() => navigate("/login")}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" align="center" sx={{ color: "black", mb: 2, fontWeight: 'bold' }}>
          Create Account
        </Typography>

        <ToggleButtonGroup
          value={userType}
          exclusive
          onChange={handleUserTypeChange}
          sx={{ mb: 3, width: "100%" }}
        >
          <ToggleButton 
            value="customer" 
            sx={{ 
              width: "50%",
              '&.Mui-selected': {
                backgroundColor: '#3a60ab',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2a4a8b'
                }
              }
            }}
          >
            Customer
          </ToggleButton>
          <ToggleButton 
            value="driver" 
            sx={{ 
              width: "50%",
              '&.Mui-selected': {
                backgroundColor: '#3a60ab',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2a4a8b'
                }
              }
            }}
          >
            Driver
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          sx={{ mb: 2, backgroundColor: "white", borderRadius: 1 }}
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          sx={{ mb: 2, backgroundColor: "white", borderRadius: 1 }}
        />

        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Box>

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          required
          helperText="Password must be at least 6 characters long"
          sx={{ mb: 2, backgroundColor: "white", borderRadius: 1 }}
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
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          sx={{ mb: 3, backgroundColor: "white", borderRadius: 1 }}
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
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mb: 2,
            py: 1.5,
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
            'Create Account'
          )}
        </Button>

        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          Already have an account?{" "}
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

export default Signup;