import React from 'react';
import CustomerHeader from '../Components/Customer/CustomerHeader';
import CustomerFooter from '../Components/Customer/CustomerFooter';
import CustomerProfileMenu from '../Components/Customer/CustomerProfileMenu';
import { Box, Container, Paper, Typography } from '@mui/material';

const CustomerProfile = () => {
  return (
    <>
      <CustomerHeader />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          background: 'linear-gradient(120deg, #FFD600 0% 50%, #2156B6 50% 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm" sx={{ zIndex: 1 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
              My Profile
            </Typography>
            <CustomerProfileMenu />
          </Paper>
        </Container>
      </Box>
      <CustomerFooter />
    </>
  );
};

export default CustomerProfile; 