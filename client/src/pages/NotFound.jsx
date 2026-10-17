import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, ExploreOutlined } from '@mui/icons-material';

export const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 16, textAlign: 'center' }}>
      <Box className="glass-panel" sx={{ p: { xs: 5, md: 8 }, maxWidth: 640, mx: 'auto' }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '5rem', md: '8rem' },
            color: '#00f0ff',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            mb: 2
          }}
        >
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          Route Vector Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          The neural coordinates you requested do not exist in the VupsRouter registry or may have been relocated.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            startIcon={<Home />}
            sx={{ px: 3, py: 1.2 }}
          >
            Return Home
          </Button>
          <Button
            component={RouterLink}
            to="/models"
            variant="outlined"
            startIcon={<ExploreOutlined />}
            sx={{ px: 3, py: 1.2 }}
          >
            Browse Models
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
