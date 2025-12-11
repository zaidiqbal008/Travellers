import React, { useState, useEffect } from 'react';
import { Avatar, Typography, Divider, MenuItem, ListItemIcon, Box } from '@mui/material';
import { Sync, CalendarToday, LocationCity, Phone as PhoneIcon, School, Person, History, Feedback, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { authAPI, userProfileAPI } from '../../utils/api';
import { useProfile } from '../../contexts/ProfileContext';

const DriverProfileMenu = ({ onLogout, location = 'Lahore, Pakistan', feedbackLink = '/feedback' }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { profileImage } = useProfile();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authAPI.getCurrentUser();
        setUser(res.data);
        // Fetch full profile details
        const profileRes = await userProfileAPI.getProfile();
        setProfile(profileRes.data);
      } catch (err) {
        // handle error
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
                          src={profileImage}
          sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {profile?.fullName || user?.username || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          DRIVER
        </Typography>
      </Box>
      <Divider />
      <MenuItem>
        <ListItemIcon>
          <CalendarToday fontSize="small" />
        </ListItemIcon>
        {user?.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <LocationCity fontSize="small" />
        </ListItemIcon>
        {location}
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <PhoneIcon fontSize="small" />
        </ListItemIcon>
        {user?.phone || 'N/A'}
      </MenuItem>
      <Divider />
      <MenuItem component={Link} to="/driver/booking-history">
        <ListItemIcon>
          <History fontSize="small" />
        </ListItemIcon>
        Booking History
      </MenuItem>
      <Divider />
      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </>
  );
};

export default DriverProfileMenu; 