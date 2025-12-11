import React from "react";
import { Container, Box, Typography, Card } from '@mui/material';

function About() {
  return (
    <Container sx={{ py: 5 }}>
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        >
          Why Choose Travellers?
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 5,
            maxWidth: 800,
            mx: 'auto',
            mt: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          As a leading taxi pre-booking service, Travelers prioritizes punctuality,
          safety, and customer satisfaction. Our professional drivers are verified,
          experienced, and courteous, ensuring a smooth and reliable ride. Whether
          it’s a daily commute, long-route travel, or airport transfer, we guarantee
          that you reach your destination on time, every time, eliminating last-minute
          uncertainties and delays.
        </Typography>
      </Box>

      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
      >
        We Make Sure Your Ride Is Comfortable
      </Typography>

      {/* Flex container for horizontal card layout */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          overflowX: 'auto',
          gap: 3,
          pb: 2,
        }}
      >
        {[
          {
            title: "Luxury",
            description: "Enjoy premium rides with top-notch comfort and style.",
          },
          {
            title: "Professional",
            description: "Our chauffeurs are experienced, courteous, and reliable.",
          },
          {
            title: "Pre-Book Rides",
            description: "Schedule your rides in advance for a hassle-free experience.",
          },
        ].map((item, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 280,
              maxWidth: 300,
              flexShrink: 0,
              textAlign: 'center',
              p: 2,
              height: '100%',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {item.description}
            </Typography>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default About;
