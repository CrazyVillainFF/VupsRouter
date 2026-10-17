import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { FREE_STATUS, CAPABILITIES } from '../utils/modelCatalog.js';
import { logger } from '../utils/logger.js';

export class FlagshipRouterProvider extends BaseProvider {
  constructor(baseUrl = 'http://localhost:20128/v1', apiKey = '') {
    super('FlagshipRouter', 'flagshiprouter', { baseUrl, apiKey });
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
        message: 'FLAGSHIPROUTER_API_KEY is not configured in server/.env'
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        },
        timeout: 5000
      });

      const modelsCount = response.data?.data?.length || 0;
      return {
        id: this.id,
        name: this.name,
        connected: true,
        configured: true,
        modelsCount,
        endpoint: this.baseUrl,
        message: `Connected to FlagshipRouter at ${this.baseUrl} (${modelsCount} models active)`
      };
    } catch (err) {
      logger.warn('FlagshipRouter health check failed:', err.message);
      return {
        id: this.id,
        name: this.name,
        connected: false,
        configured: true,
        endpoint: this.baseUrl,
        message: err.code === 'ECONNREFUSED'
          ? `Connection refused at ${this.baseUrl}. Ensure FlagshipRouter gateway is running.`
          : (err.response?.data?.error?.message || err.message)
      };
    }
  }

  async listModels() {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        },
        timeout: 8000
      });

      const rawModels = response.data?.data || [];
      return rawModels.map((m) => this.normalizeModel(m));
    } catch (err) {
      logger.warn('Failed to fetch models from FlagshipRouter:', err.message);
      return [];
    }
  }

  normalizeModel(raw) {
    const rawId = raw.id;
    // Friendly name parsing: "cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" -> "DeepSeek R1 Distill Qwen 32B"
    const parts = rawId.split('/');
    const lastPart = parts[parts.length - 1];
    const friendlyName = lastPart
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const caps = [CAPABILITIES.GENERAL_CHAT];
    const rawCaps = raw.capabilities || {};

    if (rawCaps.reasoning || rawId.includes('r1') || rawId.includes('qwq') || rawId.includes('reason')) {
      caps.push(CAPABILITIES.REASONING);
    }
    if (rawCaps.tools) {
      caps.push(CAPABILITIES.TOOL_CALLING);
    }
    if (rawCaps.vision) {
      caps.push(CAPABILITIES.VISION, CAPABILITIES.MULTIMODAL);
    }
    if (rawId.includes('coder') || rawId.includes('instruct')) {
      caps.push(CAPABILITIES.CODING);
    }
    if (rawCaps.imageOutput) {
      caps.push(CAPABILITIES.IMAGE_GENERATION);
    }
    if (rawCaps.audioInput || rawCaps.audioOutput) {
      caps.push(CAPABILITIES.AUDIO_SPEECH);
    }

    const contextLength = raw.context_length || rawCaps.contextWindow || 32768;

    return {
      id: rawId,
      name: `${friendlyName} (Flagship)`,
      provider: 'FlagshipRouter',
      providerId: this.id,
      description: `FlagshipRouter high-throughput inference gateway model (${raw.owned_by || 'flagship'}). Context: ${contextLength.toLocaleString()} tokens.`,
      contextLength,
      inputModalities: rawCaps.vision ? ['text', 'image'] : ['text'],
      outputModalities: ['text'],
      capabilities: Array.from(new Set(caps)),
      inputPrice: 0,
      outputPrice: 0,
      freeStatus: FREE_STATUS.VERIFIED_FREE_HOSTED,
      license: 'Gateway Open Access',
      providerUrl: `${this.baseUrl}/models`,
      lastVerifiedAt: new Date().toISOString(),
      availabilityStatus: 'online',
      isHosted: true,
      limits: 'FlagshipRouter internal gateway rate limits apply'
    };
  }

  async chat({ model, messages, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isConfigured()) {
      throw new Error('FLAGSHIPROUTER_API_KEY is not configured on the server. Please check server/.env');
    }

    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        // Accept string or object
        transformResponse: [(data) => data]
      }
    );

    let rawText = response.data;
    if (typeof rawText === 'string') {
      // Clean trailing SSE markers like "data: [DONE]" if present in non-stream response
      const cleanJson = rawText.split('\ndata: [DONE]')[0].trim();
      try {
        const parsed = JSON.parse(cleanJson);
        const choice = parsed.choices?.[0];
        return {
          content: choice?.message?.content || '',
          model: parsed.model || model,
          finishReason: choice?.finish_reason || 'stop',
          usage: parsed.usage
        };
      } catch (e) {
        logger.warn('Failed to parse FlagshipRouter JSON response:', e.message);
      }
    } else if (typeof rawText === 'object') {
      const choice = rawText.choices?.[0];
      return {
        content: choice?.message?.content || '',
        model: rawText.model || model,
        finishReason: choice?.finish_reason || 'stop',
        usage: rawText.usage
      };
    }

    throw new Error('Invalid response structure received from FlagshipRouter');
  }

  async chatStream({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, onDone, onError }) {
    if (!this.isConfigured()) {
      onError(new Error('FLAGSHIPROUTER_API_KEY is not configured on the server. Please check server/.env'));
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
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) {
                onChunk(delta);
              }
            } catch (err) {
              // ignore partial chunk json
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
