import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { FREE_STATUS, CAPABILITIES } from '../utils/modelCatalog.js';
import { logger } from '../utils/logger.js';

export class OllamaProvider extends BaseProvider {
  constructor(baseUrl = 'http://localhost:11434') {
    super('Ollama', 'ollama', { baseUrl });
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/version`, { timeout: 3000 });
      return {
        id: this.id,
        name: this.name,
        connected: true,
        configured: true,
        version: response.data?.version,
        message: `Ollama is running locally (v${response.data?.version || 'unknown'})`
      };
    } catch (err) {
      return {
        id: this.id,
        name: this.name,
        connected: false,
        configured: true,
        message: `Ollama is not running on ${this.baseUrl}. Run 'ollama serve' to start local AI models.`
      };
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 4000 });
      const rawModels = response.data?.models || [];
      return rawModels.map((m) => this.normalizeModel(m));
    } catch (err) {
      logger.debug('Ollama local tags check:', err.message);
      return [];
    }
  }

  normalizeModel(raw) {
    const name = raw.name;
    const capabilities = [CAPABILITIES.GENERAL_CHAT];

    if (name.includes('r1') || name.includes('reason')) {
      capabilities.push(CAPABILITIES.REASONING);
    }
    if (name.includes('coder') || name.includes('code')) {
      capabilities.push(CAPABILITIES.CODING);
    }
    if (name.includes('vision') || name.includes('llava')) {
      capabilities.push(CAPABILITIES.VISION, CAPABILITIES.MULTIMODAL);
    }

    return {
      id: `ollama/${name}`,
      name: `${name} (Local)`,
      provider: 'Ollama',
      providerId: this.id,
      description: `Locally running model: ${name}. Zero internet connection required. Complete hardware privacy.`,
      contextLength: 131072,
      inputModalities: ['text'],
      outputModalities: ['text'],
      capabilities,
      inputPrice: 0,
      outputPrice: 0,
      freeStatus: FREE_STATUS.LOCAL_INFERENCE,
      license: 'Open Source / Local Weights',
      providerUrl: `https://ollama.com/library/${name.split(':')[0]}`,
      lastVerifiedAt: new Date().toISOString(),
      availabilityStatus: 'local',
      isHosted: false,
      limits: 'Local hardware limited. Unlimited requests, no rate limits.'
    };
  }

  async chat({ model, messages, temperature = 0.7 }) {
    const cleanModel = model.replace('ollama/', '');
    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: cleanModel,
        messages,
        options: { temperature },
        stream: false
      },
      { timeout: 120000 }
    );

    return {
      content: response.data?.message?.content || '',
      model,
      finishReason: 'stop',
      usage: {
        total_duration: response.data?.total_duration,
        prompt_eval_count: response.data?.prompt_eval_count,
        eval_count: response.data?.eval_count
      }
    };
  }

  async chatStream({ model, messages, temperature = 0.7, onChunk, onDone, onError }) {
    try {
      const cleanModel = model.replace('ollama/', '');
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: cleanModel,
          messages,
          options: { temperature },
          stream: true
        },
        {
          responseType: 'stream',
          timeout: 120000
        }
      );

      let buffer = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.message?.content) {
              onChunk(data.message.content);
            }
            if (data.done) {
              onDone();
            }
          } catch (err) {
            // ignore partial json
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
