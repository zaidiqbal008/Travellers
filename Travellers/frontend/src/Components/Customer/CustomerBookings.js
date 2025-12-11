import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Button
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  CalendarToday,
  AccessTime,
  Person,
  AttachMoney,
  Receipt,
  Download
} from '@mui/icons-material';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { bookingsAPI, tripsAPI, paymentsAPI } from '../../utils/api';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching all bookings and trips...');
      
      // Fetch both test bookings and trips (no auth required)
      const [bookingsResponse, tripsResponse] = await Promise.all([
        bookingsAPI.getTestBookings(),
        tripsAPI.getTestTrips(),
      ]);
      
      console.log('Bookings response:', bookingsResponse.data);
      console.log('Trips response:', tripsResponse.data);
      
      // Combine bookings and trips into one array
      const allBookings = [
        ...bookingsResponse.data.map(booking => ({ ...booking, type: 'ride' })),
        ...tripsResponse.data.map(trip => ({ ...trip, type: 'tour' }))
      ];
      
      console.log('Combined bookings:', allBookings);
      setBookings(allBookings);
      
      if (allBookings.length === 0) {
        console.log('No bookings found');
      }
    } catch (error) {
      console.error('❌ Error fetching bookings from MongoDB:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePayment = async (booking) => {
    try {
      console.log('Processing payment for booking:', booking);
      
      // Determine if it's a ride or tour booking
      const isRideBooking = booking.type === 'ride';
      
      if (isRideBooking) {
        // Handle ride booking payment
        const sessionRes = await paymentsAPI.createCarSession({
          carId: booking.carName,
          userId: booking.user,
          amount: booking.totalAmount,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          date: booking.date,
          time: booking.time,
          passengers: booking.passengers,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone
        });
        
        console.log('Ride payment session created:', sessionRes.data);
        window.location.href = sessionRes.data.url;
      } else {
        // Handle tour booking payment
        const sessionRes = await paymentsAPI.createTourSession({
          tourId: booking.tourType,
          userId: booking.user,
          amount: booking.totalAmount,
          name: booking.name,
          phone: booking.phone,
          passengers: booking.passengers,
          date: booking.date,
          time: booking.time,
          message: booking.message
        });
        
        console.log('Tour payment session created:', sessionRes.data);
        window.location.href = sessionRes.data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      // You can add a snackbar here if you want to show error messages
    }
  };

  const handleDownloadReceipt = async (booking) => {
    try {
      setDownloadLoading(booking._id);
      
      // Generate receipt data
      const receiptData = {
        bookingId: booking._id,
        type: booking.type === 'ride' ? 'Car Booking' : 'Tour Booking',
        customerName: booking.customerName || booking.name,
        customerPhone: booking.customerPhone || booking.phone,
        date: formatDate(booking.date),
        time: formatTime(booking.time),
        passengers: booking.passengers,
        amount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookingDate: formatDate(booking.createdAt),
        ...(booking.type === 'ride' ? {
          carName: booking.carName,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation
        } : {
          tourType: booking.tourType,
          message: booking.message
        })
      };
      
      // Create HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Travellers Receipt</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section h2 {
            color: #667eea;
            font-size: 1.5em;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: bold;
            color: #333;
            min-width: 120px;
        }
        .info-value {
            color: #666;
            margin-left: 10px;
        }
        .amount-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .amount {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        .status-paid {
            background: #28a745;
            color: white;
        }
        .status-pending {
            background: #ffc107;
            color: #333;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .logo {
            font-size: 3em;
            margin-bottom: 10px;
        }
        .booking-id {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="logo">🚗</div>
            <h1>TRAVELLERS</h1>
            <p>Professional Travel Services</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📋 Booking Information</h2>
                <div class="booking-id">Booking ID: ${receiptData.bookingId}</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${receiptData.type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${receiptData.bookingDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">
                            <span class="status-badge status-${receiptData.paymentStatus}">
                                ${receiptData.paymentStatus.toUpperCase()}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>👤 Customer Details</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${receiptData.customerName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${receiptData.customerPhone}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🚗 Service Details</h2>
                <div class="info-grid">
                    ${booking.type === 'ride' ? `
                    <div class="info-item">
                        <span class="info-label">Car:</span>
                        <span class="info-value">${receiptData.carName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pickup:</span>
                        <span class="info-value">${receiptData.pickupLocation}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Drop:</span>
                        <span class="info-value">${receiptData.dropLocation}</span>
                    </div>
                    ` : `
                    <div class="info-item">
                        <span class="info-label">Tour:</span>
                        <span class="info-value">${receiptData.tourType}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Message:</span>
                        <span class="info-value">${receiptData.message || 'N/A'}</span>
                    </div>
                    `}
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${receiptData.date}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Time:</span>
                        <span class="info-value">${receiptData.time}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Passengers:</span>
                        <span class="info-value">${receiptData.passengers}</span>
                    </div>
                </div>
            </div>
            
            <div class="amount-section">
                <h3>💰 Payment Details</h3>
                <div class="amount">Rs. ${receiptData.amount}</div>
                <p>Total Amount</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Thank you for choosing Travellers!</p>
        </div>
    </div>
</body>
</html>
      `;
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${booking._id.slice(-8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Receipt downloaded successfully! Open the HTML file in your browser and print as PDF.');
    } catch (error) {
      console.error('Error downloading receipt:', error);
    } finally {
      setDownloadLoading(null);
    }
  };

  if (loading) {
    return (
      <>
        <CustomerHeader />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </Container>
        <CustomerFooter />
      </>
    );
  }

  return (
    <>
      <CustomerHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          My Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Bookings Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't made any bookings yet. Start by booking a ride or tour!
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Bookings: {bookings.length}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} lg={4} key={booking._id}>
                  <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {booking.type === 'ride' ? (booking.carName || 'Unknown Car') : (booking.tourType || 'Unknown Tour')}
                        </Typography>
                        <Chip
                          label={booking.status?.toUpperCase() || 'UNKNOWN'}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        {booking.type === 'ride' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.pickupLocation} → {booking.dropLocation}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <DirectionsCar sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Tour Type: {booking.tourType}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(booking.date)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(booking.time)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {booking.passengers} passengers
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Rs. ${booking.totalAmount}
                          </Typography>
                        </Box>

                        {booking.bookingNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Receipt sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              #{booking.bookingNumber}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Booked: {formatDate(booking.createdAt)}
                        </Typography>
                        
                        <Box>
                          <Tooltip title="Payment Status">
                            <Chip
                              label={booking.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                              color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          </Tooltip>
                          
                          {booking.paymentStatus === 'pending' && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handlePayment(booking)}
                              sx={{ 
                                fontWeight: 'bold',
                                borderRadius: 2,
                                mr: 1
                              }}
                            >
                              Pay Now
                            </Button>
                          )}
                          
                          {booking.paymentStatus === 'paid' && (
                            <Tooltip title="Download Receipt">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleDownloadReceipt(booking)}
                                disabled={downloadLoading === booking._id}
                              >
                                {downloadLoading === booking._id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <Download />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
      <CustomerFooter />
    </>
  );
};

export default CustomerBookings; 