import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  useTheme,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  LocationOn as LocationOnIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

const CustomerAbout = () => {
  const [counter, setCounter] = useState(1);
  const theme = useTheme();

  useEffect(() => {
    const target = 25;
    const speed = 50;
    let count = 1;

    const interval = setInterval(() => {
      if (count < target) {
        count++;
        setCounter(count);
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, []);

  const workProcessSteps = [
    {
      icon: <ShieldIcon sx={{ fontSize: 35 }} />,
      title: 'SAFE GUARANTEE',
      description: 'Extensible for web iterate process before meta services impact with olisticly enable client.'
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 35 }} />,
      title: 'FASTEST PICKUPS',
      description: 'Extensible for web iterate process before meta services impact with olisticly enable client.'
    },
    {
      icon: <DirectionsCarIcon sx={{ fontSize: 35 }} />,
      title: 'QUICK RIDES',
      description: 'Extensible for web iterate process before meta services impact with olisticly enable client.'
    },
    {
      icon: <PersonIcon sx={{ fontSize: 35 }} />,
      title: 'CLEARED DRIVERS',
      description: 'Extensible for web iterate process before meta services impact with olisticly enable client.'
    }
  ];

  return (
    <>
      <CustomerHeader />
      
      {/* Page Header */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          py: 6,
          my: 6,
          mt: 0,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" sx={{ mb: 4, animation: 'slideInDown 1s' }}>
            About Us
          </Typography>
        </Container>
      </Box>

      {/* About Section */}
      <Container>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4, 
          mb: 8, 
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          overflow: 'hidden'
        }}>
          {/* Left: Car Image */}
          <Box sx={{ 
            flex: '0 0 auto', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: { xs: '100%', md: 220 },
            minWidth: 0
          }}>
            <Box
              component="img"
              src="/Customer/img/Innova.png"
              alt="Car Image"
              sx={{
                width: '100%',
                maxWidth: 220,
                height: 'auto',
                borderRadius: 2,
                mb: { xs: 2, md: 0 },
              }}
            />
          </Box>
          {/* Right: Text Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              color="primary" 
              sx={{ mb: 2 }}
            >
              MORE ABOUT US
            </Typography>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Here Is An Example With One Single Photo Displayed On The Right.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Travelers is a reliable and user-friendly taxi pre-booking platform designed to make every journey comfortable and well-organized. Our system offers a range of essential travel-related services that help customers plan their trips in advance with confidence and convenience. Whether it's a daily commute, intercity travel, airport transfer, or group trip, Travelers ensures timely and secure transportation.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, md: 4 }, 
              mb: 4,
              p: 3,
              bgcolor: 'grey.100',
              borderRadius: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              overflow: 'hidden'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {counter}+
                </Typography>
                <Typography variant="body2">
                  Years<br />Experience
                </Typography>
              </Box>
              <Typography variant="body1">
                Travelers is powered by a dedicated team of experienced professionals who prioritize customer satisfaction. From helping users find the most suitable travel options to ensuring smooth ride bookings, the team focuses on delivering reliable, budget-friendly, and well-organized travel experiences.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Work Process Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Typography 
            variant="subtitle1" 
            color="primary" 
            align="center" 
            sx={{ mb: 1 }}
          >
            OUR WORK PROCESS
          </Typography>
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            HOW WE WORKS
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3,
              textAlign: 'center',
            }}
          >
            {workProcessSteps.map((step, index) => (
              <Paper 
                key={index}
                elevation={0} 
                sx={{ 
                  p: 3, 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  {step.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <CustomerFooter />
    </>
  );
};

export default CustomerAbout;
