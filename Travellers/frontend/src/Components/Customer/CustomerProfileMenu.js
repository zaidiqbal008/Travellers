import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Typography, 
  Divider, 
  MenuItem, 
  ListItemIcon, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { 
  Sync, 
  CalendarToday, 
  LocationCity, 
  Phone as PhoneIcon, 
  School, 
  Person, 
  History, 
  Feedback, 
  Logout,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { authAPI, userProfileAPI } from '../../utils/api';
import { useBookings } from '../../contexts/BookingsContext';
import { useProfile } from '../../contexts/ProfileContext';

const CustomerProfileMenu = ({ onLogout, location = 'Lahore, Pakistan', feedbackLink = '/feedback' }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentLocation, setCurrentLocation] = useState(location);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  
  // Use shared bookings context
  const { bookingStats } = useBookings();
  const { profileImage, updateProfileImage, clearProfileData } = useProfile();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authAPI.getCurrentUser();
        setUser(res.data);
        // Fetch full profile details
        const profileRes = await userProfileAPI.getProfile();
        setProfile(profileRes.data);
        
        // Set current profile image
        setCurrentProfileImage(res.data?.profilePicture || '/img/team-1.png');
        updateProfileImage(res.data?.profilePicture || '/img/team-1.png');
      } catch (err) {
        // handle error
      }
    }
    fetchUser();
  }, []);

  const handleEditClick = () => {
    setEditForm({
      fullName: profile?.fullName || user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      location: currentLocation
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditDialogOpen(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setCurrentProfileImage(e.target.result); // Update current image immediately
        updateProfileImage(e.target.result); // Update shared context
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCurrentProfileImage('/img/team-1.png'); // Reset to default image
    updateProfileImage('/img/team-1.png'); // Update shared context
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Update profile data
      const updateData = {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        dob: editForm.dob,
        location: editForm.location
      };

      // Update profile in backend
      await userProfileAPI.updateProfile(updateData);
      
      // Update local state
      setUser(prev => ({
        ...prev,
        email: editForm.email,
        phone: editForm.phone,
        dob: editForm.dob
      }));
      
      setProfile(prev => ({
        ...prev,
        fullName: editForm.fullName
      }));

      // Update location state
      setCurrentLocation(editForm.location);

      // Update current profile image if preview exists
      if (imagePreview) {
        setCurrentProfileImage(imagePreview);
        updateProfileImage(imagePreview);
      }

      // Clear the selected image and preview
      setSelectedImage(null);
      setImagePreview(null);

      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
        <Avatar
          src={profileImage || currentProfileImage || imagePreview || user?.profilePicture || '/img/team-1.png'}
          sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {profile?.fullName || user?.username || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CUSTOMER
        </Typography>
        
        {/* Edit Button */}
        <Tooltip title="Edit Profile">
          <IconButton
            onClick={handleEditClick}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2">Total Bookings: {bookingStats.totalBookings}</Typography>
        <Typography variant="subtitle2">Total Spent: Rs. {bookingStats.totalSpent}</Typography>
      </Box>
      
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
        {currentLocation}
      </MenuItem>
      
      <MenuItem>
        <ListItemIcon>
          <PhoneIcon fontSize="small" />
        </ListItemIcon>
        {user?.phone || 'N/A'}
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => {
        clearProfileData();
        onLogout();
      }}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" />
          Edit Profile
        </DialogTitle>
        
                 <DialogContent>
           <Grid container spacing={2} sx={{ mt: 1 }}>
             {/* Profile Picture Section */}
             <Grid item xs={12}>
               <Card sx={{ p: 2, textAlign: 'center' }}>
                 <Typography variant="h6" gutterBottom>
                   Profile Picture
                 </Typography>
                 <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                       <Avatar
                      src={profileImage || currentProfileImage || imagePreview || user?.profilePicture || '/img/team-1.png'}
                      sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                    />
                   <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                     <input
                       accept="image/*"
                       style={{ display: 'none' }}
                       id="profile-picture-upload"
                       type="file"
                       onChange={handleImageChange}
                     />
                     <label htmlFor="profile-picture-upload">
                       <Button
                         variant="outlined"
                         component="span"
                         startIcon={<CloudUploadIcon />}
                         size="small"
                       >
                         Choose Photo
                       </Button>
                     </label>
                     {(selectedImage || user?.profilePicture) && (
                       <Button
                         variant="outlined"
                         color="error"
                         startIcon={<DeleteIcon />}
                         onClick={handleRemoveImage}
                         size="small"
                       >
                         Remove
                       </Button>
                     )}
                   </Box>
                 </Box>
               </Card>
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Full Name"
                 value={editForm.fullName || ''}
                 onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                 variant="outlined"
                 size="small"
               />
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Email"
                 type="email"
                 value={editForm.email || ''}
                 onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                 variant="outlined"
                 size="small"
               />
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Phone Number"
                 value={editForm.phone || ''}
                 onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                 variant="outlined"
                 size="small"
               />
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Date of Birth"
                 type="date"
                 value={editForm.dob || ''}
                 onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                 variant="outlined"
                 size="small"
                 InputLabelProps={{ shrink: true }}
               />
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Location"
                 value={editForm.location || ''}
                 onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                 variant="outlined"
                 size="small"
               />
             </Grid>
           </Grid>
         </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CancelIcon />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            startIcon={<SaveIcon />}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomerProfileMenu; 