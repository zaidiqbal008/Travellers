import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
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

// Car names mapping
const carNames = {
  1: 'Corolla Altis',
  2: 'Camry',
  3: 'Fortuner',
  4: 'Mercedes E-Class',
  5: 'Audi A6',
  6: 'MERCEDES w210',
  7: 'Peugeot 3008',
  8: 'Mark-X',
  9: 'Honda BR-V'
};

// Mock data for maintenance progress
const maintenanceData = [
  { id: 'Petrol', label: 'Petrol', progress: 45, color: '#a855f7' },
  { id: 'Engine', label: 'Engine Oil', progress: 75, color: '#f43f5e' },
  { id: 'Air', label: 'Air Filter', progress: 19, color: '#5817ee' },
  { id: 'Gare', label: 'Gare Oil', progress: 25, color: '#facc15' },
  { id: 'Brake', label: 'Brake Oil', progress: 65, color: '#0ea5e9' },
  { id: 'Coolant', label: 'Coolant', progress: 80, color: '#22c55e' },
  { id: 'Injectors', label: 'Oil Injectors', progress: 30, color: '#f97316' },
  { id: 'Pads', label: 'Brake Pads', progress: 75, color: '#460346' },
  { id: 'Washing', label: 'Washing', progress: 98, color: '#ff00ff' },
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
    <Box sx={{ position: 'relative', width: 80, height: 80, margin: '0 auto' }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${color} ${progress * 3.6}deg, #eee ${progress * 3.6}deg 360deg)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'background.paper',
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

const CarDetails = () => {
  const { carId } = useParams();
  const carName = carNames[carId] || 'Unknown Car';

  // Chart data
  const engineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
              label: `${carName} Engine (Rs. 24,560)`,
      data: [150, 200, 450, 220, 240, 210, 450, 600, 500],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const maintenanceChartData = {
    labels: ['Oil Changing', 'Air Filter', 'Gare Oil', 'Washing'],
    datasets: [{
      label: `${carName} Maintenance`,
      data: [120, 90, 70, 150],
      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {carName} Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Maintenance Details!
        </Typography>
      </Box>

      {/* Progress Cards */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {maintenanceData.map((item) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={item.id}>
              <ProgressCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            height: '100%',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}>
            <Typography variant="h6" gutterBottom>
              Engine Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={engineChartData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            height: '100%',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}>
            <Typography variant="h6" gutterBottom>
              Maintenance History
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={maintenanceChartData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarDetails; 