import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  Person,
  Phone,
  DirectionsCar,
  CheckCircle,
  Pending,
  Cancel,
  History,
  Assignment,
  AttachMoney
} from '@mui/icons-material';
import DriverHeader from './DriverHeader';
import DriverFooter from './DriverFooter';
import { authAPI } from '../../utils/api';

const DriverAssignedBookings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Starting to fetch bookings...');
        
        // Get current user using authAPI
        const { data: user } = await authAPI.getCurrentUser();
        console.log('Current user from API:', user);
        
        if (user && user.userType === 'driver') {
          try {
            // Fetch all bookings assigned to this driver
            console.log('Fetching bookings for driver ID:', user._id);
            const response = await axios.get(`${API_URL}/api/bookings/driver`, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            console.log('Raw API response:', response);
            
            if (response && response.data) {
              console.log('Bookings data:', response.data);
              const allBookings = response.data.bookings || [];
              console.log('All bookings received:', allBookings.length);
              console.log('Booking details:', allBookings.map(b => ({ 
                id: b._id, 
                type: b.bookingType, 
                status: b.status,
                name: b.name || b.pickupLocation 
              })));
              
              // Separate current assignments from completed bookings
              const current = allBookings.filter(booking => 
                ['assigned', 'in_progress', 'pending', 'confirmed'].includes(booking.status)
              );
              const completed = allBookings.filter(booking => 
                ['completed', 'cancelled', 'canceled'].includes(booking.status)
              );
              
              console.log('Current bookings:', current.length);
              console.log('Completed bookings:', completed.length);
              
              setAssignedBookings(current);
              setCompletedBookings(completed);
            } else {
              console.warn('No data in response:', response);
              setAssignedBookings([]);
              setCompletedBookings([]);
            }
          } catch (apiError) {
            console.error('Error fetching bookings:', apiError);
            console.error('Error details:', {
              message: apiError.message,
              response: apiError.response?.data,
              status: apiError.response?.status
            });
            setError('Failed to load bookings. Please check console for details.');
          }
        } else {
          console.warn('User is not a driver or not logged in. User:', user);
          console.log('Not redirecting to avoid loop');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Update booking status using admin API
      await axios.put(
        `${API_URL}/api/admin/bookings/${bookingId}/driver-status`, 
        { status: newStatus },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refresh the bookings list
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status. Please try again.');
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      assigned: { label: 'Assigned', color: 'primary', icon: <Pending fontSize="small" /> },
      confirmed: { label: 'Confirmed', color: 'info', icon: <Pending fontSize="small" /> },
      in_progress: { label: 'In Progress', color: 'warning', icon: <AccessTime fontSize="small" /> },
      completed: { label: 'Completed', color: 'success', icon: <CheckCircle fontSize="small" /> },
      canceled: { label: 'Cancelled', color: 'error', icon: <Cancel fontSize="small" /> },
      cancelled: { label: 'Cancelled', color: 'error', icon: <Cancel fontSize="small" /> } // Handle both spellings
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1">Loading your assigned bookings...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <DriverHeader />

      {/* Page Header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          py: 4,
          mb: 4,
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
            variant="h4" 
            component="h1" 
            color="white" 
            sx={{ 
              fontWeight: 700,
              mb: 1
            }}
          >
            My Bookings
          </Typography>
          <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.9)">
            Manage your current assignments and view completed rides
          </Typography>
        </Container>
      </Box>

      {/* Tabs */}
      <Container>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              '& .MuiTab-root': { 
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }
            }}
          >
            <Tab 
              icon={<Assignment />} 
              iconPosition="start"
              label={`Current Assignments (${assignedBookings.length})`}
            />
            <Tab 
              icon={<History />} 
              iconPosition="start"
              label={`Completed Rides (${completedBookings.length})`}
            />
          </Tabs>
        </Box>
      </Container>

      <Container>
        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {activeTab === 0 ? (
          // Current Assignments Tab
          assignedBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {error ? 'Error Loading Bookings' : 'No Current Assignments'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error || "You don't have any current assignments. Check back later!"}
              </Typography>
              {error && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => window.location.reload()}
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              )}
            </Box>
          ) : (
            <Stack spacing={3}>
              {assignedBookings.map((booking) => (
              <Card key={booking._id} elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {booking.bookingType === 'tour' ? (booking.tourType || 'Tour') : 'Ride'} Booking
                    </Typography>
                    {getStatusChip(booking.status)}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn color="primary" sx={{ mr: 1 }} />
                        From:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                        {booking.pickupLocation || 'N/A'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn color="primary" sx={{ mr: 1 }} />
                        To:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                        {booking.dropLocation || 'N/A'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person color="primary" sx={{ mr: 1 }} />
                        Passengers:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                        {booking.passengers || 1}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday color="primary" sx={{ mr: 1 }} />
                        Date & Time:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DirectionsCar color="primary" sx={{ mr: 1 }} />
                        Vehicle:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                        {booking.carName || 'N/A'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoney color="primary" sx={{ mr: 1 }} />
                        Total Amount:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                        Rs. ${booking.totalAmount || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    {(booking.status === 'assigned' || booking.status === 'confirmed') && (
                      <>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        >
                          {booking.bookingType === 'tour' ? 'Complete Tour' : 'Start Ride'}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleStatusUpdate(booking._id, 'canceled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'in_progress' && (
                      <Button 
                        variant="contained" 
                        color="success"
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      >
                        Complete Ride
                      </Button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ mr: 1 }} /> This {booking.bookingType === 'tour' ? 'tour' : 'ride'} has been completed
                      </Typography>
                    )}
                    
                    {booking.status === 'canceled' && (
                      <Typography variant="body2" color="error">
                        This booking has been cancelled
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )
        ) : (
          // Completed Rides Tab
          completedBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No Completed Rides Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete some rides to see them in your history
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {completedBookings.map((booking) => (
                <Card key={booking._id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {booking.tourType || 'Ride'} - {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </Typography>
                      {getStatusChip(booking.status)}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn color="primary" sx={{ mr: 1 }} />
                          From:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                          {booking.pickupLocation || 'N/A'}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn color="primary" sx={{ mr: 1 }} />
                          To:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                          {booking.dropLocation || 'N/A'}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person color="primary" sx={{ mr: 1 }} />
                          Passengers:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                          {booking.passengers || 1}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday color="primary" sx={{ mr: 1 }} />
                          Date & Time:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DirectionsCar color="primary" sx={{ mr: 1 }} />
                          Vehicle:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, ml: 4 }}>
                          {booking.carName || 'N/A'}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney color="primary" sx={{ mr: 1 }} />
                          Total Amount:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                          Rs. ${booking.totalAmount || '0.00'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {booking.status === 'completed' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.dark" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ mr: 1 }} /> This ride has been completed successfully
                        </Typography>
                      </Box>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="error.dark">
                          This booking was cancelled
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )
        )}
        
      </Container>
      
      <DriverFooter />
    </Box>
  );
};

export default DriverAssignedBookings;
