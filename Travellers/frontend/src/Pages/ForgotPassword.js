import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Snackbar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../utils/api';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setNotification({
        open: true,
        message: "Please enter your email address.",
        severity: 'error'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification({
        open: true,
        message: "Please enter a valid email address.",
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      
      setNotification({
        open: true,
        message: "Password reset email sent! Please check your inbox.",
        severity: 'success'
      });

      // Reset form
      setEmail("");
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Forgot password error:', error);
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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F3BD00 50%, #3a60ab 50%)",
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
          Forgot Password
        </Typography>

        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          disabled={loading}
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
            backgroundColor: '#F3BD00',
            '&:hover': {
              backgroundColor: '#3a60ab',
            },
            '&:disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Send Reset Link'
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

export default ForgotPassword; 