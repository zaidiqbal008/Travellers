import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box>
        <Typography variant="h3" color="error.main" gutterBottom>
          Payment Cancelled
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your payment was not completed. You can try booking again.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go to Dashboard</Button>
      </Box>
    </Container>
  );
};

export default PaymentCancel; 