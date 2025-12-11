import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Luggage as LuggageIcon,
} from '@mui/icons-material';

// Mock data for maintenance progress
const maintenanceData = [
  { id: 'Mark', label: 'Mark X', progress: 45, color: '#a855f7' },
  { id: 'Corolla', label: 'Corolla X', progress: 75, color: '#f43f5e' },
  { id: 'Fortuner', label: 'Fortuner', progress: 19, color: '#5817ee' },
  { id: 'E-Class', label: 'Mercedes E-Class', progress: 25, color: '#facc15' },
  { id: 'w210', label: 'MERCEDES w210', progress: 65, color: '#0ea5e9' },
  { id: 'Audi', label: 'Audi A6', progress: 80, color: '#22c55e' },
  { id: 'Peugeot', label: 'Peugeot 3008', progress: 30, color: '#f97316' },
  { id: 'Honda', label: 'Honda BR-V', progress: 30, color: '#ff00ff' },
];

// Mock data for cars
const carsData = [
  {
    id: 1,
    name: 'Corolla Altis',
    image: '/Admin/img/altis.png',
    engineNo: '123456789',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 2,
    name: 'Camry',
    image: '/Admin/img/Camry.png',
    engineNo: '123456789',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 3,
    name: 'Fortuner',
    image: '/Admin/img/fortuner.png',
    engineNo: '123456789',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 4,
    name: 'Mercedes E-Class',
    image: '/Admin/img/e-class.png',
    engineNo: '12345678900',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 5,
    name: 'Audi A6',
    image: '/Admin/img/audi.png',
    engineNo: '12345678900',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 6,
    name: 'MERCEDES w210',
    image: '/Admin/img/w210.jpg',
    engineNo: '123456789',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 7,
    name: 'Peugeot 3008',
    image: '/Admin/img/3008.png',
    engineNo: '12345678900',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 8,
    name: 'Mark-X',
    image: '/Admin/img/mark-x.png',
    engineNo: '12345678900',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
  {
    id: 9,
    name: 'Honda BR-V',
    image: '/Admin/img/BR-V.png',
    engineNo: '123456789',
    chassisNo: '7897564632',
    passengers: 4,
    luggage: 3,
  },
];

const ProgressCard = ({ id, label, progress, color }) => (
  <Card 
    sx={{ 
      p: 2.5, 
      textAlign: 'center',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        bgcolor: '#f8f9fa',
      },
      cursor: 'pointer',
      position: 'relative',
      minWidth: 120,
    }}
  >
    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={80}
        thickness={4}
        sx={{ color: color }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {progress}%
        </Typography>
      </Box>
    </Box>
    <Typography variant="body2" sx={{ mt: 1 }}>
      {label}
    </Typography>
  </Card>
);

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  const handleMaintenanceClick = () => {
    navigate(`/admin/maintenance/${car.id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="240"
        image={car.image}
        alt={car.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" align="center" gutterBottom sx={{ textTransform: 'uppercase' }}>
            {car.name}
          </Typography>
          <List dense>
            <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <SpeedIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText primary={`Engine No: ${car.engineNo}`} />
            </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <TimerIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText primary={`Chassis No: ${car.chassisNo}`} />
            </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText primary={`Passengers: ${car.passengers}`} />
            </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <LuggageIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText primary={`Luggage Carry: ${car.luggage}`} />
            </ListItem>
          </List>
        </Box>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleMaintenanceClick}
          sx={{ 
            mt: 2,
            bgcolor: 'warning.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'warning.dark',
            },
          }}
        >
          Maintenance
        </Button>
      </CardContent>
    </Card>
  );
};

const AdminMaintainces = () => {
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4, mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Maintainces
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, To The Maintainces!
        </Typography>
      </Box>

      {/* Progress Cards */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {maintenanceData.map((item) => (
            <Grid xs={12} sm={6} md={3} key={item.id}>
              <ProgressCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Car Cards */}
      <Box sx={{ 
        py: 5, 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'flex-start'
        }}>
          {carsData.map((car) => (
            <Box 
              key={car.id} 
              sx={{ 
                flex: '0 0 calc(25% - 18px)',
                '@media (max-width: 1200px)': {
                  flex: '0 0 calc(33.333% - 18px)',
                },
                '@media (max-width: 900px)': {
                  flex: '0 0 calc(50% - 18px)',
                },
                '@media (max-width: 600px)': {
                  flex: '0 0 100%',
                }
              }}
            >
              <CarCard car={car} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminMaintainces;
