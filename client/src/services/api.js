import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add token from memory or localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vups_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async signup(data) {
    const res = await api.post('/api/auth/signup', data);
    if (res.data?.data?.token) {
      localStorage.setItem('vups_token', res.data.data.token);
    }
    return res.data;
  },

  async signin(data) {
    const res = await api.post('/api/auth/signin', data);
    if (res.data?.data?.token) {
      localStorage.setItem('vups_token', res.data.data.token);
    }
    return res.data;
  },

  async logout() {
    localStorage.removeItem('vups_token');
    return (await api.post('/api/auth/logout')).data;
  },

  async getMe() {
    return (await api.get('/api/auth/me')).data;
  },

  async forgotPassword(data) {
    return (await api.post('/api/auth/forgot-password', data)).data;
  },

  async resetPassword(data) {
    return (await api.post('/api/auth/reset-password', data)).data;
  }
};

export const modelsApi = {
  async getModels(params = {}) {
    return (await api.get('/api/models', { params })).data;
  },

  async getModelById(modelId) {
    const encoded = encodeURIComponent(modelId);
    return (await api.get(`/api/models/${encoded}`)).data;
  },

  async getProviders() {
    return (await api.get('/api/providers')).data;
  },

  async getProviderHealth(providerId) {
    return (await api.get(`/api/providers/${providerId}/health`)).data;
  },

  async getAllProvidersHealth() {
    return (await api.get('/api/providers/health/all')).data;
  }
};

export const chatsApi = {
  async listChats(search = '') {
    return (await api.get('/api/chats', { params: { search } })).data;
  },

  async createChat(data) {
    return (await api.post('/api/chats', data)).data;
  },

  async getChat(chatId) {
    return (await api.get(`/api/chats/${chatId}`)).data;
  },

  async updateChat(chatId, data) {
    return (await api.patch(`/api/chats/${chatId}`, data)).data;
  },

  async deleteChat(chatId) {
    return (await api.delete(`/api/chats/${chatId}`)).data;
  },

  async sendChatMessage(payload) {
    return (await api.post('/api/chat', payload)).data;
  },

  streamChat({ model, messages, chatId, temperature, maxTokens, onChunk, onDone, onError, signal }) {
    const token = localStorage.getItem('vups_token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch('/api/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        chatId,
        temperature,
        maxTokens
      }),
      signal
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed === 'data: [DONE]') {
              onDone?.();
              return;
            }
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === 'chunk' && data.delta) {
                  onChunk?.(data.delta);
                } else if (data.type === 'done') {
                  onDone?.(data.fullContent);
                } else if (data.type === 'error') {
                  onError?.(new Error(data.error));
                }
              } catch (e) {
                // partial chunk
              }
            }
          }
        }
        onDone?.();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError?.(err);
        }
      });
  }
};

export const healthApi = {
  async getHealth() {
    return (await api.get('/api/health')).data;
  }
};

export default api;
