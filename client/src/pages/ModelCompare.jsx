import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CompareArrows,
  Close,
  Add,
  ChatOutlined,
  CheckCircle,
  Bolt,
  Launch
} from '@mui/icons-material';
import { modelsApi } from '../services/api.js';

export const ModelCompare = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [allModels, setAllModels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await modelsApi.getModels();
        if (res.success && res.data?.models) {
          setAllModels(res.data.models);

          // Initial selection from query param or top 3 models
          const initialQuery = searchParams.get('models');
          if (initialQuery) {
            const ids = initialQuery.split(',').filter(Boolean);
            setSelectedIds(ids.slice(0, 4));
          } else if (res.data.models.length >= 2) {
            setSelectedIds([
              res.data.models[0].id,
              res.data.models[1].id,
              res.data.models[2]?.id || res.data.models[0].id
            ].filter((v, i, a) => a.indexOf(v) === i));
          }
        }
      } catch (e) {
        console.error('Failed to load models for comparison:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const selectedModels = selectedIds
    .map((id) => allModels.find((m) => m.id === id))
    .filter(Boolean);

  const handleAddModel = (newId) => {
    if (newId && !selectedIds.includes(newId) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, newId]);
    }
  };

  const handleRemoveModel = (idToRemove) => {
    setSelectedIds(selectedIds.filter((id) => id !== idToRemove));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
              SIDE-BY-SIDE EVALUATION
            </Typography>
            <Chip
              label={`${selectedModels.length} of 4 Models Selected`}
              size="small"
              sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', height: 20 }}
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Model Comparison Matrix
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 650 }}>
            Analyze context capacities, verified free status, capabilities, and rate quotas side by side.
          </Typography>
        </Box>

        {/* Model Selector to Add */}
        {selectedIds.length < 4 && (
          <Box sx={{ minWidth: 260 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Add Model to Compare</InputLabel>
              <Select
                value=""
                label="Add Model to Compare"
                onChange={(e) => handleAddModel(e.target.value)}
              >
                {allModels
                  .filter((m) => !selectedIds.includes(m.id))
                  .map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#00f0ff' }} />
        </Box>
      ) : selectedModels.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Please select at least one model from the dropdown above to display comparison metrics.
        </Alert>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ overflowX: 'auto', borderRadius: 3 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
                <TableCell sx={{ width: '22%', fontWeight: 700, color: 'text.secondary' }}>
                  Metric / Attribute
                </TableCell>
                {selectedModels.map((model) => (
                  <TableCell key={model.id} sx={{ width: `${78 / selectedModels.length}%`, verticalAlign: 'top' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={model.provider}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0, 240, 255, 0.12)',
                          color: '#00f0ff',
                          fontWeight: 700,
                          fontSize: '0.68rem'
                        }}
                      />
                      {selectedModels.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveModel(model.id)}
                          sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                      {model.name}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<ChatOutlined fontSize="small" />}
                      onClick={() => navigate(`/chat?model=${encodeURIComponent(model.id)}`)}
                      sx={{ py: 0.8 }}
                    >
                      Chat Now
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Free Status */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#00f0ff' }}>Free Status</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Chip
                      label={m.freeStatus}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Context Length */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Context Window</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      {m.contextLength?.toLocaleString()} tokens
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Approx. {((m.contextLength || 0) * 0.75).toLocaleString()} words
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Capabilities */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Capabilities</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {m.capabilities?.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          size="small"
                          sx={{ fontSize: '0.68rem', height: 20, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>

              {/* Input / Output Modalities */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Modalities</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Typography variant="body2">
                      In: {m.inputModalities?.join(', ') || 'text'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Out: {m.outputModalities?.join(', ') || 'text'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Provider Limits & Quotas */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Published Limits</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Typography variant="caption" sx={{ lineHeight: 1.5, display: 'block', color: 'text.secondary' }}>
                      {m.limits || 'Standard community tier limits apply'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* License */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Typography variant="body2" color="text.secondary">
                      {m.license || 'Open Weights / Provider Terms'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Hosting Type */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Deployment</TableCell>
                {selectedModels.map((m) => (
                  <TableCell key={m.id}>
                    <Chip
                      label={m.isHosted ? 'Cloud Hosted' : 'Local Instance'}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        bgcolor: m.isHosted ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: m.isHosted ? '#38bdf8' : '#10b981'
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ModelCompare;
