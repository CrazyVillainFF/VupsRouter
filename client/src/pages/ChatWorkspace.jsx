import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Avatar,
  Divider,
  Drawer,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Send,
  Stop,
  Add,
  DeleteOutline,
  EditOutlined,
  ContentCopy,
  Check,
  Refresh,
  Menu as MenuIcon,
  Search,
  ChatOutlined,
  Close,
  Close as CloseIcon,
  Psychology,
  Code as CodeIcon,
  Visibility,
  Hub,
  Bolt,
  ErrorOutline,
  LockOutlined
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext.js';
import { chatsApi, modelsApi } from '../services/api.js';

// Code Block with Copy Action
function CodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <Box sx={{ position: 'relative', my: 1.5, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)'
          }}
        >
          <Typography variant="caption" sx={{ color: '#00f0ff', fontFamily: 'monospace', fontWeight: 600 }}>
            {match[1].toUpperCase()}
          </Typography>
          <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary', p: 0.5 }}>
            {copied ? <Check fontSize="inherit" sx={{ color: '#10b981' }} /> : <ContentCopy fontSize="inherit" />}
          </IconButton>
        </Box>
        <pre style={{ margin: 0 }}>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </Box>
    );
  }

  return (
    <code
      style={{
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: '#38bdf8',
        fontFamily: 'monospace',
        fontSize: '0.88em'
      }}
      {...props}
    >
      {children}
    </code>
  );
}

export const ChatWorkspace = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingDelta, setStreamingDelta] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(
    searchParams.get('model') || 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'
  );
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [chatSearch, setChatSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Rename Dialog State
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingDelta]);

  // Load available models
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await modelsApi.getModels();
        if (res.success && res.data?.models) {
          setAvailableModels(res.data.models);
        }
      } catch (e) {
        console.error('Failed to load models list:', e);
      }
    }
    loadModels();
  }, []);

  // Load chats list if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChatsList();
    }
  }, [isAuthenticated]);

  async function loadChatsList() {
    try {
      const res = await chatsApi.listChats(chatSearch);
      if (res.success) {
        setChats(res.data.chats);
      }
    } catch (e) {
      console.error('Failed to load chats:', e);
    }
  }

  // Load active conversation
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      loadSpecificChat(conversationId);
    } else if (!conversationId) {
      setActiveChat(null);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${user?.name || 'there'}! I am **VupsRouter**, your unified neural gateway.\n\nI am currently routed to **${selectedModel.split('/').pop()}**. You can ask me to write code, solve mathematical reasoning problems, explain concepts, or query models across **FlagshipRouter**, **OpenRouter**, or local **Ollama**.\n\nHow can I assist you today?`,
          modelId: selectedModel,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [conversationId, isAuthenticated]);

  async function loadSpecificChat(id) {
    try {
      const res = await chatsApi.getChat(id);
      if (res.success && res.data?.chat) {
        setActiveChat(res.data.chat);
        setSelectedModel(res.data.chat.modelId);
        setMessages(res.data.chat.messages || []);
      }
    } catch (err) {
      setErrorMsg('Could not load conversation: ' + (err.response?.data?.error?.message || err.message));
    }
  }

  const handleStartNewChat = async () => {
    if (isAuthenticated) {
      try {
        const res = await chatsApi.createChat({
          title: 'New Conversation',
          modelId: selectedModel,
          providerId: selectedModel.startsWith('cf/') ? 'flagshiprouter' : 'openrouter'
        });
        if (res.success && res.data?.chat) {
          await loadChatsList();
          navigate(`/chat/${res.data.chat.id}`);
        }
      } catch (e) {
        navigate('/chat');
      }
    } else {
      navigate('/chat');
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `New session initialized with **${selectedModel.split('/').pop()}**. Type your prompt below to test this model!`,
          modelId: selectedModel,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isStreaming) return;
    setErrorMsg('');

    const userText = inputPrompt.trim();
    setInputPrompt('');

    const newMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);

    // Prepare assistant placeholder and stream
    setIsStreaming(true);
    setStreamingDelta('');
    abortControllerRef.current = new AbortController();

    const currentModel = selectedModel;

    chatsApi.streamChat({
      model: currentModel,
      messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
      chatId: activeChat?.id,
      signal: abortControllerRef.current.signal,
      onChunk: (delta) => {
        setStreamingDelta((prev) => prev + delta);
      },
      onDone: (fullContent) => {
        setIsStreaming(false);
        const finalContent = fullContent || streamingDelta;
        setMessages((prev) => [
          ...prev,
          {
            id: `ast-${Date.now()}`,
            role: 'assistant',
            content: finalContent,
            modelId: currentModel,
            createdAt: new Date().toISOString()
          }
        ]);
        setStreamingDelta('');
        if (isAuthenticated) {
          loadChatsList();
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setErrorMsg('Inference Error: ' + err.message);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `**Provider Error:** ${err.message}\n\nPlease check provider connection in [Providers Settings](/providers) or select a different model.`,
            isError: true,
            modelId: currentModel,
            createdAt: new Date().toISOString()
          }
        ]);
        setStreamingDelta('');
      }
    });
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      if (streamingDelta) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ast-${Date.now()}`,
            role: 'assistant',
            content: streamingDelta,
            modelId: selectedModel,
            createdAt: new Date().toISOString()
          }
        ]);
        setStreamingDelta('');
      }
    }
  };

  const handleCopyMessage = (index, content) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openRenameModal = (chat, e) => {
    e.stopPropagation();
    setChatToRename(chat);
    setNewChatTitle(chat.title);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (chatToRename && newChatTitle.trim()) {
      try {
        await chatsApi.updateChat(chatToRename.id, { title: newChatTitle.trim() });
        setRenameDialogOpen(false);
        await loadChatsList();
        if (activeChat?.id === chatToRename.id) {
          setActiveChat((prev) => ({ ...prev, title: newChatTitle.trim() }));
        }
      } catch (err) {
        console.error('Failed to rename chat:', err);
      }
    }
  };

  const handleDeleteChatConfirm = async (chatId, e) => {
    e.stopPropagation();
    try {
      await chatsApi.deleteChat(chatId);
      await loadChatsList();
      if (activeChat?.id === chatId) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      {/* Sidebar: Conversation History */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            backgroundColor: 'rgba(10, 14, 24, 0.95)',
            borderRight: '1px solid var(--surface-border)'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Add />}
              onClick={handleStartNewChat}
              sx={{ py: 1.1, fontWeight: 700 }}
            >
              New Chat
            </Button>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Search Chats */}
          {isAuthenticated && (
            <TextField
              size="small"
              placeholder="Search conversations..."
              value={chatSearch}
              onChange={(e) => {
                setChatSearch(e.target.value);
                loadChatsList();
              }}
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{ mb: 2 }}
            />
          )}

          {/* Chat List */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {!isAuthenticated ? (
              <Box className="glass-panel" sx={{ p: 2.5, textAlign: 'center', my: 2 }}>
                <LockOutlined sx={{ fontSize: 32, color: '#00f0ff', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Guest Session
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Sign in to save and sync your conversations securely in the database.
                </Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
              </Box>
            ) : chats.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">No conversations yet.</Typography>
              </Box>
            ) : (
              chats.map((c) => {
                const isSelected = activeChat?.id === c.id;
                return (
                  <Box
                    key={c.id}
                    onClick={() => {
                      navigate(`/chat/${c.id}`);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? '#00f0ff' : 'var(--surface-border)'}`,
                      backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.05)'
                      }
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', mr: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={(e) => openRenameModal(c, e)} sx={{ p: 0.5 }}>
                        <EditOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteChatConfirm(c.id, e)}
                        sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                      >
                        <DeleteOutline sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Main Chat Interface */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {/* Workspace Top Bar */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: '1px solid var(--surface-border)',
            backgroundColor: 'rgba(10, 14, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            zIndex: 10
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small">
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {activeChat ? activeChat.title : 'Live AI Workspace'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeChat ? 'Saved conversation' : 'Transient / Free Gateway'}
              </Typography>
            </Box>
          </Box>

          {/* Model Selector Dropdown */}
          <Box sx={{ minWidth: { xs: 180, sm: 300 } }}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                sx={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: 2,
                  fontSize: '0.85rem'
                }}
              >
                {availableModels.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {m.name}
                      </Typography>
                      <Chip
                        label={m.provider}
                        size="small"
                        sx={{ height: 18, fontSize: '0.62rem', backgroundColor: 'rgba(0, 240, 255, 0.12)', color: '#00f0ff' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Message Stream Area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <Box
                key={msg.id || index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  maxWidth: '900px',
                  width: '100%',
                  mx: 'auto',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: isUser ? '#6366f1' : '#00f0ff',
                    color: isUser ? '#ffffff' : '#07080e',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                >
                  {isUser ? user?.name?.charAt(0).toUpperCase() || 'U' : <Bolt fontSize="small" />}
                </Avatar>

                {/* Message Bubble */}
                <Box sx={{ maxWidth: '82%', width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: isUser ? '#a5b4fc' : '#00f0ff' }}>
                      {isUser ? 'You' : msg.modelId?.split('/').pop() || 'VupsRouter Assistant'}
                    </Typography>
                    {msg.createdAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    className={isUser ? '' : 'glass-panel'}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : undefined,
                      border: isUser ? '1px solid rgba(99, 102, 241, 0.4)' : undefined,
                      bgcolor: isUser ? '#4f46e5' : undefined,
                      color: isUser ? '#ffffff' : 'text.primary',
                      boxShadow: isUser ? '0 4px 14px rgba(79, 70, 229, 0.25)' : undefined
                    }}
                  >
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: CodeBlock
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Message Actions */}
                    {!isUser && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5, pt: 1, borderTop: '1px solid var(--surface-border)' }}>
                        <Tooltip title={copiedIndex === index ? 'Copied!' : 'Copy response'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyMessage(index, msg.content)}
                            sx={{ color: 'text.secondary', p: 0.5 }}
                          >
                            {copiedIndex === index ? <Check fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Active Streaming Chunk Display */}
          {isStreaming && (
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '900px', width: '100%', mx: 'auto' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#00f0ff', color: '#07080e' }}>
                <Bolt fontSize="small" />
              </Avatar>
              <Box sx={{ maxWidth: '82%', width: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00f0ff', mb: 0.5, display: 'block' }}>
                  {selectedModel.split('/').pop()} • Generating tokens...
                </Typography>
                <Box className="glass-panel" sx={{ p: 2.5, borderRadius: 3 }}>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                      {streamingDelta || '...'}
                    </ReactMarkdown>
                  </div>
                </Box>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input Composer */}
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderTop: '1px solid var(--surface-border)',
            backgroundColor: 'rgba(10, 14, 24, 0.95)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <Box sx={{ maxWidth: '900px', mx: 'auto', position: 'relative' }}>
            <TextField
              placeholder={`Message ${selectedModel.split('/').pop()}... (Press Enter to send, Shift+Enter for newline)`}
              multiline
              minRows={2}
              maxRows={8}
              fullWidth
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              sx={{
                '& .MuiOutlinedInput-root': {
                  pr: 10,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: 3
                }
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {isStreaming ? (
                <Tooltip title="Stop generation">
                  <IconButton
                    onClick={handleStopStream}
                    sx={{
                      bgcolor: '#ef4444',
                      color: '#ffffff',
                      '&:hover': { bgcolor: '#dc2626' }
                    }}
                  >
                    <Stop />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Send message (Enter)">
                  <span>
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!inputPrompt.trim()}
                      sx={{
                        bgcolor: inputPrompt.trim() ? '#00f0ff' : 'rgba(255, 255, 255, 0.08)',
                        color: inputPrompt.trim() ? '#07080e' : 'text.disabled',
                        '&:hover': { bgcolor: '#38bdf8' }
                      }}
                    >
                      <Send />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Rename Chat Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            fullWidth
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWorkspace;
