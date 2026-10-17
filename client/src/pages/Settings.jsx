import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Speed,
  DeleteOutline,
  Person,
  CheckCircle,
  Security
} from '@mui/icons-material';
import { useAppTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';

export const Settings = () => {
  const { mode, isDark, toggleTheme, reducedMotion, toggleReducedMotion } = useAppTheme();
  const { user } = useAuth();

  const [defaultModel, setDefaultModel] = useState(
    localStorage.getItem('vups_default_model') || 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'
  );
  const [defaultProvider, setDefaultProvider] = useState(
    localStorage.getItem('vups_default_provider') || 'flagshiprouter'
  );
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSaveDefaults = () => {
    localStorage.setItem('vups_default_model', defaultModel);
    localStorage.setItem('vups_default_provider', defaultProvider);
    setNotice('Preferences updated successfully.');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('vups_token');
    setClearDialogOpen(false);
    setNotice('Local session cache cleared.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
          SYSTEM PREFERENCES
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Settings & Identity
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Customize your visual interface, 3D render intensity, default routing targets, and session security.
        </Typography>
      </Box>

      {notice && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Appearance & 3D Motion */}
        <Grid item xs={12} md={6}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Visual Appearance & Motion
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control the futuristic dark theme and WebGL 3D rendering animations.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Color Palette
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isDark ? 'Dark Cinematic OS (Default)' : 'High-Contrast Light'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleTheme}
                  startIcon={isDark ? <LightMode /> : <DarkMode />}
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </Box>

              <Divider sx={{ borderColor: 'var(--surface-border)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ pr: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Reduced Motion & Low Power
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Replaces Three.js particle scenes with lightweight CSS holograms.
                  </Typography>
                </Box>
                <Switch checked={reducedMotion} onChange={toggleReducedMotion} color="primary" />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Default Model & Routing */}
        <Grid item xs={12} md={6}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Default AI Routing Target
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the initial model that loads when initializing new chats.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Default Provider</InputLabel>
                <Select
                  value={defaultProvider}
                  label="Default Provider"
                  onChange={(e) => setDefaultProvider(e.target.value)}
                >
                  <MenuItem value="flagshiprouter">FlagshipRouter (Local Gateway)</MenuItem>
                  <MenuItem value="openrouter">OpenRouter (Hosted Free Tier)</MenuItem>
                  <MenuItem value="google-ai">Google AI Studio (Gemini Flash)</MenuItem>
                  <MenuItem value="ollama">Ollama (100% Offline Local)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Default Model</InputLabel>
                <Select
                  value={defaultModel}
                  label="Default Model"
                  onChange={(e) => setDefaultModel(e.target.value)}
                >
                  <MenuItem value="cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b">
                    DeepSeek R1 Distill Qwen 32B (Flagship)
                  </MenuItem>
                  <MenuItem value="cf/@cf/moonshotai/kimi-k2.6">
                    Kimi K2.6 Multimodal (Flagship)
                  </MenuItem>
                  <MenuItem value="meta-llama/llama-3.3-70b-instruct:free">
                    Llama 3.3 70B Instruct (OpenRouter Free)
                  </MenuItem>
                  <MenuItem value="google-ai/gemini-1.5-flash">
                    Gemini 1.5 Flash (Google AI)
                  </MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" onClick={handleSaveDefaults} sx={{ alignSelf: 'flex-start', mt: 1 }}>
                Save Defaults
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* User Account & Security */}
        {user && (
          <Grid item xs={12} md={6}>
            <Box className="glass-panel" sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ color: '#00f0ff' }} /> Account Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Authenticated session tied to your personal database profile.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Chip label={user.role || 'user'} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Data & Privacy */}
        <Grid item xs={12} md={user ? 6 : 12}>
          <Box className="glass-panel" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ color: '#10b981' }} /> Privacy & Session Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              VupsRouter does not log prompts or sensitive credentials. All private keys remain on the backend.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Browser local storage holds only client theme preferences and user session tokens. No third-party tracking scripts are loaded.
              </Alert>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() => setClearDialogOpen(true)}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Clear Local Session Cache
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Session Cache?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will remove locally cached tokens and preferences. You will need to sign in again to access saved conversations.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Clear Cache
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
