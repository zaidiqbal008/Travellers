import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Card,
  Avatar,
  Rating,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { contactsAPI } from '../../utils/api';

const testimonials = [
  {
    id: 1,
    name: "Usman Rizwan",
    role: "Student",
    image: "/Customer/img/testimonial-1.jpg",
    text: "I've used Travelers multiple times and they've never disappointed. Drivers are always on time and super professional. The car was spotless and the ride was smooth from start to end.",
    rating: 4
  },
  {
    id: 2,
    name: "Ahmed Sheikh",
    role: "Job Worker",
    image: "/Customer/img/testimonial-2.jpg",
    text: "Really impressed with the prompt service. I booked late at night and still got a timely ride. Everything went smoothly except for a minor delay in confirmation.",
    rating: 5
  },
  {
    id: 3,
    name: "Fatima Zanaib",
    role: "Teacher",
    image: "/Customer/img/testimonial-3.jpg",
    text: "Hands down the best ride-booking experience I've had in Lahore! The app is user-friendly and the drivers are respectful and reliable. Highly recommended for safe travel.",
    rating: 5
  }
];

const CustomerContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      };

      // Submit contact form
      await contactsAPI.submitContact(contactData);

      setNotification({
        open: true,
        message: "Message sent successfully! We'll get back to you soon.",
        severity: 'success'
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to send message. Please try again.",
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <CustomerHeader />
      
      {/* Page Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
            Contact Us
          </Typography>
        </Container>
      </Box>

      {/* Contact Section */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={5}>
          {/* Contact Form */}
          <Grid item xs={12} lg={6}>
            <Typography color="primary" variant="h6" sx={{ textTransform: 'uppercase', mb: 1 }}>
              Contact Us
            </Typography>
            <Typography variant="h3" sx={{ mb: 2 }}>
              If You Have Any Query, Please Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              If you have any questions, concerns, or need further assistance, please don't hesitate to contact us. 
              Our team is always ready to help and ensure you have a smooth and satisfactory experience.
            </Typography>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Name */}
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' }, mb: 0 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Box>
                {/* Email */}
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' }, mb: 0 }}>
                  <TextField
                    fullWidth
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Box>
                {/* Phone */}
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' }, mb: 0 }}>
                  <TextField
                    fullWidth
                    label="Your Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Box>
                {/* Message */}
                <Box sx={{ flex: '1 1 100%', mb: 0 }}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Box>
                {/* Submit Button */}
                <Box sx={{ flex: '1 1 100%', mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography color="primary" variant="h6" sx={{ textTransform: 'uppercase', mb: 1 }}>
              Feedback
            </Typography>
            <Typography variant="h3">
              What Our Clients Say!
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    <Avatar
                      src={testimonial.image}
                      sx={{ width: 100, height: 100 }}
                    />
                    <Avatar
                      sx={{
                        position: 'absolute',
                        bottom: -20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'white',
                        width: 40,
                        height: 40
                      }}
                    >
                      <QuoteIcon color="primary" />
                    </Avatar>
                  </Box>
                  <Typography variant="body1" align="center" paragraph>
                    {testimonial.text}
                  </Typography>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Divider sx={{ width: '25%', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <CustomerFooter />
      
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

export default CustomerContact;
