import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import Footer from '../../../components/Footer';
import './DestinationLayout.css';

const DestinationLayout = ({ children, destination }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, pt: 4 }}>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
            <Link underline="hover" color="inherit" href="/" display="flex" alignItems="center">
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/destinations">
              Destinations
            </Link>
            {destination && (
              <Typography color="text.primary">
                {destination.name}
              </Typography>
            )}
          </Breadcrumbs>
          {children || <Outlet context={{ destination }} />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default DestinationLayout;
