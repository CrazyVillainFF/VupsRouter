import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ChatOutlined,
  ExploreOutlined,
  Bolt,
  Speed,
  Psychology,
  Code,
  Visibility,
  Security,
  Hub,
  ArrowForward,
  CheckCircle,
  AutoAwesome,
  Memory
} from '@mui/icons-material';
import { SplitText } from '../components/animations/SplitText.jsx';
import { AICoreScene } from '../components/3d/AICoreScene.jsx';
import { useAuth } from '../context/AuthContext.js';
import { useAppTheme } from '../context/ThemeContext.js';
import { modelsApi, healthApi } from '../services/api.js';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const { reducedMotion } = useAppTheme();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelsRes, healthRes] = await Promise.allSettled([
          modelsApi.getModels({ freeOnly: 'true' }),
          healthApi.getHealth()
        ]);

        if (modelsRes.status === 'fulfilled' && modelsRes.value?.success) {
          setModels(modelsRes.value.data.models.slice(0, 6));
        }
        if (healthRes.status === 'fulfilled') {
          setHealthData(healthRes.value);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoadingModels(false);
      }
    }
    loadData();
  }, []);

  const handleStartChatting = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/models');
    }
  };

  const capabilities = [
    {
      title: 'Advanced Reasoning',
      desc: 'Deep chain-of-thought processing and mathematical logic with DeepSeek R1 and QwQ models.',
      icon: <Psychology sx={{ fontSize: 28, color: '#00f0ff' }} />
    },
    {
      title: 'High-Velocity Coding',
      desc: 'Synthesize algorithms, debug syntax, and scaffold complex architectures with Qwen Coder and Llama 3.3.',
      icon: <Code sx={{ fontSize: 28, color: '#8b5cf6' }} />
    },
    {
      title: 'Multimodal & Vision',
      desc: 'Analyze graphics, diagrams, and high-resolution visual inputs with Kimi K2.6 and Gemini Flash.',
      icon: <Visibility sx={{ fontSize: 28, color: '#38bdf8' }} />
    },
    {
      title: 'Zero-Cost Routing',
      desc: 'Intelligently directs prompts to 100% verified free tiers and local instances without unexpected costs.',
      icon: <Bolt sx={{ fontSize: 28, color: '#f59e0b' }} />
    },
    {
      title: 'Hardware Privacy',
      desc: 'Support for local offline Ollama models keeps proprietary code and data strictly on your device.',
      icon: <Security sx={{ fontSize: 28, color: '#10b981' }} />
    },
    {
      title: 'Sub-Second Latency',
      desc: 'Optimized SSE streaming infrastructure delivers real-time token generation straight from high-speed gateways.',
      icon: <Speed sx={{ fontSize: 28, color: '#ec4899' }} />
    }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} lg={7}>
            <Box sx={{ mb: 3, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<AutoAwesome sx={{ fontSize: 16, color: '#00f0ff' }} />}
                label="Next-Gen AI Routing System"
                sx={{
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: '#00f0ff',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  fontWeight: 600,
                  px: 1,
                  py: 0.5
                }}
              />
              <Chip
                label="FlagshipRouter Connected"
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600
                }}
              />
            </Box>

            {/* SplitText Headline */}
            <Box sx={{ mb: 3 }}>
              <SplitText
                text="Every AI. One Intelligent Router."
                tag="h1"
                className="gradient-text-cyan"
                textAlign="left"
                delay={35}
                duration={0.65}
                reducedMotion={reducedMotion}
              />
            </Box>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 620,
                mb: 4,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 400
              }}
            >
              Discover, compare, and unleash state-of-the-art free AI models through one cinematic workspace. Switch seamlessly between private gateways, open-source weights, and hosted free tiers without API complexity.
            </Typography>

            {/* Hero Action CTAs */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartChatting}
                endIcon={<ArrowForward />}
                sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
              >
                {isAuthenticated ? 'Open AI Workspace' : 'Start Chatting'}
              </Button>
              <Button
                component={RouterLink}
                to="/models"
                variant="outlined"
                size="large"
                startIcon={<ExploreOutlined />}
                sx={{ px: 3.5, py: 1.5, fontSize: '1rem' }}
              >
                Explore Free Models
              </Button>
              {!isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="text"
                  size="large"
                  sx={{ color: 'text.secondary', px: 2 }}
                >
                  Sign In
                </Button>
              )}
            </Box>

            {/* Real Gateway Live Stats Banner */}
            <Box
              className="glass-card"
              sx={{
                p: 2.5,
                maxWidth: 580,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 10px #10b981'
                  }}
                />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Active Router Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {healthData?.providers?.flagshiprouter?.connected
                      ? 'Flagship Gateway & Ollama Online'
                      : 'Gateway Online'}
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Verified Free Models
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#00f0ff' }}>
                  {models.length > 0 ? `${models.length}+ Verified Ready` : '14+ Active Live'}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Inference Cost
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                  $0.00 / Verified
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Interactive 3D AI Core Scene */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: 360, lg: 520 } }}>
              <AICoreScene reducedMotion={reducedMotion} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Free AI Models Section */}
      <Box sx={{ py: 10, borderTop: '1px solid var(--surface-border)', backgroundColor: 'rgba(10, 14, 24, 0.4)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
                LIVE DISCOVERY
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Featured Free AI Models
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                Real models dynamically verified from configured providers. Click any model to start chatting immediately.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/models"
              endIcon={<ArrowForward />}
              sx={{ color: '#00f0ff', fontWeight: 600 }}
            >
              View All Models ({models.length || 'All'})
            </Button>
          </Box>

          {loadingModels ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#00f0ff' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {models.map((model) => (
                <Grid item xs={12} sm={6} lg={4} key={model.id}>
                  <Card
                    className="glass-panel"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 1.5,
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/chat?model=${encodeURIComponent(model.id)}`)}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Chip
                          label={model.provider}
                          size="small"
                          sx={{
                            backgroundColor: model.providerId === 'flagshiprouter' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                            color: model.providerId === 'flagshiprouter' ? '#00f0ff' : '#a855f7',
                            border: `1px solid ${model.providerId === 'flagshiprouter' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        />
                        <Chip
                          label={model.freeStatus === 'Verified free hosted inference' ? 'Verified Free' : 'Free Tier'}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
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

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                        {model.capabilities.map((cap) => (
                          <Chip
                            key={cap}
                            label={cap}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.68rem',
                              height: 20
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Context: {((model.contextLength || 32768) / 1000).toFixed(0)}k tokens
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        sx={{ color: '#00f0ff', fontWeight: 600, p: 0 }}
                      >
                        Launch
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Platform Capabilities Grid */}
      <Container maxWidth="xl" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
            ENGINEERED FOR SUPREMACY
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
            One Architecture. Boundless Intelligence.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto', mt: 2 }}>
            Whether performing complex chain-of-thought analysis, executing code, or inspecting multimodal visual files, VupsRouter handles token distribution with zero friction.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {capabilities.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Box
                className="glass-panel"
                sx={{
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ py: 10, borderTop: '1px solid var(--surface-border)', backgroundColor: 'rgba(7, 8, 14, 0.6)' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
              Universal AI Routing in Three Steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Live Catalog Discovery',
                desc: 'VupsRouter continuously pings live providers (FlagshipRouter, OpenRouter, Ollama) and normalizes context windows, modalities, and verified free status.'
              },
              {
                step: '02',
                title: 'Select Model & Capabilities',
                desc: 'Choose your desired model based on genuine benchmarks, task needs (reasoning, coding, vision), and verified pricing tiers.'
              },
              {
                step: '03',
                title: 'Instant Streaming AI Workspace',
                desc: 'Chat directly in our futuristic workspace. All API keys remain isolated on the Express server. Conversations persist securely in your account.'
              }
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  className="glass-panel"
                  sx={{
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: 'rgba(0, 240, 255, 0.15)',
                      position: 'absolute',
                      top: 12,
                      right: 18,
                      fontFamily: 'Outfit, sans-serif'
                    }}
                  >
                    {s.step}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, position: 'relative' }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, position: 'relative' }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Prominent Call to Action */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box
          className="glass-panel"
          sx={{
            p: { xs: 5, md: 8 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 0 60px rgba(0, 240, 255, 0.15)'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Ready to Experience the Unified AI OS?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
            Join thousands of developers and creators discovering free, high-performance artificial intelligence across FlagshipRouter, OpenRouter, and Ollama.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartChatting}
              endIcon={<ArrowForward />}
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Start Free Chatting
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
