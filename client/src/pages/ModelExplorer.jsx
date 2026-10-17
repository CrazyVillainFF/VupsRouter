import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  CheckCircle,
  Bolt,
  Launch,
  ChatOutlined,
  CompareArrows,
  Close,
  Memory,
  Visibility,
  Code,
  Psychology,
  Refresh
} from '@mui/icons-material';
import { modelsApi } from '../services/api.js';

export const ModelExplorer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('provider') || 'all');
  const [selectedCapability, setSelectedCapability] = useState(searchParams.get('cap') || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [detailModalModel, setDetailModalModel] = useState(null);

  const capabilitiesList = [
    'General chat',
    'Reasoning',
    'Coding',
    'Vision',
    'Tool calling',
    'Multimodal input',
    'Audio and speech'
  ];

  const providersList = [
    { id: 'all', label: 'All Providers' },
    { id: 'flagshiprouter', label: 'FlagshipRouter' },
    { id: 'openrouter', label: 'OpenRouter' },
    { id: 'google-ai', label: 'Google AI' },
    { id: 'huggingface', label: 'Hugging Face' },
    { id: 'ollama', label: 'Ollama (Local)' }
  ];

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels(forceRefresh = false) {
    setLoading(true);
    try {
      const res = await modelsApi.getModels({ refresh: forceRefresh ? 'true' : 'false' });
      if (res.success && res.data?.models) {
        setModels(res.data.models);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesId = m.id?.toLowerCase().includes(q);
        const matchesDesc = m.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }

      // 2. Provider Filter
      if (selectedProvider !== 'all') {
        if (m.providerId !== selectedProvider) return false;
      }

      // 3. Capability Filter
      if (selectedCapability !== 'all') {
        if (!m.capabilities?.includes(selectedCapability)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'context') return (b.contextLength || 0) - (a.contextLength || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [models, searchQuery, selectedProvider, selectedCapability, sortBy]);

  const handleStartChat = (modelId) => {
    navigate(`/chat?model=${encodeURIComponent(modelId)}`);
  };

  const handleCompareClick = (modelId) => {
    navigate(`/compare?models=${encodeURIComponent(modelId)}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
              INTELLIGENT REGISTRY
            </Typography>
            <Chip
              label="Live Sync Active"
              size="small"
              sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', height: 20 }}
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Free AI Model Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
            Filter, inspect, and benchmark models with verified free pricing tiers. Never pay unexpected inference fees.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadModels(true)}
            sx={{ px: 2.5 }}
          >
            Refresh Metadata
          </Button>
          <Button
            variant="contained"
            startIcon={<CompareArrows />}
            onClick={() => navigate('/compare')}
            sx={{ px: 2.5 }}
          >
            Compare Models
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar Controls */}
      <Box className="glass-panel" sx={{ p: 3, mb: 5 }}>
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by model name, architecture, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                label="Provider"
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {providersList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Capability</InputLabel>
              <Select
                value={selectedCapability}
                label="Capability"
                onChange={(e) => setSelectedCapability(e.target.value)}
              >
                <MenuItem value="all">All Capabilities</MenuItem>
                {capabilitiesList.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="popular">Recommended</MenuItem>
                <MenuItem value="context">Context Window (Largest)</MenuItem>
                <MenuItem value="name">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Quick Filter Capability Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5, pt: 2, borderTop: '1px solid var(--surface-border)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', mr: 1 }}>
            Quick filters:
          </Typography>
          {capabilitiesList.map((cap) => {
            const isSelected = selectedCapability === cap;
            return (
              <Chip
                key={cap}
                label={cap}
                size="small"
                onClick={() => setSelectedCapability(isSelected ? 'all' : cap)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#00f0ff' : 'text.secondary',
                  border: isSelected ? '1px solid #00f0ff' : '1px solid var(--surface-border)'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Model Cards Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#00f0ff', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Querying provider endpoints and normalizing catalog...
          </Typography>
        </Box>
      ) : filteredModels.length === 0 ? (
        <Box className="glass-panel" sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No models match your current filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try resetting your search query or selecting "All Providers".
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('all');
              setSelectedCapability('all');
            }}
          >
            Reset Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredModels.map((model) => (
            <Grid item xs={12} sm={6} lg={4} key={model.id}>
              <Card
                className="glass-panel"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#00f0ff',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip
                      label={model.provider}
                      size="small"
                      sx={{
                        backgroundColor:
                          model.providerId === 'flagshiprouter'
                            ? 'rgba(0, 240, 255, 0.12)'
                            : model.providerId === 'ollama'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(139, 92, 246, 0.12)',
                        color:
                          model.providerId === 'flagshiprouter'
                            ? '#00f0ff'
                            : model.providerId === 'ollama'
                            ? '#10b981'
                            : '#a855f7',
                        border: '1px solid var(--surface-border)',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}
                    />
                    <Chip
                      label={
                        model.freeStatus === 'Local inference with no provider inference charge'
                          ? 'Local / Free'
                          : model.freeStatus === 'Verified free hosted inference'
                          ? 'Verified Free'
                          : 'Free Tier'
                      }
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: '0.68rem', height: 22 }}
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '1.15rem',
                      cursor: 'pointer',
                      '&:hover': { color: '#00f0ff' }
                    }}
                    onClick={() => setDetailModalModel(model)}
                  >
                    {model.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2.5,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '4.8em'
                    }}
                  >
                    {model.description}
                  </Typography>

                  {/* Capabilities List */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                    {model.capabilities?.map((cap) => (
                      <Chip
                        key={cap}
                        label={cap}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          fontSize: '0.68rem',
                          height: 20
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'var(--surface-border)' }} />

                  {/* Context and Pricing Specs */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Context Length
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {((model.contextLength || 32768) / 1000).toFixed(0)}k tokens
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Inference Cost
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                        $0.00 / Free
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<ChatOutlined fontSize="small" />}
                    onClick={() => handleStartChat(model.id)}
                  >
                    Start Chat
                  </Button>
                  <Tooltip title="View full specifications">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setDetailModalModel(model)}
                      sx={{ minWidth: 40, px: 1.5 }}
                    >
                      Inspect
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detailed Model Modal */}
      {detailModalModel && (
        <Dialog
          open={Boolean(detailModalModel)}
          onClose={() => setDetailModalModel(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: 'rgba(12, 16, 27, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid #00f0ff'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {detailModalModel.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                ID: {detailModalModel.id}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetailModalModel(null)}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: 'var(--surface-border)' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
              {detailModalModel.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Provider
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00f0ff' }}>
                  {detailModalModel.provider}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Context Window
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {detailModalModel.contextLength?.toLocaleString()} tokens
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Free Verification
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {detailModalModel.freeStatus}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  License
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {detailModalModel.license || 'Open'}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Supported Capabilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {detailModalModel.capabilities?.map((cap) => (
                  <Chip key={cap} label={cap} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </Box>

            {detailModalModel.limits && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Provider Limits: {detailModalModel.limits}
                </Typography>
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}>
            {detailModalModel.providerUrl && (
              <Button
                href={detailModalModel.providerUrl}
                target="_blank"
                rel="noopener"
                startIcon={<Launch />}
                sx={{ color: 'text.secondary' }}
              >
                Official Docs
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<CompareArrows />}
                onClick={() => handleCompareClick(detailModalModel.id)}
              >
                Add to Compare
              </Button>
              <Button
                variant="contained"
                startIcon={<ChatOutlined />}
                onClick={() => {
                  const id = detailModalModel.id;
                  setDetailModalModel(null);
                  handleStartChat(id);
                }}
              >
                Start Chatting
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default ModelExplorer;
