import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverHeader from './DriverHeader';
import DriverFooter from './DriverFooter';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Rating,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  CalendarToday
} from '@mui/icons-material';
import { authAPI, myBookingsAPI } from '../../utils/api';

const DriverRider = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    const verifyDriver = async () => {
      try {
        console.log('Verifying driver access for rides...');
        const { data: user } = await authAPI.getCurrentUser();
        console.log('Current user data:', user);
        
        if (user && user.userType === 'driver') {
          console.log('Driver verification successful for rides');
          
          // Fetch completed bookings
          try {
            const { data } = await myBookingsAPI.getBookings();
            const completed = (data.bookings || []).filter(booking => booking.status === 'completed');
            setCompletedBookings(completed);
          } catch (error) {
            console.error('Error fetching completed bookings:', error);
          }
          
          setLoading(false);
        } else {
          console.log('User is not a driver, but not redirecting to avoid loop');
          setLoading(false);
        }
      } catch (error) {
        console.error("Driver verification failed for rides", error);
        console.log('Error fetching user, but not redirecting to avoid loop');
        setLoading(false);
      }
    };

    verifyDriver();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Convert completed bookings to ride history format
  const rideHistory = completedBookings.map(booking => ({
    id: booking._id,
    type: 'ride',
    image: '/Driver/img/fortuner.png', // Default image
    pickup: booking.pickupLocation,
    drop: booking.dropLocation,
    time: booking.time,
            fare: `Rs. ${booking.totalAmount}`,
    date: new Date(booking.date).toLocaleDateString(),
    rating: 4, // Default rating
    status: 'Successful Rides'
  }));

  const filteredRides = rideHistory.filter(ride => 
    activeFilter === 'all' ? true : ride.type === activeFilter
  );

  return (
    <Box>
      <DriverHeader />

      {/* Page Header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          py: 6,
          my: 6,
          mt: 0,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <Container sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            color="white" 
            sx={{ 
              fontWeight: 700,
              animation: 'slideInDown 1s ease-out'
            }}
          >
            Rides History
          </Typography>
        </Container>
      </Box>

      {/* Filter Buttons */}
      <Container>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button 
              variant={activeFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('all')}
              color="primary"
            >
              All Rides
            </Button>
            <Button 
              variant={activeFilter === 'ride' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('ride')}
              color="primary"
            >
              Successful Rides
            </Button>
            <Button 
              variant={activeFilter === 'tour' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('tour')}
              color="primary"
            >
              Successful Tours
            </Button>
          </Stack>
        </Box>

        {/* Ride Cards */}
        {filteredRides.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No completed rides yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete some rides to see them in your history
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'center',
              mb: 5
            }}
          >
            {filteredRides.map((ride) => (
            <Box
              key={ride.id}
              sx={{
                flex: '1 1 30%',
                maxWidth: '32%',
                minWidth: 280,
                mb: 4,
                display: 'block'
              }}
            >
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={ride.image}
                  alt={ride.type === 'ride' ? 'Car' : 'Tour Location'}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      Pickup: {ride.pickup}
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      {ride.type === 'ride' ? 'Drop: ' : 'Tour: '}{ride.drop}
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime color="primary" sx={{ mr: 1 }} />
                      Time: {ride.time}
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney color="primary" sx={{ mr: 1 }} />
                      Fare: {ride.fare}
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday color="primary" sx={{ mr: 1 }} />
                      Date: {ride.date}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                      <Rating 
                        value={ride.rating} 
                        readOnly 
                        precision={0.5}
                      />
                    </Box>
                    <Button 
                      variant="contained" 
                      color="warning"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {ride.status}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
          </Box>
        )}
      </Container>

      <DriverFooter />
    </Box>
  );
};

export default DriverRider; 