import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';

const DriverFooter = () => {
  return (
    <>
      {/* Copyright Section */}
      <Box bgcolor="black" color="white" py={3} sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%'
      }}>
        <Container>
          <Typography 
            align="center"
            variant="body1"
            sx={{
              fontWeight: 500,
              '& a': {
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main'
                }
              }
            }}
          >
            &copy; <Link to="/Driver">TRAVELERS</Link>, All Right Reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default DriverFooter;
