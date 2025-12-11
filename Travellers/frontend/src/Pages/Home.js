import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Paper, TextField, Button, Typography, Grid } from '@mui/material';
import MainImage from './Images/Main.png';

function Home() {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: `url(${MainImage})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
          height: { xs: '30vh', sm: '35vh', md: '40vh' },
          width: '100%',
          mb: { xs: 15, sm: 20, md: 30 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            textAlign: 'center',
            position: 'absolute',
            width: { xs: '90%', sm: '80%', md: '60%' },
            top: { xs: '120%', sm: '125%', md: '130%' },
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { xs: 2, sm: 3 },
            borderRadius: 2,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Welcome to Travelers
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              textAlign: 'justify',
              width: '100%', 
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, 
            }}
          >
            We provide fast, reliable, and affordable rides with pre-scheduled bookings, ensuring a seamless travel experience for daily commutes, intercity trips, and airport transfers.
          </Typography>
        </Typography>
      </Box>
      
      {/* Booking Form Section */}
      <Box sx={{ width: '100%', px: { xs: 1, sm: 2 } }}>
        <BookingForm />
      </Box>
    </Box>
  );
}

function BookingForm() {
  const navigate = useNavigate();

  const handleBooking = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: 3,
        width: '100%'
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Pre-Book Your Ride Now
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Pickup Location" 
              fullWidth 
              required 
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Drop-off Location" 
              fullWidth 
              required 
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              type="date" 
              label="Pickup Date" 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
              required 
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              type="time" 
                label="Pickup Time" 
                InputLabelProps={{ shrink: true }} 
              fullWidth 
              required 
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              onClick={handleBooking}
              sx={{ py: { xs: 1, sm: 1.5 } }}
            >
              Confirm Booking
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Home;
export { BookingForm };