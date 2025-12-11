import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Pagination,
  Stack,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableSortLabel
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { adminAPI, usersAPI } from '../../utils/api';

// Valid statuses that match backend enum
const VALID_STATUSES = ['pending', 'confirmed', 'assigned', 'completed', 'canceled'];

const BookingTable = ({ 
  title, 
  bookings, 
  columns, 
  rawBookings, 
  onAssignDriver,
  drivers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(true);
  const itemsPerPage = 10;

  // Filter out the internal fields we don't want to display as columns
  const displayColumns = columns.filter(col => !['_id', 'user', 'assignedDriver', 'status'].includes(col));
  
  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = Object.values(booking).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPayment = paymentFilter === 'all' || booking['Payment Status']?.toLowerCase() === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    const comparison = aValue.toString().localeCompare(bValue.toString());
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate bookings
  const paginatedBookings = sortedBookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      displayColumns.join(','),
      ...sortedBookings.map(booking => 
        displayColumns.map(col => `"${booking[col] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_bookings.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
    }} elevation={0}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{ '& .MuiAccordionSummary-root': { px: 3, py: 2 } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title} ({filteredBookings.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Export to CSV">
                <IconButton size="small" onClick={handleExport}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Search and Filter Controls */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Table */}
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    {displayColumns.map((col) => (
                      <TableCell key={col}>
                        <TableSortLabel
                          active={sortBy === col}
                          direction={sortBy === col ? sortOrder : 'asc'}
                          onClick={() => handleSort(col)}
                        >
                          {col === 'Assigned Driver' ? 'Driver' : col}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBookings.map((booking, index) => (
                    <TableRow 
                      key={index}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      {displayColumns.map((col) => (
                        <TableCell key={col}>
                          {col === 'Payment Status' ? (
                            <Chip 
                              label={booking[col]}
                              color={booking[col] === 'paid' ? 'success' : booking[col] === 'pending' ? 'warning' : 'error'}
                              size="small"
                              sx={{ borderRadius: 1, mb: 0.5 }}
                            />
                          ) : col === 'Assigned Driver' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{booking[col]}</span>
                              <Tooltip title="Change Driver">
                                <IconButton 
                                  size="small"
                                  color="primary"
                                  onClick={(e) => onAssignDriver(e, rawBookings[index])}
                                  disabled={!drivers.length}
                                  sx={{ p: 0.5 }}
                                >
                                  <PersonAddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            booking[col]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}

            {/* No results message */}
            {filteredBookings.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No bookings found matching your criteria.
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

const AdminBooking = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupedTrips, setGroupedTrips] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [assigningDriver, setAssigningDriver] = useState(false);

  const handleAssignDriverClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setCurrentBooking(booking);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentBooking(null);
  };

  const handleAssignDriver = async (driverId) => {
    if (!currentBooking) return;
    
    try {
      setAssigningDriver(true);
      console.log('Assigning driver', driverId, 'to booking/trip', currentBooking._id);
      
      // Determine if this is a booking or trip based on the data structure
      const isTrip = currentBooking.hasOwnProperty('tourType') || currentBooking.hasOwnProperty('tripNumber');
      
      let response;
      if (isTrip) {
        console.log('Assigning trip to driver');
        response = await adminAPI.assignTripToDriver(currentBooking._id, driverId);
      } else {
        console.log('Assigning booking to driver');
        response = await adminAPI.assignBookingToDriver(currentBooking._id, driverId);
      }
      
      console.log('Assignment response:', response);
      
      const successMessage = isTrip ? 'Trip assigned successfully' : 'Booking assigned successfully';
      if (response.data && response.data.message === successMessage) {
        // Refresh the data to show the updated assignment
        await fetchData();
        setError('');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign driver';
      console.error('Assign driver error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError(`Failed to assign driver: ${errorMessage}`);
    } finally {
      setAssigningDriver(false);
      handleCloseMenu();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching data...');
      
      // Fetch all bookings, trips, and drivers
      const [bookingsRes, tripsRes, driversRes] = await Promise.all([
        adminAPI.getAllBookings().catch(err => {
          console.error('Error fetching bookings:', err);
          return { data: [] };
        }),
        adminAPI.getAllTrips().catch(err => {
          console.error('Error fetching trips:', err);
          return { data: [] };
        }),
        usersAPI.getUsersByType('driver').catch(err => {
          console.error('Error fetching drivers:', err);
          return { data: { users: [] } };
        })
      ]);
      
      const bookings = bookingsRes?.data || [];
      const trips = tripsRes?.data || [];
      const driversList = driversRes?.data?.users || [];
      
      console.log('Fetched data:', {
        bookingsCount: bookings.length,
        tripsCount: trips.length,
        driversCount: driversList.length
      });
      
      setDrivers(driversList);

      // Format trip data with assigned driver information
      const formatTripData = (trip) => {
        const driverInfo = trip.assignedDriver 
          ? `${trip.assignedDriver.username || 'Driver'} (${trip.assignedDriver.email || 'No email'})`
          : 'Not assigned';
          
        return {
          ...trip,
          _id: trip._id,
          'Persons': trip.passengers || 1,
          'Pickup Point': trip.name || '-',
          'Tour Destination': trip.tourType || 'Unknown Tour',
          'Contact No': trip.phone || 'N/A',
          'Vehicle Name': trip.vehicle || 'N/A',
          'Prices': `Rs. ${trip.totalAmount || 0}`,
          'Payment Status': trip.paymentStatus?.toLowerCase() || 'pending',
          'Assigned Driver': driverInfo,
          'Status': VALID_STATUSES.includes(trip.status?.toLowerCase()) ? trip.status.toLowerCase() : 'pending'
        };
      };

      // Group trips by tourType
      const tripGroups = {};
      const rawTripGroups = {};
      trips.forEach(trip => {
        const tourType = trip.tourType || 'Unknown Tour';
        if (!tripGroups[tourType]) {
          tripGroups[tourType] = [];
          rawTripGroups[tourType] = [];
        }
        const formattedTrip = formatTripData(trip);
        tripGroups[tourType].push(formattedTrip);
        rawTripGroups[tourType].push(trip);
      });
      setGroupedTrips(Object.entries(tripGroups).map(([key, value]) => [key, value, rawTripGroups[key]]));

      // Format booking data with assigned driver information
      const formatBookingData = (booking) => {
        const driverInfo = booking.assignedDriver 
          ? `${booking.assignedDriver.username || 'Driver'} (${booking.assignedDriver.email || 'No email'})`
          : 'Not assigned';
          
        return {
          ...booking,
          _id: booking._id,
          'Persons': booking.passengers || 1,
          'Pickup Point': booking.pickupLocation || 'N/A',
          'Tour Destination': booking.dropLocation || 'N/A',
          'Contact No': booking.customerPhone || 'N/A',
          'Vehicle Name': booking.carName || 'N/A',
          'Prices': `Rs. ${booking.totalAmount || 0}`,
          'Payment Status': booking.paymentStatus?.toLowerCase() || 'pending',
          'Assigned Driver': driverInfo,
          'Status': VALID_STATUSES.includes(booking.status?.toLowerCase()) ? booking.status.toLowerCase() : 'pending'
        };
      };

      // Group bookings by carName
      const bookingGroups = {};
      const rawBookingGroups = {};
      bookings.forEach(booking => {
        const groupKey = booking.carName || 'Other';
        if (!bookingGroups[groupKey]) {
          bookingGroups[groupKey] = [];
          rawBookingGroups[groupKey] = [];
        }
        const formattedBooking = formatBookingData(booking);
        bookingGroups[groupKey].push(formattedBooking);
        rawBookingGroups[groupKey].push(booking);
      });
      setGroupedBookings(Object.entries(bookingGroups).map(([key, value]) => [key, value, rawBookingGroups[key]]));
    } catch (err) {
      setError('Failed to load bookings or trips.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f7fb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4, mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Bookings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Booking Management! All bookings including paid bookings from customers are displayed here.
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {/* Booking Statistics */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, bgcolor: '#f8fdff', borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }} elevation={0}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Total Bookings</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3a60ab' }}>
                {groupedBookings.reduce((total, [_, bookings]) => total + bookings.length, 0) + 
                 groupedTrips.reduce((total, [_, bookings]) => total + bookings.length, 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, bgcolor: '#f8fff8', borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }} elevation={0}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Paid Bookings</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {groupedBookings.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(booking => booking.paymentStatus?.toLowerCase() === 'paid').length;
                }, 0) + 
                groupedTrips.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(trip => trip.paymentStatus?.toLowerCase() === 'paid').length;
                }, 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, bgcolor: '#fffdf8', borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }} elevation={0}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Pending Payments</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {groupedBookings.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(booking => booking.paymentStatus?.toLowerCase() === 'pending').length;
                }, 0) + 
                groupedTrips.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(trip => trip.paymentStatus?.toLowerCase() === 'pending').length;
                }, 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, bgcolor: '#fff8f8', borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }} elevation={0}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Total Revenue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3a60ab' }}>
                Rs. {(groupedBookings.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(booking => booking.paymentStatus === 'paid')
                    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
                }, 0) + 
                groupedTrips.reduce((total, [_, bookings, rawBookings]) => {
                  return total + rawBookings.filter(trip => trip.paymentStatus === 'paid')
                    .reduce((sum, trip) => sum + (trip.totalAmount || 0), 0);
                }, 0)).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Tours Bookings Section */}
      <Box sx={{ mb: 5,}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#3a60ab' }}>
            Tours Bookings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {groupedTrips.reduce((total, [_, bookings]) => total + bookings.length, 0)} total bookings
            </Typography>
          </Box>
        </Box>
        
        {groupedTrips.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <Typography color="text.secondary">
              No tours bookings found.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {groupedTrips.map(([tourType, bookings, rawBookings], idx) => (
              <Grid item xs={12} lg={6} xl={4} key={tourType + idx}>
                <BookingTable
                  title={tourType}
                  bookings={bookings}
                  rawBookings={rawBookings}
                  columns={["Persons", "Pickup Point", "Tour Destination", "Contact No", "Vehicle Name", "Prices", "Payment Status", "Assigned Driver"]}
                  onAssignDriver={handleAssignDriverClick}
                  drivers={drivers}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Ride Bookings Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#3a60ab' }}>
            Ride Bookings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {groupedBookings.reduce((total, [_, bookings]) => total + bookings.length, 0)} total bookings
            </Typography>
          </Box>
        </Box>
        
        {groupedBookings.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <Typography color="text.secondary">
              No ride bookings found.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {groupedBookings.map(([carName, bookings, rawBookings], idx) => (
              <Grid item xs={12} lg={6} xl={4} key={carName + idx}>
                <BookingTable
                  title={carName + ' (Ride Bookings)'}
                  bookings={bookings}
                  rawBookings={rawBookings}
                  columns={["Persons", "Pickup Point", "Tour Destination", "Contact No", "Vehicle Name", "Prices", "Payment Status", "Assigned Driver"]}
                  onAssignDriver={handleAssignDriverClick}
                  drivers={drivers}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Driver Assignment Menu */}
      <Menu
        id="driver-assignment-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <MenuItem 
              key={driver._id} 
              onClick={() => handleAssignDriver(driver._id)}
              disabled={assigningDriver}
            >
              {driver.username} ({driver.email})
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No drivers available</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AdminBooking;
