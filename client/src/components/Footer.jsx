import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, Chip, Divider } from '@mui/material';
import { Hub, Security, Bolt, Public } from '@mui/icons-material';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: '1px solid var(--surface-border)',
        backgroundColor: 'rgba(7, 8, 14, 0.95)',
        backdropFilter: 'blur(16px)',
        py: 6,
        position: 'relative',
        zIndex: 10
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Hub sx={{ fontSize: 18, color: '#07080e' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Vups<span style={{ color: '#00f0ff' }}>Router</span>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 2, lineHeight: 1.7 }}>
              The unified intelligent router for free, high-performance AI models. Discover, compare, and harness open weights, private gateways, and flagship cloud models from one seamless interface.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<Bolt sx={{ fontSize: 14, color: '#10b981' }} />}
                label="FlagshipRouter Gateway Online"
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.72rem'
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#00f0ff' }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Link component={RouterLink} to="/models" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Free Model Explorer
              </Link>
              <Link component={RouterLink} to="/compare" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Model Comparison
              </Link>
              <Link component={RouterLink} to="/chat" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                AI Workspace
              </Link>
              <Link component={RouterLink} to="/providers" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Providers Hub
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#00f0ff' }}>
              Account & Hub
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Link component={RouterLink} to="/dashboard" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                User Dashboard
              </Link>
              <Link component={RouterLink} to="/signin" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link component={RouterLink} to="/signup" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Create Account
              </Link>
              <Link component={RouterLink} to="/settings" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>
                Preferences
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#00f0ff' }}>
              Architecture & Transparency
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.6 }}>
              All pricing and free status labels are grounded in verifiable provider metadata. Private API keys remain securely on the Express server and are never delivered to the client.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link component={RouterLink} to="/about" color="text.secondary" underline="hover" sx={{ fontSize: '0.85rem' }}>
                About & Ethics
              </Link>
              <Link href="https://openrouter.ai" target="_blank" rel="noopener" color="text.secondary" underline="hover" sx={{ fontSize: '0.85rem' }}>
                OpenRouter
              </Link>
              <Link href="http://localhost:20128/v1/models" target="_blank" rel="noopener" color="text.secondary" underline="hover" sx={{ fontSize: '0.85rem' }}>
                Flagship Gateway
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} VupsRouter. Built for open artificial intelligence. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link component={RouterLink} to="/about" color="text.secondary" underline="hover" sx={{ fontSize: '0.78rem' }}>
              Privacy Protocol
            </Link>
            <Link component={RouterLink} to="/about" color="text.secondary" underline="hover" sx={{ fontSize: '0.78rem' }}>
              Terms of Routing
            </Link>
            <Link component={RouterLink} to="/about" color="text.secondary" underline="hover" sx={{ fontSize: '0.78rem' }}>
              Security
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
