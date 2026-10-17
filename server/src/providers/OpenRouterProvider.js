import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { FREE_STATUS, CAPABILITIES } from '../utils/modelCatalog.js';
import { logger } from '../utils/logger.js';

export class OpenRouterProvider extends BaseProvider {
  constructor(apiKey) {
    super('OpenRouter', 'openrouter', { apiKey });
    this.baseUrl = 'https://openrouter.ai/api/v1';
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
        message: 'OPENROUTER_API_KEY is not configured in server/.env'
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/auth/key`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        },
        timeout: 8000
      });
      return {
        id: this.id,
        name: this.name,
        connected: true,
        configured: true,
        data: response.data.data,
        message: 'Connected to OpenRouter API'
      };
    } catch (err) {
      logger.warn('OpenRouter health check failed:', err.message);
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
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: this.isConfigured() ? { Authorization: `Bearer ${this.config.apiKey}` } : {},
        timeout: 10000
      });

      const rawModels = response.data?.data || [];
      return rawModels
        .filter((m) => {
          const isFreePrice = m.pricing && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0;
          const isFreeSuffix = m.id.endsWith(':free');
          return isFreePrice || isFreeSuffix;
        })
        .map((m) => this.normalizeModel(m));
    } catch (err) {
      logger.warn('Could not fetch dynamic models from OpenRouter:', err.message);
      return [];
    }
  }

  normalizeModel(raw) {
    const isFree = (raw.pricing && Number(raw.pricing.prompt) === 0 && Number(raw.pricing.completion) === 0) || raw.id.endsWith(':free');
    const capabilities = [CAPABILITIES.GENERAL_CHAT];

    const desc = (raw.description || '').toLowerCase();
    const name = (raw.name || '').toLowerCase();
    const id = raw.id.toLowerCase();

    if (desc.includes('reason') || desc.includes('think') || id.includes('r1') || id.includes('reasoning')) {
      capabilities.push(CAPABILITIES.REASONING);
    }
    if (desc.includes('code') || desc.includes('programming') || id.includes('coder') || name.includes('coder')) {
      capabilities.push(CAPABILITIES.CODING);
    }
    if (raw.architecture?.modality?.includes('image') || desc.includes('vision') || desc.includes('multimodal')) {
      capabilities.push(CAPABILITIES.VISION, CAPABILITIES.MULTIMODAL);
    }

    return {
      id: raw.id,
      name: raw.name || raw.id.split('/').pop(),
      provider: 'OpenRouter',
      providerId: this.id,
      description: raw.description || 'OpenRouter high-performance hosted model.',
      contextLength: raw.context_length || 32768,
      inputModalities: raw.architecture?.modality?.includes('image') ? ['text', 'image'] : ['text'],
      outputModalities: ['text'],
      capabilities: Array.from(new Set(capabilities)),
      inputPrice: raw.pricing ? Number(raw.pricing.prompt) : 0,
      outputPrice: raw.pricing ? Number(raw.pricing.completion) : 0,
      freeStatus: isFree ? FREE_STATUS.VERIFIED_FREE_HOSTED : FREE_STATUS.PAID,
      license: raw.license || 'Open Weights',
      providerUrl: `https://openrouter.ai/${raw.id}`,
      lastVerifiedAt: new Date().toISOString(),
      availabilityStatus: 'online',
      isHosted: true,
      limits: 'Community free router limits apply'
    };
  }

  async chat({ model, messages, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isConfigured()) {
      throw new Error('OPENROUTER_API_KEY is not configured on the server. Please add your API key to server/.env');
    }

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://vupsrouter.ai',
        'X-Title': 'VupsRouter AI Hub',
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const choice = response.data?.choices?.[0];
    return {
      content: choice?.message?.content || '',
      model: response.data?.model || model,
      finishReason: choice?.finish_reason || 'stop',
      usage: response.data?.usage
    };
  }

  async chatStream({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, onDone, onError }) {
    if (!this.isConfigured()) {
      onError(new Error('OPENROUTER_API_KEY is not configured on the server. Please add your key to server/.env'));
      return;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://vupsrouter.ai',
            'X-Title': 'VupsRouter AI Hub',
            'Content-Type': 'application/json'
          },
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
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            onDone();
            return;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices?.[0]?.delta?.content || '';
              if (delta) {
                onChunk(delta);
              }
            } catch (err) {
              // ignore json parse chunk edge
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
