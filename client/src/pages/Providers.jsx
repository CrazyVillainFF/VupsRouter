import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Hub,
  CheckCircle,
  ErrorOutline,
  Refresh,
  Launch,
  Key,
  Laptop,
  CloudQueue,
  Security,
  Check
} from '@mui/icons-material';
import { modelsApi } from '../services/api.js';

export const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [healthMap, setHealthMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    loadProvidersAndHealth();
  }, []);

  async function loadProvidersAndHealth() {
    setLoading(true);
    try {
      const [provRes, healthRes] = await Promise.allSettled([
        modelsApi.getProviders(),
        modelsApi.getAllProvidersHealth()
      ]);

      if (provRes.status === 'fulfilled' && provRes.value?.success) {
        setProviders(provRes.value.data.providers);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value?.success) {
        setHealthMap(healthRes.value.data.health);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTestConnection = async (providerId) => {
    setCheckingHealth(true);
    try {
      const res = await modelsApi.getProviderHealth(providerId);
      if (res.success && res.data?.health) {
        setHealthMap((prev) => ({
          ...prev,
          [providerId]: res.data.health
        }));
      }
    } catch (e) {
      console.error('Health test error:', e);
    } finally {
      setCheckingHealth(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
              GATEWAY ARCHITECTURE
            </Typography>
            <Chip
              label="Multi-Provider Router"
              size="small"
              sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', height: 20 }}
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Provider Integrations
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
            VupsRouter connects to cloud gateways, hosted model endpoints, and local hardware inference engines without exposing keys to the browser.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadProvidersAndHealth}
          disabled={loading || checkingHealth}
        >
          Check All Status
        </Button>
      </Box>

      {/* Live Provider Cards Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#00f0ff' }} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {providers.map((p) => {
            const health = healthMap[p.id];
            const isConnected = health?.connected || false;

            return (
              <Grid item xs={12} lg={6} key={p.id}>
                <Card
                  className="glass-panel"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    border: isConnected
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid var(--surface-border)'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Provider Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '10px',
                            bgcolor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                            border: `1px solid ${isConnected ? '#10b981' : 'var(--surface-border)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isConnected ? '#10b981' : '#00f0ff'
                          }}
                        >
                          {p.type === 'local' ? <Laptop /> : <CloudQueue />}
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {p.type === 'local' ? 'Local Hardware Runtime' : 'Hosted API Gateway'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Connection Badge */}
                      <Chip
                        icon={isConnected ? <CheckCircle fontSize="small" /> : <ErrorOutline fontSize="small" />}
                        label={isConnected ? 'Online & Linked' : p.isConfigured ? 'Gateway Offline' : 'Key Required'}
                        color={isConnected ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65 }}>
                      {p.description}
                    </Typography>

                    {/* Status Message */}
                    {health && (
                      <Alert
                        severity={isConnected ? 'success' : 'info'}
                        sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.82rem' }}
                      >
                        {health.message}
                      </Alert>
                    )}

                    {/* Features List */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#00f0ff' }}>
                      Supported Capabilities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
                      {p.supportedFeatures?.map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', fontSize: '0.72rem' }}
                        />
                      ))}
                    </Box>

                    {/* Setup Instructions */}
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--surface-border)' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Key fontSize="inherit" /> Integration Setup
                      </Typography>
                      <Typography variant="caption" sx={{ lineHeight: 1.5, display: 'block', color: '#f8fafc' }}>
                        {p.setupInstructions}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      href={p.docsUrl}
                      target="_blank"
                      rel="noopener"
                      size="small"
                      endIcon={<Launch sx={{ fontSize: 14 }} />}
                      sx={{ color: 'text.secondary' }}
                    >
                      Documentation
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={checkingHealth}
                    >
                      Ping Connection
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Providers;
