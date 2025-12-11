import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  AlertTitle,
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
  LocationOn,
  People,
  CalendarToday,
  AccessTime,
  DirectionsCar,
  Message,
  CheckCircle,
  Download,
  Close
} from '@mui/icons-material';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { bookingsAPI } from '../../utils/api';

const carOptions = [
  'Corolla Altis',
  'Camry',
  'Fortuner',
  'Mercedes E-Class',
  'Audi A6',
  'MERCEDES w210',
  'Peugeot 3008',
  'Mark-X',
  'Honda BR-V'
];

const RideBookingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    start: '',
    end: '',
    passengers: '',
    date: '',
    time: '',
    vehicleClass: '',
    message: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCar, setSelectedCar] = useState('');
  const [paymentSuccessDialog, setPaymentSuccessDialog] = useState({ open: false, data: null });
  const [downloading, setDownloading] = useState(false);

  // Get selected car from URL parameters instead of localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const carFromUrl = urlParams.get('car');
    
    if (carFromUrl) {
      setSelectedCar(decodeURIComponent(carFromUrl));
    }
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const priceMap = {
        'Corolla Altis': 5000,
        'Camry': 8000,
        'Fortuner': 12000,
        'Mercedes E-Class': 15000,
        'Audi A6': 14000,
        'MERCEDES w210': 10000,
        'Peugeot 3008': 9000,
        'Mark-X': 7000,
        'Honda BR-V': 6000
      };
      const totalAmount = priceMap[formData.vehicleClass] || 5000;
      
      // Save booking to MongoDB (no payment required initially)
      const bookingData = {
        carName: formData.vehicleClass,
        pickupLocation: formData.start,
        dropLocation: formData.end,
        date: formData.date,
        time: formData.time,
        passengers: parseInt(formData.passengers),
        totalAmount: totalAmount,
        customerName: formData.name,
        customerPhone: formData.phone,
        message: formData.message,
        status: 'pending',
        paymentStatus: 'pending'
      };
      
      console.log('Saving booking to MongoDB:', bookingData);
      const bookingResponse = await bookingsAPI.createTestBooking(bookingData);
      console.log('Booking saved:', bookingResponse.data);
      
      // Show success dialog instead of immediate redirect
      setPaymentSuccessDialog({
        open: true,
        data: {
          message: 'Ride booking saved successfully! You can view and pay for your booking in the My Bookings section.'
        }
      });
      
    } catch (error) {
      console.error('Booking submission error:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Failed to save booking. Please try again.',
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



  return (
    <>
      <CustomerHeader />
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center', mb: 4 }}>
        <Container>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Book Your Ride
          </Typography>
        </Container>
      </Box>
      {/* Full-width Google Map */}
      <Box
        sx={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          ml: '-50vw',
          mr: '-50vw',
          mb: 4,
          overflow: 'hidden',
          boxShadow: 2,
        }}
      >
        <iframe
          title="location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13605.368088312844!2d74.31710900000001!3d31.5203696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904dd1c6f6e87%3A0x93f8b3c08e457f1a!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1713533131712!5m2!1sen!2s"
          style={{ width: '100%', height: 400, border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>
      <Container sx={{ mb: 8 }}>
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto', borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Name */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
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
                />
              </Box>
              {/* Phone */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
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
                />
              </Box>
              {/* Start Destination */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  placeholder="Start Destination"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="warning" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {/* End Destination */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  placeholder="End Destination"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="warning" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {/* Passengers */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
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
                />
              </Box>
              {/* Date */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
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
                />
              </Box>
              {/* Time */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
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
                />
              </Box>
              {/* Vehicle Class */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  select
                  label="Select Vehicle"
                  name="vehicleClass"
                  value={formData.vehicleClass}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCar color="warning" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {carOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {/* Message */}
              <Box sx={{ flex: '1 1 100%' }}>
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
              {/* Submit Button */}
              <Box sx={{ flex: '1 1 100%' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 'bold', fontSize: '1rem', letterSpacing: 1 }}
                >
                  BOOK YOUR CAR NOW
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
      <CustomerFooter />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          <AlertTitle>Success!</AlertTitle>
          {notification.message}
        </Alert>
      </Snackbar>

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
              {paymentSuccessDialog.data?.message || 'Your ride booking has been saved. You can view and pay for it in the My Bookings section.'}
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
    </>
  );
};

export default RideBookingForm; 