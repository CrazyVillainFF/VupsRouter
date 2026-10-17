import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Hub,
  Security,
  ShieldOutlined,
  VerifiedOutlined,
  Balance,
  ArrowForward,
  Bolt
} from '@mui/icons-material';

export const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
          THE VUPSROUTER MISSION
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
          Democratizing Frontier AI Through Intelligent Routing
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto', mt: 2, lineHeight: 1.7 }}>
          VupsRouter was founded on a straightforward principle: developers, researchers, and creators should have unified access to world-class free AI models without fragmented API dashboards, hidden paywalls, or privacy compromises.
        </Typography>
      </Box>

      {/* Core Principles Grid */}
      <Grid container spacing={4} sx={{ mb: 10 }}>
        <Grid item xs={12} md={4}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
                mb: 2
              }}
            >
              <VerifiedOutlined />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Truthful Pricing Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              We never label a model "completely free" simply because its open weights exist or because a company offers a trial. Every free tier in VupsRouter is grounded in verifiable provider metadata, active rate limits, and clear quota indicators.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
                mb: 2
              }}
            >
              <Hub />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Provider Independence
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              VupsRouter is agnostic to model provenance. Whether utilizing local Ollama models on bare-metal hardware, high-throughput FlagshipRouter gateways, or OpenRouter free endpoints, the user experience remains uniform and fast.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                mb: 2
              }}
            >
              <Security />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Zero Key Exposure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Client browsers never handle raw provider credentials. All API tokens, rate limits, and routing validations execute server-side through the hardened Express backend and Prisma database layer.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Routing Architecture Deep Dive */}
      <Box className="glass-panel" sx={{ p: { xs: 4, md: 6 }, mb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          How VupsRouter Architecture Operates
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          Traditional AI dashboards force users to navigate multiple disparate API portals, manage separate keys, monitor conflicting credit structures, and adapt to custom SDKs. VupsRouter unifies these into a single routing pipeline:
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--surface-border)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00f0ff', mb: 1 }}>
                1. Provider Gateway Adapters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Modular server adapters translate standard OpenAI-compatible requests and Server-Sent Events (SSE) into native provider protocols (e.g. FlagshipRouter, Gemini REST, Ollama API).
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--surface-border)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00f0ff', mb: 1 }}>
                2. Real-Time Metadata Aggregation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                The provider registry polls model endpoints, normalizes context lengths and multimodal capabilities, and caches availability to keep UI transitions instantaneous.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* CTA */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          component={RouterLink}
          to="/models"
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          sx={{ px: 4, py: 1.4 }}
        >
          Explore Verified Models
        </Button>
      </Box>
    </Container>
  );
};

export default About;
