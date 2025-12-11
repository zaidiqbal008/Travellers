import React, { useEffect } from 'react';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success' && sessionId) {
      // Redirect to customer panel with success parameters
      setTimeout(() => {
        navigate(`/customer?payment=success&session_id=${sessionId}`, { replace: true });
      }, 2000);
    }
  }, [navigate, location.search]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h3" color="success.main" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Thank you for your payment. Your booking is being processed.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Redirecting you to your booking details...
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/customer')}>
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccess; 