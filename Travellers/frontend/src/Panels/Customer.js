import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  useTheme,
  Fade,
  CircularProgress,
  Avatar,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CarRental,
  ArrowForward,
  ArrowBack,
  Description,
  Groups,
  Timer as TimerIcon,
  Luggage as LuggageIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../Components/Customer/CustomerHeader';
import CustomerFooter from '../Components/Customer/CustomerFooter';
import { feedbackAPI, authAPI } from '../utils/api';
import Chat from '../Components/Chat';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import { useActivityPing } from '../hooks/useActivityPing';

const Customer = () => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unread, setUnread] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const carouselItems = [
    {
      img: "/Customer/img/carousel-1.jpg",
      title: "Make Your Journey Memorable",
      subtitle: "Book For Ride"
    },
    {
      img: "/Customer/img/carousel-2.png",
      title: "Safe Your Vocation",
      subtitle: "Book For Ride"
    }
  ];

  const facts = [
    {
      icon: <CarRental />,
      title: "Easy And Safe Driving",
      description: "Enjoy smooth and secure rides with our user-friendly booking system."
    },
    {
      icon: <Groups />,
      title: "Professional Driver Group",
      description: "Travel with trained, courteous, and experienced drivers."
    },
    {
      icon: <Description />,
      title: "Proper licence Drivers",
      description: "All drivers are fully verified and hold valid driving licenses."
    }
  ];

  const cars = [
    {
      name: "Corolla Altis",
      price: "Rs. 20/km",
      img: "/Customer/img/altis.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8HR/80KM : 3200" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 400" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Camry",
      price: "Rs. 35/km",
      img: "/Customer/img/Camry.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8HR/80KM : 6400" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 800" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Fortuner",
      price: "Rs. 35/km",
      img: "/Customer/img/fortuner.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8HR/80KM : 6400" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 800" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Mercedes E-Class",
      price: "Rs. 50/km",
      img: "/Customer/img/e-class.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8 HR/80KM : 12000" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 1500" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Audi A6",
      price: "Rs. 65/km",
      img: "/Customer/img/audi.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8 HR/80KM : 12000" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 1500" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "MERCEDES w210",
      price: "Rs. 35/km",
      img: "/Customer/img/w210.jpg",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8HR/80KM : 6400" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 800" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Peugeot 3008",
      price: "Rs. 50/km",
      img: "/Customer/img/3008.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8 HR/80KM : 12000" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 1500" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Mark-X",
      price: "Rs. 100/km",
      img: "/Customer/img/mark-x.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8 HR/80KM : 64000" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 1500" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    },
    {
      name: "Honda BR-V",
      price: "Rs. 35/km",
      img: "/Customer/img/BR-V.png",
      details: [
        { icon: <SpeedIcon />, text: "Rate: 8HR/80KM : 6400" },
        { icon: <TimerIcon />, text: "Extra Hr Rate: Rs. 800" },
        { icon: <GroupIcon />, text: "Passengers: 4" },
        { icon: <LuggageIcon />, text: "Luggage Carry: 3" }
      ]
    }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get the logged-in customer
        const { data: user } = await authAPI.getCurrentUser();
        console.log("Current user:", user); // <-- Add this line
        setCurrentUser(user);
        // Get the admin user from backend
        const adminRes = await fetch('/api/users?type=admin');
        const adminData = await adminRes.json();
        setAdminUser(adminData.users && adminData.users.length > 0 ? adminData.users[0] : null);
      } catch (err) {
        setCurrentUser(null);
        setAdminUser(null);
      }
    };
    fetchUsers();
  }, []);

  // Add userType check for customer
  useEffect(() => {
    const verifyCustomer = async () => {
      try {
        const { data: user } = await authAPI.getCurrentUser();
        setCurrentUser(user);
        if (user && user.userType === 'customer') {
          setLoading(false);
        } else {
          console.log('User is not a customer, but not redirecting to avoid loop');
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching user, but not redirecting to avoid loop:', error);
        setLoading(false);
      }
    };
    verifyCustomer();
  }, [navigate]);

  // Check for payment success in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      // Show payment success notification
      console.log('Payment success detected:', sessionId);
      
      // Verify payment with backend
      const verifyPayment = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/payments/verify-payment/${sessionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            setNotification({
              open: true,
              message: 'Payment verified successfully! Your booking has been confirmed.',
              severity: 'success'
            });
          } else {
            setNotification({
              open: true,
              message: 'Payment received but verification failed. Please contact support.',
              severity: 'warning'
            });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setNotification({
            open: true,
            message: 'Payment received but verification failed. Please contact support.',
            severity: 'warning'
          });
        }
      };
      
      verifyPayment();
      
      // Clear URL parameters after showing notification
      setTimeout(() => {
        navigate('/customer', { replace: true });
      }, 5000);
    }
  }, [navigate]);

  // Use activity ping to keep customer active
  useActivityPing(currentUser?._id);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const nextSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const feedbackData = {
        email: feedbackEmail,
        feedback: 'Newsletter subscription',
        rating: 5
      };
        await feedbackAPI.submitFeedback(feedbackData);
      alert("Thank you for subscribing to our newsletter!");
      setFeedbackEmail('');
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  const handleBookCar = (carName) => {
    navigate(`/customer/ride-booking?car=${encodeURIComponent(carName)}`);
  };

  const handleChatButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
    setChatOpen(true);
    setUnread(false);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setAnchorEl(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <CustomerHeader />
      <Box sx={{ position: 'relative', height: '80vh', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Box
            component="img"
            src={carouselItems[activeIndex].img}
            alt={carouselItems[activeIndex].title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.7)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 400,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white'
            }}
          >
            <Container>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {carouselItems[activeIndex].subtitle}
                  </Typography>
                  <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
                    {carouselItems[activeIndex].title}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/customer/ride-booking')}
                  >
                    Book Now
                  </Button>
                </Box>
              </Fade>
            </Container>
          </Box>
        </Box>

        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>

      <Box sx={{ py: 8, backgroundColor: theme.palette.grey[100] }}>
        <Container>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 4
          }}>
            {facts.map((fact, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  minWidth: 0
                }}
              >
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: '50%',
                        width: 60,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        flexShrink: 0
                      }}
                    >
                      {fact.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {fact.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {fact.description}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 8, backgroundColor: theme.palette.grey[50] }}>
        <Container>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {cars.map((car, index) => (
              <Box key={index} sx={{ flex: '1 1 30%', maxWidth: '30%', minWidth: 280, mb: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={car.img}
                    alt={car.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2" align="center" sx={{ textTransform: 'uppercase' }}>
                      {car.name}
                    </Typography>
                    <Typography color="text.secondary" align="center" paragraph>
                      {car.price}
                    </Typography>
                    <List dense>
                      {car.details.map((detail, i) => (
                        <ListItem key={i}>
                          <ListItemIcon sx={{ minWidth: 36, color: theme.palette.warning.main }}>
                            {detail.icon}
                          </ListItemIcon>
                          <ListItemText primary={detail.text} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      sx={{ mt: 2 }}
                      onClick={() => handleBookCar(car.name)}
                    >
                      Book This Car Now
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      <CustomerFooter />
      
      <Badge color="error" variant="dot" invisible={!unread} sx={{ position: 'fixed', bottom: 36, right: 36, zIndex: 1201 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 100,
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
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', bgcolor: '#fff' }}>
          {currentUser ? (
            <Chat
              currentUser={currentUser}
              otherUser={adminUser}
              conversationType="admin-customer"
              role="customer"
              fancy
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%', color: '#666' }}>
                Loading chat...
              </Box>
              {/* Show FAQ buttons even when loading */}
              <Box sx={{ padding: '10px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: '8px', fontWeight: 500 }}>
                  Quick Questions:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['How do I book a ride?', 'What payment methods are accepted?', 'How can I contact support?', 'What are the available car types?', 'How do I cancel a booking?', 'What is the refund policy?'].slice(0, 6).map((faq, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Show a message that user needs to be logged in
                        alert('Please wait for chat to load completely to use FAQ features.');
                      }}
                      style={{
                        background: '#e3f2fd',
                        border: '1px solid #2196f3',
                        borderRadius: '12px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#1976d2',
                        margin: '2px',
                        fontWeight: '500'
                      }}
                    >
                      {faq}
                    </button>
                  ))}
                </div>
              </Box>
            </Box>
          )}
        </Box>
      </Popover>

      {/* Payment Success Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            '& .MuiAlert-icon': {
              fontSize: 24
            },
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Customer;