import React from "react";
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import SedanImage from './Images/Sedan.png';
import SUVImage from './Images/SUV.png';
import MiniVanImage from './Images/MiniVan.png';
import { useNavigate } from "react-router-dom"; 

function Services() {
  const navigate = useNavigate(); 

  const rides = [
    {
      title: "Luxury Sedan",
      backgroundImage: SedanImage,
      description: "Premium comfort and elegance for solo or group travel. Perfect for business trips, or special occasions.",
      passengers: 4,
      luggage: 4,
      rate: "PKR 1500 / km",
      airConditioned: "Yes",
    },
    {
      title: "SUV",
      backgroundImage: SUVImage,
      description: "Spacious and versatile with luxury seating for up to 7 passengers. Ideal for family outings, group travel, city-to-city tour/travel road trips in style.",
      passengers: 7,
      luggage: 2,
      rate: "PKR 1000 / km",
      airConditioned: "Yes",
    },
    {
      title: "Mini Van",
      backgroundImage: MiniVanImage,
      description: "Luxury meets practicality with ample room for up to 4 passengers. Perfect for groups, airport runs, incity trips or city-to-city tour/travel.",
      passengers: 10,
      luggage: 4,
      rate: "PKR 800 / km",
      airConditioned: "Yes",
    },
  ];

  const handleBookNow = () => {
    navigate("/login"); 
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ mb: 5, fontSize: { xs: '1.75rem', sm: '2.25rem' } }}
      >
        Rides We Offer
      </Typography>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 3,
          pb: 2,
        }}
      >
        {rides.map((ride, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 300,
              maxWidth: 350,
              flexShrink: 0,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Box
              sx={{
                backgroundImage: `url(${ride.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: { xs: 150, sm: 200, md: 250 },
              }}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {ride.title}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {ride.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Passengers: {ride.passengers}</Typography>
                <Typography variant="body2">Luggage: {ride.luggage}</Typography>
                <Typography variant="body2">Flat Rate: {ride.rate}</Typography>
                <Typography variant="body2">Air Conditioned: {ride.airConditioned}</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default Services;
