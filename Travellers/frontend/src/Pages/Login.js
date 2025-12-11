import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, IconButton, InputAdornment } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from "react-router-dom";
import { authAPI, sessionsAPI, userProfileAPI } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { emitUserLogin } = useSocket();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    if (!credentials.email || !credentials.password) {
      setMessage({ text: "Please fill in all fields", isError: true });
      return;
    }

    try {
      console.log('Attempting login with:', credentials.email);
      
      // Login user
      const loginResponse = await authAPI.login({
        email: credentials.email,
        password: credentials.password
      });

      console.log('Login response:', loginResponse);
      const { user } = loginResponse.data;

      // Create session in MongoDB
      try {
        await sessionsAPI.createSession();
      } catch (sessionError) {
        console.warn('Session creation failed:', sessionError);
        // Continue with login even if session creation fails
      }

      // Log user activity
      try {
        await userProfileAPI.logActivity({
          ipAddress: '127.0.0.1', // In production, get from request
          userAgent: navigator.userAgent,
          location: 'Unknown' // In production, get from IP geolocation
        });
      } catch (activityError) {
        console.warn('Activity logging failed:', activityError);
        // Continue even if activity logging fails
      }

      // Store user data in localStorage for logout functionality
      localStorage.setItem('user', JSON.stringify(user));

      // Emit Socket.IO event for real-time status tracking
      emitUserLogin(user);

      setMessage({ 
        text: `Login successful! Redirecting to dashboard...`, 
        isError: false 
      });

      setTimeout(() => {
        // Redirect based on userType
        if (user.userType === 'admin') {
          navigate('/admin');
        } else if (user.userType === 'customer') {
          navigate('/customer');
        } else if (user.userType === 'driver') {
          navigate('/driver');
        } else {
          // Fallback for existing accounts without userType
          if (user.email === 'admin@gmail.com') {
            navigate('/admin');
          } else if (user.email === 'driver@gmail.com') {
            navigate('/driver');
          } else {
            // Default fallback
            navigate('/customer');
          }
        }
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ 
        text: error.response?.data?.message || "Invalid email or password", 
        isError: true 
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg , #F3BD00 50%, #3a60ab 50%)",
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
          position: "relative"
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 10, left: 10 }}
          onClick={() => navigate("/")}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={credentials.email}
          onChange={handleInputChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={credentials.password}
          onChange={handleInputChange}
          margin="normal"
          required
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate('/forgot-password')}
            sx={{ 
              textTransform: 'none',
              color: '#3a60ab',
              '&:hover': {
                color: '#F3BD00'
              }
            }}
          >
            Forgot Password?
          </Button>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ 
            mt: 3, 
            mb: 2,
            backgroundColor: '#F3BD00',
            '&:hover': {
              backgroundColor: '#3a60ab',
            }
          }}
        >
          Login
        </Button>

        <Typography variant="body2" align="center">
          Don't have an account?{" "}
          <Link to="/signup" style={{ textDecoration: "none" }}>
            Sign up here
          </Link>
        </Typography>

        {message.text && (
          <Alert severity={message.isError ? "error" : "success"} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default Login;