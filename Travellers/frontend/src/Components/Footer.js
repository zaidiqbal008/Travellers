import React from "react";
import { Container, Typography, Box } from "@mui/material";

function Footer() {
  return (
    <Box sx={{ backgroundColor: '#000', color: '#fff', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          Copyright © 2025. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;