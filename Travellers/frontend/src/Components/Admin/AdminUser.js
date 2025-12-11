import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { usersAPI } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';



const AdminUser = () => {
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeUsers, getActiveUsers } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [driversRes, customersRes] = await Promise.all([
          usersAPI.getUsersByType('driver'),
          usersAPI.getUsersByType('customer')
        ]);
        setDrivers(driversRes.data.users);
        setCustomers(customersRes.data.users);
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Get active users for real-time status
    getActiveUsers();
  }, [getActiveUsers]);



  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4, mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Users Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users and view their status
        </Typography>
      </Box>

      {/* Drivers Table */}
      <Typography variant="h5" sx={{ mb: 2, color: '#3a60ab', fontWeight: 700 }}>
        Drivers ({drivers.length})
      </Typography>
      <Paper sx={{ p: 3, mb: 4, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f1f1' }}>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((user, idx) => {
                const activeUser = activeUsers.find(active => active.userId === user._id);
                const isActive = activeUser && activeUser.status === 'active';
                return (
                  <TableRow key={user._id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>
                      <Chip 
                        label={isActive ? "Active" : "Inactive"} 
                        color={isActive ? "success" : "default"} 
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Customers Table */}
      <Typography variant="h5" sx={{ mb: 2, color: '#3a60ab', fontWeight: 700 }}>
        Customers ({customers.length})
        </Typography>
      <Paper sx={{ p: 3, mb: 4, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f1f1' }}>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((user, idx) => {
                const activeUser = activeUsers.find(active => active.userId === user._id);
                const isActive = activeUser && activeUser.status === 'active';
                return (
                  <TableRow key={user._id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>
                      <Chip 
                        label={isActive ? "Active" : "Inactive"} 
                        color={isActive ? "success" : "default"} 
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


    </Box>
  );
};

export default AdminUser;
