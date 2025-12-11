import React from 'react';
import DriverHeader from '../Components/Driver/DriverHeader';
import DriverFooter from '../Components/Driver/DriverFooter';
import DriverProfileMenu from '../Components/Driver/DriverProfileMenu';
import { Box, Container, Paper, Typography } from '@mui/material';

const DriverProfile = () => {
  return (
    <>
      <DriverHeader />
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
            <DriverProfileMenu />
          </Paper>
        </Container>
      </Box>
      <DriverFooter />
    </>
  );
};

export default DriverProfile; 