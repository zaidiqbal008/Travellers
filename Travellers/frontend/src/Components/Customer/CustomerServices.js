import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import TourBookingForm from './TourBookingForm';
import authService from '../../utils/auth';

const tourPackages = [
  {
    image: "/Customer/img/Naran.jpg",
    title: "NARAN KAGHAN TOUR",
    pricing: [
      "Alto: 3000/- per person",
      "Corolla/Swift/Dayz: 1800/-"
    ]
  },
  {
    image: "/Customer/img/swat.jpg",
    title: "ABBOTTBAD TOUR",
    pricing: [
      "HULIX: 2500/- per person",
      "BJ40/JEEP/WAGNOR: 1800/-"
    ]
  },
  {
    image: "/Customer/img/mess.jpg",
    title: "AZAD KASHMIR TOUR",
    pricing: [
      "HULIX: 2500/- per person",
      "BJ40/JEEP/WAGNOR: 1800/-"
    ]
  },
  {
    image: "/Customer/img/harnoi.jpg",
    title: "HARNOI WATERFALL TOUR",
    pricing: [
      "HULIX: 2500/- per person",
      "BJ40/JEEP/WAGNOR: 1800/-"
    ]
  },
  {
    image: "/Customer/img/ayubia.jpg",
    title: "AYUBIA PIPELINE TOUR",
    pricing: [
      "Alto: 3000/- per person",
      "Corolla/Swift/Dayz: 1800/-"
    ]
  },
  {
    image: "/Customer/img/nathia .jpg",
    title: "NATHIA GALI TOUR",
    pricing: [
      "Alto: 3000/- per person",
      "Corolla/Swift/Dayz: 1800/-"
    ]
  }
];

const CustomerServices = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLearnMore = (tourTitle) => {
    // Navigate to the booking form with tour data
    navigate('/customer/tour-booking', { state: { selectedTour: tourTitle } });
  };

  return (
    <>
      <CustomerHeader />

      {/* Page Header */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          py: 6,
          my: 6,
          mt: 0,
          color: 'white',
          textAlign: 'center',
          animation: 'fadeIn 0.1s ease-in',
        }}
      >
        <Container>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mb: 4,
              animation: 'slideInDown 1s',
              fontWeight: 'bold'
            }}
          >
            TOURS
          </Typography>
        </Container>
      </Box>

      {/* Services Cards */}
      <Container sx={{ py: 5, mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center'
          }}
        >
          {tourPackages.map((tour, index) => (
            <Box
              key={index}
              sx={{
                flex: '1 1 30%',
                maxWidth: '32%',
                minWidth: 280,
                mb: 4,
                display: 'block'
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  minHeight: 420,
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 3,
                  m: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={tour.image}
                  alt={tour.title}
                  sx={{ borderRadius: 2, mb: 3, objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mt: -6,
                    mb: 2,
                    color: 'white',
                    boxShadow: 2
                  }}
                >
                  <LocationOn />
                </Box>
                <CardContent sx={{ flexGrow: 1, px: 1, pb: '16px!important' }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                    {tour.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                  {tour.pricing.map((price, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {price}
                    </Typography>
                  ))}
                  </Box>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleLearnMore(tour.title)}
                    sx={{ mt: 2, py: 1.2, fontWeight: 600, fontSize: '1rem', borderRadius: 2 }}
                  >
                    Book Now →
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      <CustomerFooter />
    </>
  );
};

export default CustomerServices;
