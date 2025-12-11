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
  Button,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableSortLabel,
  Pagination,
  Stack,
  CardActions,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  CalendarToday,
  AccessTime,
  Person,
  AttachMoney,
  Receipt,
  Download,
  Description,
  Tour,
  CheckCircle,
  Pending,
  Cancel,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { paymentsAPI } from '../../utils/api';
import { useBookings } from '../../contexts/BookingsContext';

const MyBookings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use shared bookings context
  const { bookings, loading, error, bookingStats } = useBookings();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New flexible features
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [page, setPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [itemsPerPage] = useState(6);

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
      setSnackbar({
        open: true,
        message: 'Failed to process payment. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDownloadReceipt = async (booking, fileName) => {
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
      
      setSnackbar({
        open: true,
        message: 'Receipt downloaded successfully! Open the HTML file in your browser and print as PDF.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download receipt. Please try again.',
        severity: 'error'
      });
    } finally {
      setDownloadLoading(null);
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
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Description />;
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      // Status filter
      if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableFields = [
          booking.carName || '',
          booking.tourType || '',
          booking.pickupLocation || '',
          booking.dropLocation || '',
          booking.customerName || '',
          booking._id || '',
          booking.status,
          booking.paymentStatus
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchLower)) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(1); // Reset to first page when filtering
  };

  const getBookingTypeIcon = (type) => {
    return type === 'ride' ? <DirectionsCar /> : <Tour />;
  };

  const getBookingTypeLabel = (type) => {
    return type === 'ride' ? 'Car Booking' : 'Tour Booking';
  };

  if (loading) {
    return (
      <>
        <CustomerHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
        <CustomerFooter />
      </>
    );
  }

  return (
    <>
      <CustomerHeader />
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center', mb: 4 }}>
        <Container>
          <Typography variant="h3" component="h1" gutterBottom>
            My Bookings
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            View and manage your booking history
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {bookingStats.totalBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {bookingStats.confirmedBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary" >
                  Confirmed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {bookingStats.pendingBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {bookingStats.totalSpent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Spent (Rs.)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Search and Filter Controls */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            {/* Sort */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* View Mode */}
            <Grid item xs={6} sm={3} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Card View">
                  <IconButton
                    onClick={() => setViewMode('card')}
                    color={viewMode === 'card' ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List View">
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
          </Box>
            </Grid>
            
            {/* Filter */}
            <Grid item xs={6} sm={3} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Bookings</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedBookings.length} of {filteredAndSortedBookings.length} bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        </Box>

        {/* Bookings List */}
        {filteredAndSortedBookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {filterStatus === 'all' ? 'No bookings found' : `No ${filterStatus} bookings found`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterStatus === 'all' 
                ? 'You haven\'t made any bookings yet.' 
                : `You don't have any ${filterStatus} bookings.`
              }
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'card' && (
          <Grid container spacing={3}>
                {paginatedBookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minWidth: 0, flex: 1, mr: 2 }}>
                        {getBookingTypeIcon(booking.type)}
                        <Typography variant="h6" sx={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                          {getBookingTypeLabel(booking.type)}
                        </Typography>
                        <Chip
                          label={booking._id.slice(-8)}
                          size="small"
                          variant="outlined"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            minWidth: 'fit-content'
                          }}
                        />
                        <Chip
                          label={booking.paymentStatus}
                          color={getPaymentStatusColor(booking.paymentStatus)}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            minWidth: 'fit-content'
                          }}
                        />
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {booking.type === 'ride' ? (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DirectionsCar color="action" />
                                <Typography variant="body2">
                                  <strong>Car:</strong> {booking.carName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn color="action" />
                                <Typography variant="body2">
                                  <strong>Pickup:</strong> {booking.pickupLocation}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn color="action" />
                                <Typography variant="body2">
                                  <strong>Drop:</strong> {booking.dropLocation}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tour color="action" />
                                <Typography variant="body2">
                                  <strong>Tour:</strong> {booking.tourType}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tour color="action" />
                                <Typography variant="body2">
                                  <strong>Type:</strong> {booking.tourType}
                                </Typography>
                              </Box>
                            </>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday color="action" />
                            <Typography variant="body2">
                              <strong>Date:</strong> {formatDate(booking.date)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime color="action" />
                            <Typography variant="body2">
                              <strong>Time:</strong> {formatTime(booking.time)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="action" />
                            <Typography variant="body2">
                              <strong>Passengers:</strong> {booking.passengers}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="action" />
                            <Typography variant="body2">
                              <strong>Customer:</strong> {booking.customerName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="action" />
                            <Typography variant="body2">
                              <strong>Phone:</strong> {booking.customerPhone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney color="action" />
                            <Typography variant="body2">
                              <strong>Amount:</strong> Rs. ${booking.totalAmount}
                            </Typography>
                          </Box>
                          {booking.message && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Description color="action" />
                              <Typography variant="body2">
                                <strong>Message:</strong> {booking.message}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Payment Section */}
                    {booking.paymentStatus === 'pending' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney color="warning" />
                          <Typography variant="body2" color="warning.main">
                            Payment Pending
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handlePayment(booking)}
                          sx={{ 
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        >
                          Pay Now
                        </Button>
                      </Box>
                    )}

                    {/* Receipt Section */}
                    {booking.paymentStatus === 'paid' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Receipt color="success" />
                          <Typography variant="body2" color="success.main">
                            Receipt Available
                          </Typography>
                        </Box>
                        <Tooltip title="Download Receipt">
                          <IconButton
                            onClick={() => handleDownloadReceipt(booking)}
                            disabled={downloadLoading === booking._id}
                            color="primary"
                          >
                            {downloadLoading === booking._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Download />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    {/* Booking Date */}
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        Booked on: {formatDate(booking.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <Paper sx={{ overflow: 'hidden' }}>
                {paginatedBookings.map((booking) => (
                  <Accordion key={booking._id} expanded={expandedCard === booking._id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      onClick={() => setExpandedCard(expandedCard === booking._id ? null : booking._id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minWidth: 0, flex: 1, mr: 2 }}>
                          {getBookingTypeIcon(booking.type)}
                          <Typography variant="h6" sx={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                            {getBookingTypeLabel(booking.type)}
                          </Typography>
                          <Chip
                            label={booking._id.slice(-8)}
                            size="small"
                            variant="outlined"
                            sx={{ flexShrink: 0 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              minWidth: 'fit-content'
                            }}
                          />
                          <Chip
                            label={booking.paymentStatus}
                            color={getPaymentStatusColor(booking.paymentStatus)}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              minWidth: 'fit-content'
                            }}
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {booking.type === 'ride' ? (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DirectionsCar color="action" />
                                  <Typography variant="body2">
                                    <strong>Car:</strong> {booking.carName}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationOn color="action" />
                                  <Typography variant="body2">
                                    <strong>Pickup:</strong> {booking.pickupLocation}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationOn color="action" />
                                  <Typography variant="body2">
                                    <strong>Drop:</strong> {booking.dropLocation}
                                  </Typography>
                                </Box>
                              </>
                            ) : (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Tour color="action" />
                                  <Typography variant="body2">
                                    <strong>Tour:</strong> {booking.tourType}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday color="action" />
                              <Typography variant="body2">
                                <strong>Date:</strong> {formatDate(booking.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime color="action" />
                              <Typography variant="body2">
                                <strong>Time:</strong> {formatTime(booking.time)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person color="action" />
                              <Typography variant="body2">
                                <strong>Passengers:</strong> {booking.passengers}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachMoney color="action" />
                              <Typography variant="body2">
                                <strong>Amount:</strong> Rs. {booking.totalAmount}
                              </Typography>
                            </Box>
                            {booking.message && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Description color="action" />
                                <Typography variant="body2">
                                  <strong>Message:</strong> {booking.message}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Actions */}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {booking.paymentStatus === 'pending' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handlePayment(booking)}
                          >
                            Pay Now
                          </Button>
                        )}
                        {booking.paymentStatus === 'paid' && (
                          <Tooltip title="Download Receipt">
                            <IconButton
                              onClick={() => handleDownloadReceipt(booking)}
                              disabled={downloadLoading === booking._id}
                              color="primary"
                            >
                              {downloadLoading === booking._id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Download />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CustomerFooter />
    </>
  );
};

export default MyBookings; 