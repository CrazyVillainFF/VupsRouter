import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { FREE_STATUS, CAPABILITIES } from '../utils/modelCatalog.js';
import { logger } from '../utils/logger.js';

export class HuggingFaceProvider extends BaseProvider {
  constructor(apiKey) {
    super('Hugging Face', 'huggingface', { apiKey });
    this.routerUrl = 'https://router.huggingface.co/hf-inference/v1';
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
        message: 'HUGGINGFACE_API_KEY is not configured in server/.env'
      };
    }

    try {
      const response = await axios.get('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        timeout: 8000
      });
      return {
        id: this.id,
        name: this.name,
        connected: true,
        configured: true,
        user: response.data?.name,
        message: 'Connected to Hugging Face Inference API'
      };
    } catch (err) {
      logger.warn('Hugging Face health check failed:', err.message);
      return {
        id: this.id,
        name: this.name,
        connected: false,
        configured: true,
        message: err.response?.data?.error || err.message
      };
    }
  }

  async listModels() {
    return [
      {
        id: 'huggingface/meta-llama/Llama-3.2-3B-Instruct',
        name: 'Llama 3.2 3B Instruct',
        provider: 'Hugging Face',
        providerId: this.id,
        description: 'Meta compact 3B model hosted on Hugging Face Serverless Inference.',
        contextLength: 131072,
        inputModalities: ['text'],
        outputModalities: ['text'],
        capabilities: [CAPABILITIES.GENERAL_CHAT, CAPABILITIES.CODING],
        inputPrice: 0,
        outputPrice: 0,
        freeStatus: FREE_STATUS.FREE_TIER_LIMITS,
        license: 'Llama 3.2 Community License',
        providerUrl: 'https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct',
        lastVerifiedAt: new Date().toISOString(),
        availabilityStatus: 'online',
        isHosted: true,
        limits: 'Serverless rate limits apply'
      },
      {
        id: 'huggingface/meta-llama/Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'Hugging Face',
        providerId: this.id,
        description: 'Powerful 8B open model on HF Serverless API.',
        contextLength: 131072,
        inputModalities: ['text'],
        outputModalities: ['text'],
        capabilities: [CAPABILITIES.GENERAL_CHAT, CAPABILITIES.CODING, CAPABILITIES.REASONING],
        inputPrice: 0,
        outputPrice: 0,
        freeStatus: FREE_STATUS.FREE_TIER_LIMITS,
        license: 'Llama 3.1 Community License',
        providerUrl: 'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct',
        lastVerifiedAt: new Date().toISOString(),
        availabilityStatus: 'online',
        isHosted: true,
        limits: 'HF free inference queue limits'
      }
    ];
  }

  async chat({ model, messages, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isConfigured()) {
      throw new Error('HUGGINGFACE_API_KEY is not configured on the server. Please add your key to server/.env');
    }

    const cleanModel = model.replace('huggingface/', '');
    const response = await axios.post(
      `${this.routerUrl}/chat/completions`,
      {
        model: cleanModel,
        messages,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const choice = response.data?.choices?.[0];
    return {
      content: choice?.message?.content || '',
      model,
      finishReason: choice?.finish_reason || 'stop',
      usage: response.data?.usage
    };
  }

  async chatStream({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, onDone, onError }) {
    if (!this.isConfigured()) {
      onError(new Error('HUGGINGFACE_API_KEY is not configured on the server. Please add your key to server/.env'));
      return;
    }

    try {
      const cleanModel = model.replace('huggingface/', '');
      const response = await axios.post(
        `${this.routerUrl}/chat/completions`,
        {
          model: cleanModel,
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
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') onDone();
            continue;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices?.[0]?.delta?.content || '';
              if (delta) onChunk(delta);
            } catch (err) {
              // ignore partial chunk
            }
          }
        }
      });

      response.data.on('end', () => onDone());
      response.data.on('error', (err) => onError(err));
    } catch (err) {
      onError(err);
    }
  }
}
