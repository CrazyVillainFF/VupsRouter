import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { FREE_STATUS, CAPABILITIES } from '../utils/modelCatalog.js';
import { logger } from '../utils/logger.js';

export class GoogleAIProvider extends BaseProvider {
  constructor(apiKey) {
    super('Google AI', 'google-ai', { apiKey });
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured() {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 0);
  }

  async healthCheck() {
    if (!this.isConfigured()) {
      return {
        id: this.id,
        name: this.name,
        connected: false,
        configured: false,
        message: 'GOOGLE_AI_API_KEY is not configured in server/.env'
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models?key=${this.config.apiKey}`, {
        timeout: 8000
      });
      return {
        id: this.id,
        name: this.name,
        connected: true,
        configured: true,
        message: 'Connected to Google AI Gemini API',
        modelsCount: response.data?.models?.length || 0
      };
    } catch (err) {
      logger.warn('Google AI health check failed:', err.message);
      return {
        id: this.id,
        name: this.name,
        connected: false,
        configured: true,
        message: err.response?.data?.error?.message || err.message
      };
    }
  }

  async listModels() {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models?key=${this.config.apiKey}`, {
        timeout: 10000
      });

      const raw = response.data?.models || [];
      return raw
        .filter((m) => m.name.includes('gemini'))
        .map((m) => this.normalizeModel(m));
    } catch (err) {
      logger.warn('Failed to fetch live Google AI models:', err.message);
      return [];
    }
  }

  normalizeModel(raw) {
    const rawId = raw.name.replace('models/', '');
    const isFlash = rawId.includes('flash');
    return {
      id: `google-ai/${rawId}`,
      name: raw.displayName || rawId,
      provider: 'Google AI',
      providerId: this.id,
      description: raw.description || 'Google Gemini high-efficiency multimodal model.',
      contextLength: raw.inputTokenLimit || 1048576,
      inputModalities: ['text', 'image', 'audio'],
      outputModalities: ['text'],
      capabilities: [
        CAPABILITIES.GENERAL_CHAT,
        CAPABILITIES.VISION,
        CAPABILITIES.AUDIO_SPEECH,
        CAPABILITIES.MULTIMODAL,
        CAPABILITIES.CODING,
        CAPABILITIES.TOOL_CALLING
      ],
      inputPrice: 0,
      outputPrice: 0,
      freeStatus: isFlash ? FREE_STATUS.FREE_TIER_LIMITS : FREE_STATUS.PAID,
      license: 'Google AI Terms of Service',
      providerUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
      lastVerifiedAt: new Date().toISOString(),
      availabilityStatus: 'online',
      isHosted: true,
      limits: '15 RPM / 1,500 RPD on free-tier API keys'
    };
  }

  formatMessagesForGemini(messages) {
    // Map OpenAI format {role, content} to Gemini {role: 'user'|'model', parts: [{text}]}
    const contents = [];
    let systemInstruction = null;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    return { contents, systemInstruction };
  }

  async chat({ model, messages, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isConfigured()) {
      throw new Error('GOOGLE_AI_API_KEY is not configured on the server. Please add your key to server/.env');
    }

    const cleanModel = model.replace('google-ai/', '');
    const { contents, systemInstruction } = this.formatMessagesForGemini(messages);

    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };
    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    const response = await axios.post(
      `${this.baseUrl}/models/${cleanModel}:generateContent?key=${this.config.apiKey}`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text).join('') || '';

    return {
      content: text,
      model,
      finishReason: candidate?.finishReason || 'STOP',
      usage: response.data?.usageMetadata
    };
  }

  async chatStream({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, onDone, onError }) {
    if (!this.isConfigured()) {
      onError(new Error('GOOGLE_AI_API_KEY is not configured on the server. Please add your key to server/.env'));
      return;
    }

    try {
      const cleanModel = model.replace('google-ai/', '');
      const { contents, systemInstruction } = this.formatMessagesForGemini(messages);

      const body = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };
      if (systemInstruction) {
        body.systemInstruction = systemInstruction;
      }

      const response = await axios.post(
        `${this.baseUrl}/models/${cleanModel}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`,
        body,
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'stream',
          timeout: 60000
        }
      );

      let buffer = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const part = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (part) {
                onChunk(part);
              }
            } catch (err) {
              // ignore partial line JSON
            }
          }
        }
      });

      response.data.on('end', () => {
        onDone();
      });

      response.data.on('error', (err) => {
        onError(err);
      });
    } catch (err) {
      onError(err);
    }
  }
}
