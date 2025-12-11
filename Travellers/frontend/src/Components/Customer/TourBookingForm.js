import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  useTheme,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Phone,
  People,
  CalendarToday,
  AccessTime,
  DirectionsCar,
  Message,
  CheckCircle,
  Download,
  Close
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { tripsAPI } from '../../utils/api';

const TourBookingForm = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passengers: '',
    date: '',
    time: '',
    tourType: '',
    message: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [paymentSuccessDialog, setPaymentSuccessDialog] = useState({ open: false, data: null });
  const [downloading, setDownloading] = useState(false);

  // Set tour type from navigation state if available
  useEffect(() => {
    if (location.state?.selectedTour) {
      setFormData(prev => ({ ...prev, tourType: location.state.selectedTour }));
    }
  }, [location.state]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const priceMap = {
        'NARAN KAGHAN TOUR': 25000,
        'ABBOTTBAD TOUR': 15000,
        'AZAD KASHMIR TOUR': 30000,
        'HARNOI WATERFALL TOUR': 12000,
        'AYUBIA PIPELINE TOUR': 18000,
        'NATHIA GALI TOUR': 20000
      };
      const totalAmount = priceMap[formData.tourType] || 15000;
      
      // Save tour booking to MongoDB (no payment required initially)
      const tripData = {
        tourType: formData.tourType,
        name: formData.name,
        phone: formData.phone,
        passengers: parseInt(formData.passengers),
        date: formData.date,
        time: formData.time,
        message: formData.message,
        totalAmount: totalAmount,
        status: 'pending',
        paymentStatus: 'pending'
      };
      
      console.log('Saving tour booking to MongoDB:', tripData);
      const tripResponse = await tripsAPI.createTestTrip(tripData);
      console.log('Tour booking saved:', tripResponse.data);
      
      // Show success dialog instead of immediate redirect
      setPaymentSuccessDialog({
        open: true,
        data: {
          message: 'Tour booking saved successfully! You can view and pay for your booking in the My Bookings section.'
        }
      });
      
    } catch (error) {
      console.error('Tour booking submission error:', error);
      
      let errorMessage = 'Failed to save tour booking. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };





  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleClosePaymentDialog = () => {
    setPaymentSuccessDialog({ open: false, data: null });
    // Navigate to My Bookings after closing dialog
    navigate('/customer/mybookings');
  };



  const tourOptions = [
    'NARAN KAGHAN TOUR',
    'ABBOTTBAD TOUR',
    'AZAD KASHMIR TOUR',
    'HARNOI WATERFALL TOUR',
    'AYUBIA PIPELINE TOUR',
    'NATHIA GALI TOUR'
  ];

  return (
    <>
      <CustomerHeader />
      
      {/* Page Header */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          py: 6,
          mb: 6,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              animation: 'slideInDown 1s'
            }}
          >
            Book Your Tour
          </Typography>
        </Container>
      </Box>

      {/* Booking Form */}
      <Container sx={{ mb: 8, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            maxWidth: 700, 
            width: '100%',
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Left column */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                />
                <TextField
                  fullWidth
                  placeholder="Passengers#"
                  name="passengers"
                  type="number"
                  value={formData.passengers}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <People color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                />
                <TextField
                  fullWidth
                  placeholder="Select Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                />
              </Box>
              {/* Right column */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                />
                <TextField
                  fullWidth
                  placeholder="Select Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                />
                <TextField
                  fullWidth
                  select
                  placeholder="Select Your Tour"
                  label="Select Your Tour"
                  name="tourType"
                  value={formData.tourType}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCar color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 0 }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {tourOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {/* Message field full width */}
              <Box sx={{ flex: '1 1 100%', mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a Message..."
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Message color="warning" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {/* Submit Button full width */}
              <Box sx={{ flex: '1 1 100%', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 2,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    letterSpacing: 1
                  }}
                >
                  BOOK YOUR TOUR NOW
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
      <CustomerFooter />
      
      {/* Payment Success Dialog */}
      <Dialog
        open={paymentSuccessDialog.open}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 3,
          px: 4
        }}>
          <CheckCircle sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Booking Saved!
          </Typography>
          <IconButton
            onClick={handleClosePaymentDialog}
            sx={{ color: 'white', ml: 'auto' }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 4, pb: 2 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
              Booking Saved Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {paymentSuccessDialog.data?.message || 'Your tour booking has been saved. You can view and pay for it in the My Bookings section.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0, gap: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleClosePaymentDialog}
            variant="contained"
            color="success"
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            View My Bookings
          </Button>
          <Button
            onClick={() => setPaymentSuccessDialog({ open: false, data: null })}
            variant="outlined"
            color="primary"
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </>
  );
};

export default TourBookingForm; 