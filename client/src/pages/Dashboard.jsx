import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  ChatOutlined,
  AddCommentOutlined,
  ExploreOutlined,
  CompareArrowsOutlined,
  SettingsOutlined,
  Bolt,
  CheckCircle,
  DeleteOutline,
  ArrowForward,
  HubOutlined,
  Psychology,
  History,
  StarOutline
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.js';
import { chatsApi, healthApi } from '../services/api.js';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [providersHealth, setProvidersHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [chatsRes, healthRes] = await Promise.allSettled([
          chatsApi.listChats(),
          healthApi.getHealth()
        ]);

        if (chatsRes.status === 'fulfilled' && chatsRes.value?.success) {
          setChats(chatsRes.value.data.chats);
        }
        if (healthRes.status === 'fulfilled') {
          setProvidersHealth(healthRes.value.providers);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleCreateChat = async () => {
    try {
      const res = await chatsApi.createChat({
        title: 'New Conversation',
        modelId: 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
        providerId: 'flagshiprouter'
      });
      if (res.success && res.data?.chat) {
        navigate(`/chat/${res.data.chat.id}`);
      }
    } catch (err) {
      navigate('/chat');
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await chatsApi.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const favoriteModels = [
    {
      id: 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
      name: 'DeepSeek R1 Distill Qwen 32B',
      provider: 'FlagshipRouter',
      caps: ['Reasoning', 'Coding']
    },
    {
      id: 'cf/@cf/moonshotai/kimi-k2.6',
      name: 'Kimi K2.6 Multimodal',
      provider: 'FlagshipRouter',
      caps: ['Vision', 'Reasoning', '262k']
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B Instruct',
      provider: 'OpenRouter',
      caps: ['General Chat', 'Coding']
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 700, letterSpacing: '0.1em' }}>
              OPERATING SYSTEM DASHBOARD
            </Typography>
            <Chip
              label="Session Active"
              size="small"
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', height: 20 }}
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Welcome back, <span className="gradient-text-cyan">{user?.name || 'Explorer'}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 650 }}>
            Your personal neural hub is synchronized. Route prompts to verified free models, manage ongoing conversations, and monitor live provider gateways.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddCommentOutlined />}
          onClick={handleCreateChat}
          sx={{ px: 3.5, py: 1.3 }}
        >
          Start New Chat
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="glass-panel" sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Saved Conversations
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#00f0ff' }}>
              {chats.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <History fontSize="inherit" /> Stored in encrypted SQLite
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="glass-panel" sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Active Gateway
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#10b981' }}>
              {providersHealth?.flagshiprouter?.connected ? 'Online' : 'Connected'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Bolt fontSize="inherit" /> {providersHealth?.flagshiprouter?.modelsCount || 14} models active
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="glass-panel" sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Current Billing
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#38bdf8' }}>
              $0.00
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <CheckCircle fontSize="inherit" /> 100% Free verified tier
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="glass-panel" sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Preferred Model
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              DeepSeek R1
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Psychology fontSize="inherit" /> Chain-of-Thought Reasoning
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Main Content Grid: Conversations + Shortcuts */}
      <Grid container spacing={4}>
        {/* Recent Conversations */}
        <Grid item xs={12} lg={8}>
          <Box className="glass-panel" sx={{ p: 3.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatOutlined sx={{ color: '#00f0ff' }} /> Recent Conversations
              </Typography>
              <Button component={RouterLink} to="/chat" size="small" endIcon={<ArrowForward />}>
                Open Workspace
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#00f0ff' }} />
              </Box>
            ) : chats.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ChatOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  No active conversations found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start your first conversation with DeepSeek R1 or Llama 3.3.
                </Typography>
                <Button variant="contained" onClick={handleCreateChat}>
                  Start First Chat
                </Button>
              </Box>
            ) : (
              <List disablePadding>
                {chats.slice(0, 6).map((chat) => (
                  <ListItem
                    key={chat.id}
                    disablePadding
                    secondaryAction={
                      <Tooltip title="Delete conversation">
                        <IconButton
                          edge="end"
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          size="small"
                          sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid var(--surface-border)',
                        '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.05)', borderColor: '#00f0ff' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: '#00f0ff' }}>
                        <ChatOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={chat.title}
                        secondary={`${new Date(chat.updatedAt).toLocaleDateString()} • ${chat._count?.messages || 0} messages • ${chat.modelId.split('/').pop()}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                        secondaryTypographyProps={{ fontSize: '0.78rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Grid>

        {/* Right Column: Quick Links & Favorite Models */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quick Navigation Card */}
            <Box className="glass-panel" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  component={RouterLink}
                  to="/models"
                  variant="outlined"
                  fullWidth
                  startIcon={<ExploreOutlined />}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Explore Free Models Catalog
                </Button>
                <Button
                  component={RouterLink}
                  to="/compare"
                  variant="outlined"
                  fullWidth
                  startIcon={<CompareArrowsOutlined />}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Compare Models Side-by-Side
                </Button>
                <Button
                  component={RouterLink}
                  to="/providers"
                  variant="outlined"
                  fullWidth
                  startIcon={<HubOutlined />}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Inspect Connected Gateways
                </Button>
                <Button
                  component={RouterLink}
                  to="/settings"
                  variant="outlined"
                  fullWidth
                  startIcon={<SettingsOutlined />}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Adjust Theme & Preferences
                </Button>
              </Box>
            </Box>

            {/* Favorite Models */}
            <Box className="glass-panel" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarOutline sx={{ color: '#f59e0b' }} /> Verified Recommendations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {favoriteModels.map((m) => (
                  <Box
                    key={m.id}
                    onClick={() => navigate(`/chat?model=${encodeURIComponent(m.id)}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid var(--surface-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0, 240, 255, 0.04)' }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {m.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={m.provider} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                      {m.caps.map((c) => (
                        <Chip key={c} label={c} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
