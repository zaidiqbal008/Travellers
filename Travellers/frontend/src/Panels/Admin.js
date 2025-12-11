import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Link, useTheme, useMediaQuery, CircularProgress } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import { People as PeopleIcon, CalendarToday as CalendarIcon, Person as PersonIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminSidebar from "../Components/Admin/AdminSidebar";
import AdminHeader from "../Components/Admin/AdminHeader";
import AdminBooking from "../Components/Admin/AdminBooking";
import AdminUser from "../Components/Admin/AdminUser";
import AdminMaintainces from "../Components/Admin/AdminMaintainces";
import { authAPI } from '../utils/api';
import { useActivityPing } from '../hooks/useActivityPing';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Admin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const dashboardData = {
    stats: {
      totalRides: {
        value: '120',
        increase: '12%',
      },
      completeBookings: {
        value: '45',
        increase: '5%',
      },
      registeredUsers: {
        value: '10',
        increase: '8%',
      },
      revenue: {
        value: 'Rs. 24,560',
        increase: '15%',
      },
    },
    charts: {
      monthlyUsers: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [2, 12, 6, 10, 40, 55],
      },
      revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [150, 200, 180, 220, 240, 210],
      },
      maintenance: {
        labels: ['Oil Changing', 'Air Filter', 'Gare Oil', 'Washing'],
        data: [120, 90, 70, 150],
      },
    },
    recentBookings: [
      {
        customer: 'Ahmad Affaq',
        car: 'Mark X',
        pickup: 'Iqbal Town, lahore',
        destination: 'Hotel Aladin, Karachi',
        date: '12 May 2024',
        status: 'completed',
      },
      {
        customer: 'Ahmad Affaq',
        car: 'Mark X',
        pickup: 'Iqbal Town, lahore',
        destination: 'Hotel Aladin, Karachi',
        date: '12 May 2024',
        status: 'completed',
      },
      {
        customer: 'Ahmad Affaq',
        car: 'Mark X',
        pickup: 'Iqbal Town, lahore',
        destination: 'Hotel Aladin, Karachi',
        date: '12 May 2024',
        status: 'pending',
      },
      {
        customer: 'Ahmad Affaq',
        car: 'Mark X',
        pickup: 'Iqbal Town, lahore',
        destination: 'Hotel Aladin, Karachi',
        date: '12 May 2024',
        status: 'completed',
      },
      {
        customer: 'Ahmad Affaq',
        car: 'Mark X',
        pickup: 'Iqbal Town, lahore',
        destination: 'Hotel Aladin, Karachi',
        date: '12 May 2024',
        status: 'canceled',
      },
    ],
  };

  // Mock users/drivers list
  const users = [
    { _id: 'user1', name: 'Azeem', userType: 'customer' },
    { _id: 'user2', name: 'Zaid', userType: 'customer' }
  ];
  const drivers = [
    { _id: 'driver1', name: 'Ali', userType: 'driver' },
    { _id: 'driver2', name: 'Ahmed', userType: 'driver' }
  ];
  const [selectedTab, setSelectedTab] = useState('customer');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        console.log('Verifying admin access...');
        const { data: user } = await authAPI.getCurrentUser();
        console.log('Current user data:', user);
        
        if (user && user.userType === 'admin') {
          console.log('Admin verification successful');
          setCurrentUser(user);
          setLoading(false);
        } else {
          console.log('User is not an admin, but not redirecting to avoid loop');
          setLoading(false);
        }
      } catch (error) {
        // Error fetching user (e.g., not authenticated), but not redirecting to avoid loop
        console.error("Admin verification failed", error);
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  // Use activity ping to keep admin active
  useActivityPing(currentUser?._id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Chart data and options
  const lineChartData = {
    labels: dashboardData.charts.monthlyUsers.labels,
    datasets: [{
      label: 'Monthly Users',
      data: dashboardData.charts.monthlyUsers.data,
      borderColor: '#4CAF50',
      tension: 0.4,
      fill: false,
      pointBackgroundColor: '#4CAF50',
    }],
  };

  const revenueChartData = {
    labels: dashboardData.charts.revenue.labels,
    datasets: [{
      label: `Revenue (${dashboardData.stats.revenue.value})`,
      data: dashboardData.charts.revenue.data,
      backgroundColor: 'rgba(33, 150, 243, 0.6)',
    }],
  };

  const maintenanceChartData = {
    labels: dashboardData.charts.maintenance.labels,
    datasets: [{
      label: 'Maintenance Tasks',
      data: dashboardData.charts.maintenance.data,
      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 10,
          padding: 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  const statsCards = [
    {
      title: 'Total Rides',
      value: dashboardData.stats.totalRides.value,
      icon: <PeopleIcon />,
      increase: dashboardData.stats.totalRides.increase,
      color: '#4CAF50',
    },
    {
      title: 'Complete Bookings',
      value: dashboardData.stats.completeBookings.value,
      icon: <CalendarIcon />,
      increase: dashboardData.stats.completeBookings.increase,
      color: '#2196F3',
    },
    {
      title: 'Registered Users',
      value: dashboardData.stats.registeredUsers.value,
      icon: <PersonIcon />,
      increase: dashboardData.stats.registeredUsers.increase,
      color: '#FF9800',
    },
    {
      title: 'Revenue',
      value: dashboardData.stats.revenue.value,
      icon: <MoneyIcon />,
      increase: dashboardData.stats.revenue.increase,
      color: '#F44336',
    },
  ];

  const DashboardContent = () => (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      maxWidth: '100%',
      overflowX: 'hidden',
      bgcolor: '#f8f9fa'
    }}>
      {/* Page Title */}
      <Box sx={{ mb: { xs: 3, sm: 4 }, mt: 10 }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, To The Admin Panel!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6}}>
        {statsCards.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                mr: 8,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                bgcolor: 'white',
                borderRadius: 2,
              }}
              elevation={0}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h4" sx={{ my: 1, color: 'text.primary' }}>
                {item.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.success.main, fontWeight: 500 }}
                >
                  {item.increase}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  from last month
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            height: '400px',
            borderRadius: 2,
            mt: { xs: 2, sm: 3 }
          }} elevation={0}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Monthly Users
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', pt: 2 }}>
              <Line data={lineChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            height: '400px', 
            borderRadius: 2,
            mt: { xs: 2, sm: 3 }
          }} elevation={0}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Revenue
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', pt: 2 }}>
              <Bar data={revenueChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            height: '400px', 
            borderRadius: 2,
            mt: { xs: 2, sm: 3 }
          }} elevation={0}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Car Maintenance
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', pt: 2 }}>
              <Bar data={maintenanceChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Bookings */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }} elevation={0}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3
        }}>
          <Typography variant="h6" color="text.secondary">
            Recent Memberships
          </Typography>
          <Link href="#" underline="none" sx={{ color: theme.palette.primary.main }}>
            View All
          </Link>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Customer</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Car</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Pickup</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Destination</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Date</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.recentBookings.map((booking, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{booking.customer}</TableCell>
                  <TableCell>{booking.car}</TableCell>
                  <TableCell>{booking.pickup}</TableCell>
                  <TableCell>{booking.destination}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={
                        booking.status === 'completed'
                          ? 'success'
                          : booking.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                      sx={{ 
                        borderRadius: 1,
                        textTransform: 'capitalize',
                        '& .MuiChip-label': {
                          px: 2
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '250px', // Width of the sidebar
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <AdminHeader />
        
        {/* Main Content */}
        <Box sx={{ mt: 2 }}>
          {/* Routes */}
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/bookings" element={<AdminBooking />} />
            <Route path="/users" element={<AdminUser />} />
            <Route path="/maintenance" element={<AdminMaintainces />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default Admin;