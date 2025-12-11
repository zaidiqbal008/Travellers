import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import DriverHeader from '../Components/Driver/DriverHeader';
import DriverFooter from '../Components/Driver/DriverFooter';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  DirectionsCar,
  EmojiEvents,
  SupportAgent,
  CheckCircle,
  ArrowUpward
} from "@mui/icons-material";
import { authAPI } from '../utils/api';
import Chat from '../Components/Chat';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import ChatIcon from '@mui/icons-material/Chat';
import Avatar from '@mui/material/Avatar';
import { useActivityPing } from '../hooks/useActivityPing';

const Driver = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unread, setUnread] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Add userType check for driver
  useEffect(() => {
    const verifyDriver = async () => {
      try {
        const { data: user } = await authAPI.getCurrentUser();
        setCurrentUser(user);
        if (user && user.userType === 'driver') {
          setLoading(false);
        } else {
          console.log('User is not a driver, but not redirecting to avoid loop');
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching user, but not redirecting to avoid loop:', error);
        setLoading(false);
      }
    };
    verifyDriver();
  }, [navigate]);

  // Use activity ping to keep driver active
  useActivityPing(currentUser?._id);

  // Auto slide change for carousel
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveStep((prev) => (prev === 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(slideInterval);
    };
  }, []);

  // Poll for unread admin messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Replace with your real API endpoint for unread messages
        const res = await fetch(`/api/chat/unread?userId=${currentUser._id}&from=${adminUser._id}&type=admin-driver`, { credentials: 'include' });
        const data = await res.json();
        setUnread(data.unreadCount > 0);
      } catch (err) {
        // handle error
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [currentUser, adminUser]);

  const handleChatButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
    setChatOpen(true);
    setUnread(false);
  };
  const handleChatClose = () => {
    setChatOpen(false);
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <DriverHeader />

      {/* Carousel */}
      <Box sx={{ position: 'relative', height: { xs: '50vh', md: '70vh' }, overflow: 'hidden' }}>
        {activeStep === 0 ? (
          <Box 
            component="img" 
            src="/Driver/img/carousel-1.jpg" 
            alt="Drive With Confidence & Style"
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: 'brightness(0.7)'
            }} 
          />
        ) : (
          <Box 
            component="img" 
            src="/Driver/img/carousel-2.png" 
            alt="Safe Driving Is Our Top Priority"
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: 'brightness(0.7)'
            }} 
          />
        )}
        
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          textAlign: 'center', 
          color: 'white',
          width: '100%',
          px: 2
        }}>
          <Container maxWidth="md">
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                animation: 'slideInDown 1s ease-out'
              }}
            >
              {activeStep === 0 ? 'Drive With Confidence & Style' : 'Safe Driving Is Our Top Priority'}
            </Typography>
          </Container>
        </Box>

        {/* Carousel Controls */}
        <IconButton 
          onClick={() => setActiveStep(prev => prev === 0 ? 1 : 0)}
          sx={{ 
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton 
          onClick={() => setActiveStep(prev => prev === 1 ? 0 : 1)}
          sx={{ 
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <ArrowForward />
        </IconButton>

        {/* Carousel Indicators */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          display: 'flex', 
          gap: 1 
        }}>
          <IconButton 
            size="small" 
            onClick={() => setActiveStep(0)}
            sx={{ 
              bgcolor: activeStep === 0 ? 'primary.main' : 'rgba(255,255,255,0.3)',
              '&:hover': { bgcolor: activeStep === 0 ? 'primary.dark' : 'rgba(255,255,255,0.4)' }
            }}
          />
          <IconButton 
            size="small" 
            onClick={() => setActiveStep(1)}
            sx={{ 
              bgcolor: activeStep === 1 ? 'primary.main' : 'rgba(255,255,255,0.3)',
              '&:hover': { bgcolor: activeStep === 1 ? 'primary.dark' : 'rgba(255,255,255,0.4)' }
            }}
          />
        </Box>
      </Box>

      {/* Facts */}
      <Box bgcolor="#f8f9fa" py={6}>
        <Container>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              justifyContent: 'space-between',
              alignItems: 'stretch'
            }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                flex: 1,
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box 
                bgcolor="primary.main" 
                p={2} 
                borderRadius="50%" 
                color="white" 
                mr={2}
                sx={{
                  flexShrink: 0,
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DirectionsCar sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Easy And Safe Driving
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We ensure a safe and smooth ride with experienced drivers and well-maintained vehicles.
                </Typography>
              </Box>
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                flex: 1,
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box 
                bgcolor="primary.main" 
                p={2} 
                borderRadius="50%" 
                color="white" 
                mr={2}
                sx={{
                  flexShrink: 0,
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <EmojiEvents sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Professional Driver Group
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our team of professional drivers provides safe, courteous, and efficient transportation services.
                </Typography>
              </Box>
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                flex: 1,
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box 
                bgcolor="primary.main" 
                p={2} 
                borderRadius="50%" 
                color="white" 
                mr={2}
                sx={{
                  flexShrink: 0,
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SupportAgent sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Proper Licence Drivers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our drivers are fully licensed, experienced, and thoroughly vetted to ensure a safe and reliable ride.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* About */}
      <Container sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          {/* Left: Overlapping Images */}
          <Box sx={{ position: 'relative', minWidth: 340, width: 340, height: 340, flexShrink: 0 }}>
            {/* Main Image */}
            <Box
              component="img"
              src="/Driver/img/about-1.jpg"
              alt="Main About"
              sx={{
                width: 300,
                height: 220,
                borderRadius: 5,
                objectFit: 'cover',
                position: 'absolute',
                left: 40,
                top: 80,
                boxShadow: 3,
              }}
            />
            {/* Overlapping Small Image */}
            <Box
              component="img"
              src="/Driver/img/about-2.jpg"
              alt="Car"
              sx={{
                width: 120,
                height: 100,
                borderRadius: 5,
                objectFit: 'cover',
                position: 'absolute',
                left: 0,
                top: 0,
                boxShadow: 2,
                border: '4px solid white'
              }}
            />
          </Box>
          {/* Right: Text Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700, mb: 2 }}>
              ABOUT US
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              We Give Safe Ride To Passangers For Their Journey
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              We prioritize the safety and comfort of our passengers, providing reliable transportation services for a smooth and enjoyable journey. Our experienced drivers and well-maintained vehicles ensure a stress-free travel experience.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              We prioritize passenger safety with rigorous measures, including regular vehicle maintenance and thorough driver background checks. Your security is our top concern.
            </Typography>
            <Box sx={{ display: 'flex', gap: 6, mb: 4 }}>
              <Box>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'warning.main', mr: 1 }} /> Fully Licensed
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'warning.main', mr: 1 }} /> Affordable Ride
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'warning.main', mr: 1 }} /> Online Tracking
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'warning.main', mr: 1 }} /> Best Drivers
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <DriverFooter />

      {/* Back to top button */}
      <IconButton 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          bgcolor: 'primary.main', 
          color: 'white',
          '&:hover': { bgcolor: 'primary.dark' }
        }}
        href="#"
      >
        <ArrowUpward />
      </IconButton>

      <Badge color="error" variant="dot" invisible={!unread} sx={{ position: 'fixed', bottom: 36, right: 36, zIndex: 1201 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            minWidth: 0,
            width: 64,
            height: 64,
            borderRadius: '50%',
            boxShadow: 6,
            zIndex: 1201
          }}
          onClick={handleChatButtonClick}
        >
          <ChatIcon sx={{ fontSize: 36 }} />
        </Button>
      </Badge>
      <Popover
        open={chatOpen}
        anchorEl={anchorEl}
        onClose={handleChatClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 370,
            maxWidth: '90vw',
            height: 500,
            borderRadius: 3,
            boxShadow: 8,
            p: 0,
            overflow: 'hidden',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* Chat Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper' }}>
          <Avatar sx={{ width: 36, height: 36, mr: 1 }} src={'/Admin/img/admin-avatar.jpg'} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 16 }}>
            ADMIN
          </Typography>
        </Box>
        {/* Chat Body (flex: 1) */}
        {currentUser && adminUser && (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', bgcolor: '#fff' }}>
            console.log('currentUser:', currentUser);
            console.log('adminUser:', adminUser);
            <Chat
              currentUser={currentUser}
              otherUser={adminUser}
              conversationType="admin-driver"
              role="driver"
              fancy
            />
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default Driver;
