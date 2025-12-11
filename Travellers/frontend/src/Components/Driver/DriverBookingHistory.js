import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverHeader from './DriverHeader';
import DriverFooter from './DriverFooter';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  Schedule,
  Person,
  Phone,
  Email,
  Payment,
  CheckCircle,
  Cancel,
  Pending,
  Assignment
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from '@mui/material';
import { authAPI, bookingsAPI } from '../../utils/api';
import { driverAPI } from '../../utils/api';
import { useProfile } from '../../contexts/ProfileContext';

const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { 
          color: 'success', 
          icon: <CheckCircle fontSize="small" />,
          label: 'Completed'
        };
      case 'confirmed':
        return { 
          color: 'primary', 
          icon: <Assignment fontSize="small" />,
          label: 'Confirmed'
        };
      case 'pending':
        return { 
          color: 'warning', 
          icon: <Pending fontSize="small" />,
          label: 'Pending'
        };
      case 'canceled':
        return { 
          color: 'error', 
          icon: <Cancel fontSize="small" />,
          label: 'Canceled'
        };
      default:
        return { 
          color: 'default', 
          icon: <Pending fontSize="small" />,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="filled"
      sx={{ fontWeight: 600 }}
    />
  );
};

const DriverBookingHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [statusChangeLoading, setStatusChangeLoading] = useState({});
  const [user, setUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null, newStatus: null });
  const [successMessage, setSuccessMessage] = useState('');
  const { profileImage } = useProfile();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Get current user data
        const { data: userData } = await authAPI.getCurrentUser();
        setUser(userData);
        
        // Fetch driver's bookings
        const { data: bookingsData } = await bookingsAPI.getDriverBookings();
        setBookings(bookingsData.bookings || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Don't redirect to login, just show empty state
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    setConfirmDialog({ open: true, bookingId, newStatus });
  };

  const confirmStatusChange = async () => {
    try {
      const { bookingId, newStatus } = confirmDialog;
      setStatusChangeLoading(prev => ({ ...prev, [bookingId]: true }));
      
      await driverAPI.updateBookingStatus(bookingId, newStatus);
      
      // Refresh bookings
      const { data: bookingsData } = await bookingsAPI.getDriverBookings();
      setBookings(bookingsData.bookings || []);
      
      setConfirmDialog({ open: false, bookingId: null, newStatus: null });
      setSuccessMessage(`Booking status successfully changed to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update booking status. Please try again.';
      alert(errorMessage);
    } finally {
      setStatusChangeLoading(prev => ({ ...prev, [confirmDialog.bookingId]: false }));
      setConfirmDialog({ open: false, bookingId: null, newStatus: null });
    }
  };

  const cancelStatusChange = () => {
    setConfirmDialog({ open: false, bookingId: null, newStatus: null });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'block'
    }}>
      <DriverHeader />

      {/* Main Content */}
      <Box sx={{ 
        display: 'block',
        minHeight: 'calc(100vh - 200px)'
      }}>
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
            My Booking History
          </Typography>
          <Typography 
            variant="h6" 
            color="white" 
            sx={{ mt: 2, opacity: 0.9 }}
          >
            Track all your assigned bookings and their current status
          </Typography>
        </Container>
      </Box>

      {/* Driver Info Card */}
      <Container sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid>
              <Avatar 
                src={profileImage}
                sx={{ width: 80, height: 80 }}
              />
            </Grid>
            <Grid xs>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Professional Driver
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Email fontSize="small" />
                  {user?.email}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="small" />
                  {user?.phone || 'N/A'}
                </Typography>
              </Stack>
            </Grid>
            <Grid>
              <Chip 
                label={`${bookings.length} Total Bookings`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Bookings Grid */}
      <Container sx={{ mb: 6 }}>
        {!loading && bookings.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
              No Bookings Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't been assigned any bookings yet. Check back later!
            </Typography>
          </Paper>
        ) : (
          <>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
              Your Bookings ({bookings.length})
            </Typography>
            <Grid container spacing={3}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} lg={4} key={booking._id}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    {/* Booking Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Booking #{booking._id.slice(-6)}
                      </Typography>
                      <StatusChip status={booking.status} />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Car Details */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCar color="primary" />
                        {booking.carName}
                      </Typography>
                    </Box>

                    {/* Route Details */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        <strong>Pickup:</strong> {booking.pickupLocation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        <strong>Drop:</strong> {booking.dropLocation}
                      </Typography>
                    </Box>

                    {/* Customer Details */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        Customer Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {booking.customerName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {booking.customerPhone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Passengers:</strong> {booking.passengers}
                      </Typography>
                    </Box>

                    {/* Trip Details */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize="small" />
                        <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize="small" />
                        <strong>Time:</strong> {booking.time}
                      </Typography>
                    </Box>

                    {/* Payment Details */}
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'primary.light', 
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.contrastText' }}>
                        <Payment fontSize="small" />
                        <strong>Total Amount:</strong>
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                        Rs.{booking.totalAmount}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    {booking.status === 'assigned' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          fullWidth
                          size="small"
                          onClick={() => handleStatusChange(booking._id, 'completed')}
                          disabled={statusChangeLoading[booking._id]}
                        >
                          {statusChangeLoading[booking._id] ? 'Updating...' : 'Successful'}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleStatusChange(booking._id, 'canceled')}
                          disabled={statusChangeLoading[booking._id]}
                        >
                          {statusChangeLoading[booking._id] ? 'Updating...' : 'Canceled'}
                        </Button>
                      </Box>
                    )}
                    {booking.status === 'confirmed' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          fullWidth
                          size="small"
                        >
                          Start Trip
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
                      </>
          )}
      </Container>
      </Box>

      <DriverFooter />


      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={cancelStatusChange}>
        <DialogTitle>
          Confirm Status Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this booking as "{confirmDialog.newStatus}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusChange} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusChange} 
            color="primary" 
            variant="contained"
            disabled={statusChangeLoading[confirmDialog.bookingId]}
          >
            {statusChangeLoading[confirmDialog.bookingId] ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DriverBookingHistory; 