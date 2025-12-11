import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DriverHeader from './DriverHeader';
import DriverFooter from './DriverFooter';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Rating,
  Stack,
  CircularProgress,
  Divider,
  Paper,
  Button,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip
} from '@mui/material';
import {
  Phone,
  Person,
  EmojiEvents,
  Badge,
  DirectionsCar,
  Numbers,
  Email,
  CreditCard,
  CalendarToday,
  Image,
  Edit,
  Save,
  Add,
  Cancel,
  Close,
  PhotoCamera,
  Delete
} from '@mui/icons-material';
import { authAPI, userProfileAPI, carAPI } from '../../utils/api';
import { useProfile } from '../../contexts/ProfileContext';

const DriverAbout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { profileImage, updateProfileImage } = useProfile();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [cars, setCars] = useState([]);
  const [editingCarId, setEditingCarId] = useState(null);
  const [editableCar, setEditableCar] = useState({});
  const [addingNewCar, setAddingNewCar] = useState(false);
  const [newCar, setNewCar] = useState({
    model: '',
    color: '',
    registration: '',
    seats: 0,
    ac: false,
    imageFile: null
  });

  useEffect(() => {
    const verifyDriver = async () => {
      try {
        const { data: user } = await authAPI.getCurrentUser();
        const { data: userProfile } = await userProfileAPI.getProfile();
        
        if (user && user.userType === 'driver') {
          setLoading(false);
          setProfile(userProfile);
          setEditableProfile({
            fullName: userProfile.fullName || '',
            phone: userProfile.user?.phone || '',
            experience: userProfile.driverInfo?.experience || 0,
            licenseNumber: userProfile.driverInfo?.licenseNumber || '',
            bio: userProfile.bio || ''
          });
          if (user.profilePicture) {
            updateProfileImage(`http://localhost:5000${user.profilePicture}`);
          } else {
            // Set default profile picture if none exists
            updateProfileImage('/Driver/img/team-1.png');
          }
          
          // Load cars for the driver
          try {
            const { data: carsData } = await carAPI.getCars();
            setCars(carsData || []);
          } catch (carError) {
            console.error("Failed to load cars:", carError);
            setCars([]);
          }
        } else {
          console.log('User is not a driver, but not redirecting to avoid loop');
          setLoading(false);
        }
      } catch (error) {
        console.error("Driver verification failed for about", error);
        console.log('Error fetching user, but not redirecting to avoid loop');
        setLoading(false);
      }
    };

    verifyDriver();
  }, [navigate, updateProfileImage]);

  const handleEditChange = (e) => {
    setEditableProfile({ ...editableProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName: editableProfile.fullName,
        phone: editableProfile.phone,
        bio: editableProfile.bio,
        driverInfo: {
          experience: editableProfile.experience,
          licenseNumber: editableProfile.licenseNumber
        }
      };
      await userProfileAPI.updateProfile(payload);
      const { data: userProfile } = await userProfileAPI.getProfile();
      setProfile(userProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };


  // Handle profile pic change
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    updateProfileImage(URL.createObjectURL(file)); // Show preview immediately

    // Upload to backend
    const data = new FormData();
    data.append('profilePicture', file);
    try {
      const result = await userProfileAPI.uploadProfilePic(data);
      if(result.data.profilePicture) {
        updateProfileImage(`http://localhost:5000${result.data.profilePicture}`);
        
        // Refresh user data to sync with header
        const { data: user } = await authAPI.getCurrentUser();
        if (user && user.profilePicture) {
          updateProfileImage(`http://localhost:5000${user.profilePicture}`);
        }
      }
    } catch (err) {
      console.error('Profile picture upload error:', err);
      alert(`Error uploading profile picture: ${err.response?.data?.message || err.message}`);
      // Revert to previous if upload fails - fetch from server again
      try {
        const { data: user } = await authAPI.getCurrentUser();
        updateProfileImage(user.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/Driver/img/team-1.png');
      } catch (fetchErr) {
        console.error('Error fetching user after upload failure:', fetchErr);
        updateProfileImage('/Driver/img/team-1.png');
      }
    }
  };

  // Handle remove profile pic
  const handleRemoveProfilePic = async () => {
    updateProfileImage('/Driver/img/team-1.png'); // fallback/default
    try {
      await userProfileAPI.removeProfilePic();
      
      // Refresh user data to sync with header
      const { data: user } = await authAPI.getCurrentUser();
      if (user && user.profilePicture) {
        updateProfileImage(`http://localhost:5000${user.profilePicture}`);
      } else {
        updateProfileImage('/Driver/img/team-1.png');
      }
    } catch (err) {
      console.error('Profile picture removal error:', err);
      alert(`Error removing profile picture: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleAddNewCar = () => {
    setAddingNewCar(true);
    setNewCar({
      model: '',
      color: '',
      registration: '',
      seats: 4,
      ac: true,
      imageFile: null,
      imagePreview: null
    });
  };

  const handleEditCar = (car) => {
    setEditingCarId(car._id);
    setEditableCar(car);
  };

  const handleSaveCar = async (carId) => {
    try {
      const formData = new FormData();
      formData.append('model', editableCar.model);
      formData.append('color', editableCar.color);
      formData.append('registration', editableCar.registration);
      formData.append('seats', editableCar.seats);
      formData.append('ac', editableCar.ac);
      if (editableCar.imageFile) {
        formData.append('image', editableCar.imageFile);
      }
      
      await carAPI.updateCar(carId, formData);
      
      // Refresh cars list
      const { data: carsData } = await carAPI.getCars();
      setCars(carsData || []);
      
      setEditingCarId(null);
      setEditableCar({});
    } catch (error) {
      console.error("Failed to save car", error);
    }
  };

  const handleCancelEditCar = () => {
    setEditingCarId(null);
    setEditableCar({});
  };

  const handleCarFieldChange = (field, value) => {
    setEditableCar({ ...editableCar, [field]: value });
  };

  const handleCarImageChange = (e, carId) => {
    const file = e.target.files[0];
    if (file) {
      setEditableCar(prev => ({ 
        ...prev, 
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveNewCar = async () => {
    try {
      const formData = new FormData();
      formData.append('model', newCar.model);
      formData.append('color', newCar.color);
      formData.append('registration', newCar.registration);
      formData.append('seats', newCar.seats);
      formData.append('ac', newCar.ac);
      if (newCar.imageFile) {
        formData.append('image', newCar.imageFile);
      }
      
      await carAPI.addCar(formData);
      
      // Refresh cars list
      const { data: carsData } = await carAPI.getCars();
      setCars(carsData || []);
      
      setAddingNewCar(false);
      setNewCar({
        model: '',
        color: '',
        registration: '',
        seats: 4,
        ac: true,
        imageFile: null,
        imagePreview: null
      });
    } catch (error) {
      console.error("Failed to save new car", error);
    }
  };

  const handleCancelAddCar = () => {
    setAddingNewCar(false);
    setNewCar({
      model: '',
      color: '',
      registration: '',
      seats: 4,
      ac: true,
      imageFile: null,
      imagePreview: null
    });
  };

  const handleNewCarFieldChange = (field, value) => {
    setNewCar({ ...newCar, [field]: value });
  };

  const handleNewCarImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewCar({ 
      ...newCar, 
      imageFile: file,
      imagePreview: URL.createObjectURL(file)
    });
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await carAPI.deleteCar(carId);
        
        // Refresh cars list
        const { data: carsData } = await carAPI.getCars();
        setCars(carsData || []);
      } catch (error) {
        console.error("Failed to delete car", error);
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <DriverHeader />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
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
            About Us
          </Typography>
        </Container>
      </Box>

      {/* Driver Profile Section */}
      <Container sx={{ my: 5 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Driver Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', position: 'relative' }}>
              <Box
                component="img"
                src={profileImage}
                alt="Driver Photo"
                sx={{
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3,
                  mb: 2,
                  objectFit: 'cover'
                }}
              />
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Rating:</Typography>
                <Rating value={4.8} precision={0.1} readOnly />
                <Typography variant="h6">4.8</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Profile photo syncs with header menu
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-pic-upload"
                type="file"
                onChange={handleProfilePicChange}
              />
              <label htmlFor="profile-pic-upload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{ mr: 1 }}
                >
                  Change
                </Button>
              </label>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveProfilePic}
              >
                Remove
              </Button>
            </Box>
          </Grid>

          {/* Driver Info */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ p: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                {isEditing ? (
                  <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                    Save
                  </Button>
                ) : (
                  <Button variant="outlined" startIcon={<Edit />} onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </Box>
              <Typography variant="h4" color="primary" gutterBottom sx={{ mb: 3 }}>
                Driver Profile
              </Typography>

              {isEditing ? (
                /* EDITING VIEW */
                <Grid container spacing={2}>
                  {/* Form fields for editing */}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Name" name="fullName" value={editableProfile.fullName || ''} onChange={handleEditChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" name="phone" value={editableProfile.phone || ''} onChange={handleEditChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Experience (Years)" name="experience" value={editableProfile.experience || ''} onChange={handleEditChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="License #" name="licenseNumber" value={editableProfile.licenseNumber || ''} onChange={handleEditChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Bio" name="bio" value={editableProfile.bio || ''} onChange={handleEditChange} multiline rows={3} />
                  </Grid>
                </Grid>
              ) : (
                /* VIEW-ONLY LAYOUT */
                <>
                  <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Person color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{profile?.fullName}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Phone color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Phone</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{profile?.user.phone || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <EmojiEvents color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Experience</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{profile?.driverInfo?.experience || 'N/A'} Years</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Badge color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">License #</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{profile?.driverInfo?.licenseNumber || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                  <Divider />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>Bio</Typography>
                    <Typography variant="body2" color="text.secondary">{profile?.bio}</Typography>
                  </Box>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

          {/* Add New Car Button - always in its own row, above the grid */}
      <Container sx={{ my: 5 }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 4, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNewCar}
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1.1rem', 
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              Add New Car
            </Button>
          </Box>

          {/* Car Cards Grid */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
            {cars.map((car) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={car._id}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4, 
                  position: 'relative', 
                  display: 'flex',
                  flexDirection: 'column', 
                  height: '100%',
                  width: '100%',
                  minWidth: { xs: 280, sm: 320, md: 360, lg: 400 },
                  maxWidth: { xs: 350, sm: 400, md: 450, lg: 500 },
                  minHeight: { xs: 450, sm: 500, md: 550, lg: 600 },
                  maxHeight: { xs: 650, sm: 700, md: 750 },
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px)',
                    '& .car-image': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}>
                  {/* Action Buttons */}
                  <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, display: 'flex', gap: 1 }}>
                    {editingCarId === car._id ? (
                      <>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleSaveCar(car._id)} 
                          size="small"
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <Save />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={handleCancelEditCar} 
                          size="small"
                          sx={{ 
                            bgcolor: 'error.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    ) : (
                    <>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditCar(car)} 
                        size="small"
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteCar(car._id)} 
                        size="small"
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </>
                    )}
                  </Box>
                {/* Car Image */}
                  <Box sx={{ 
                    width: '100%', 
                    height: { xs: 140, sm: 160, md: 180, lg: 200 }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px 12px 0 0', 
                    mt: 0, 
                    mb: 0,
                    mx: 0,
                    border: 'none',
                    borderBottom: '1px solid #e9ecef',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <CardMedia
                      component="img"
                      className="car-image"
                      image={
                        editingCarId === car._id && editableCar.imagePreview
                          ? editableCar.imagePreview
                          : car.image
                            ? `http://localhost:5000${car.image}`
                            : '/Driver/img/car-2.jpg'
                      }
                      alt={`${car.model} Photo`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        background: 'none'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ 
                    flex: 1, 
                    width: '80%', 
                    pt: 3, 
                    pb: 3, 
                    px: { xs: 4, sm: 5 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    minHeight: { xs: 250, sm: 300, md: 350 },
                    overflow: 'hidden',
                    gap: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main', 
                      mb: 3, 
                      textAlign: 'center',
                      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                      lineHeight: 1.3
                    }}>
                      Car Details
                    </Typography>
                    {editingCarId === car._id ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        flex: 1,
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <TextField 
                          label="Car Model" 
                          value={editableCar.model} 
                          onChange={(e) => handleCarFieldChange('model', e.target.value)} 
                          size="small" 
                          fullWidth 
                          sx={{ 
                            '& .MuiInputBase-input': { 
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              padding: { xs: '10px 14px', sm: '12px 16px' }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                        <TextField 
                          label="Color" 
                          value={editableCar.color} 
                          onChange={(e) => handleCarFieldChange('color', e.target.value)} 
                          size="small" 
                          fullWidth 
                          sx={{ 
                            '& .MuiInputBase-input': { 
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              padding: { xs: '10px 14px', sm: '12px 16px' }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                        <TextField 
                          label="Registration" 
                          value={editableCar.registration} 
                          onChange={(e) => handleCarFieldChange('registration', e.target.value)} 
                          size="small" 
                          fullWidth 
                          sx={{ 
                            '& .MuiInputBase-input': { 
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              padding: { xs: '10px 14px', sm: '12px 16px' }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                        <TextField 
                          label="Seats" 
                          type="number" 
                          value={editableCar.seats} 
                          onChange={(e) => handleCarFieldChange('seats', e.target.value)} 
                          size="small" 
                          fullWidth 
                          sx={{ 
                            '& .MuiInputBase-input': { 
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              padding: { xs: '10px 14px', sm: '12px 16px' }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }
                          }}
                        />
                        <FormControlLabel 
                          control={<Switch checked={editableCar.ac} onChange={(e) => handleCarFieldChange('ac', e.target.checked)} />} 
                          label="AC" 
                          sx={{ 
                            '& .MuiFormControlLabel-label': { 
                              fontSize: { xs: '0.8rem', sm: '0.9rem' } 
                            },
                            margin: { xs: '8px 0', sm: '12px 0' }
                          }}
                        />
                        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 } }}>
                          <input accept="image/*" style={{ display: 'none' }} id={`car-image-upload-${car._id}`} type="file" onChange={(e) => handleCarImageChange(e, car._id)} />
                          <label htmlFor={`car-image-upload-${car._id}`}>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              component="span" 
                              startIcon={<PhotoCamera />}
                              sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                padding: { xs: '10px 16px', sm: '12px 20px' }
                              }}
                            >
                              Change Image
                            </Button>
                          </label>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        flex: 1,
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: { xs: 0.5, sm: 0.75 },
                          padding: { xs: '4px 0', sm: '6px 0' },
                          flex: 1
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'primary.main'
                          }}>Model:</Typography>
                          <Chip label={car.model} size="small" color="primary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontWeight: 500
                            }
                          }} />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: { xs: 0.5, sm: 0.75 },
                          padding: { xs: '4px 0', sm: '6px 0' },
                          flex: 1
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'primary.main'
                          }}>Color:</Typography>
                          <Chip label={car.color} size="small" variant="outlined" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontWeight: 500
                            }
                          }} />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: { xs: 0.5, sm: 0.75 },
                          padding: { xs: '4px 0', sm: '6px 0' },
                          flex: 1
                        }}>  
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'primary.main'
                          }}>Registration:</Typography>
                          <Chip label={car.registration} size="small" variant="outlined" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontWeight: 500
                            }
                          }} />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: { xs: 0.5, sm: 0.75 },
                          padding: { xs: '4px 0', sm: '6px 0' },
                          flex: 1
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'primary.main'
                          }}>Seats:</Typography>
                          <Chip label={car.seats} size="small" color="secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: { xs: '8px 12px', sm: '10px 16px' },
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontWeight: 500
                            }
                          }} />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: { xs: 0.5, sm: 0.75 },
                          padding: { xs: '4px 0', sm: '6px 0' },
                          flex: 1
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            mb: 0.5,
                            color: 'primary.main'
                          }}>AC:</Typography>
                          <Chip 
                            label={car.ac ? 'Yes' : 'No'} 
                            size="small" 
                            color={car.ac ? 'success' : 'default'}
                            variant={car.ac ? 'filled' : 'outlined'}
                            sx={{ 
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: { xs: '8px 12px', sm: '10px 16px' },
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                textAlign: 'left',
                                fontWeight: 500
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
      </Container>

          {/* Add New Car Dialog */}
          <Dialog 
            open={addingNewCar} 
            onClose={handleCancelAddCar}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: 8
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Add New Car
                  </Typography>
              <IconButton onClick={handleCancelAddCar} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Image Upload Section */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 3,
                    border: '2px dashed #dee2e6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {newCar.imagePreview ? (
                      <CardMedia
                        component="img"
                        image={newCar.imagePreview}
                        alt="Car Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <PhotoCamera sx={{ fontSize: 48, color: '#6c757d', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to upload car image
                  </Typography>
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      type="file"
                      onChange={handleNewCarImageChange}
                    />
                  </Box>
                </Box>

                {/* Form Fields */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Car Model"
                      value={newCar.model}
                      onChange={(e) => handleNewCarFieldChange('model', e.target.value)}
                      fullWidth
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Color"
                      value={newCar.color}
                      onChange={(e) => handleNewCarFieldChange('color', e.target.value)}
                      fullWidth
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registration Number"
                      value={newCar.registration}
                      onChange={(e) => handleNewCarFieldChange('registration', e.target.value)}
                      fullWidth
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Number of Seats"
                      type="number"
                      value={newCar.seats}
                      onChange={(e) => handleNewCarFieldChange('seats', e.target.value)}
                      fullWidth
                      required
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newCar.ac}
                          onChange={(e) => handleNewCarFieldChange('ac', e.target.checked)}
                        />
                      }
                      label="Air Conditioning Available"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCancelAddCar} variant="outlined" sx={{ px: 3 }}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewCar} variant="contained" sx={{ px: 4 }}>
                Add Car
              </Button>
            </DialogActions>
          </Dialog>

        {/* New Car Details Upload Form */}
        {/* <Container sx={{ my: 5 }}>
          <DriverCarForm />
        </Container> */}
      </Box>

      <DriverFooter />
    </Box>
  );
};

export default DriverAbout;
