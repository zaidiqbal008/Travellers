import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';

const CustomerFooter = () => {
  return (
    <>
      {/* Copyright Section */}
      <Box bgcolor="#111" color="white" py={3}>
        <Container>
          <Typography 
            align="center"
            sx={{
              '& a': {
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main'
                }
              }
            }}
          >
            &copy; <Link to="/customer">TRAVELERS</Link>, All Right Reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default CustomerFooter; 