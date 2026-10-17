import { OpenRouterProvider } from './OpenRouterProvider.js';
import { FlagshipRouterProvider } from './FlagshipRouterProvider.js';
import { GoogleAIProvider } from './GoogleAIProvider.js';
import { HuggingFaceProvider } from './HuggingFaceProvider.js';
import { OllamaProvider } from './OllamaProvider.js';
import { BASELINE_MODELS, PROVIDERS_METADATA } from '../utils/modelCatalog.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.cachedModels = null;
    this.cacheTimestamp = 0;
    this.cacheTTL = env.MODEL_CACHE_TTL_SECONDS * 1000;

    // Initialize adapters
    this.flagship = new FlagshipRouterProvider(env.FLAGSHIPROUTER_BASE_URL, env.FLAGSHIPROUTER_API_KEY);
    this.openrouter = new OpenRouterProvider(env.OPENROUTER_API_KEY);
    this.googleAI = new GoogleAIProvider(env.GOOGLE_AI_API_KEY);
    this.huggingface = new HuggingFaceProvider(env.HUGGINGFACE_API_KEY);
    this.ollama = new OllamaProvider(env.OLLAMA_BASE_URL);

    this.register(this.flagship);
    this.register(this.openrouter);
    this.register(this.googleAI);
    this.register(this.huggingface);
    this.register(this.ollama);
  }

  register(provider) {
    this.providers.set(provider.id, provider);
  }

  get(providerId) {
    return this.providers.get(providerId);
  }

  getProvidersMetadata() {
    return PROVIDERS_METADATA.map((p) => {
      const provider = this.get(p.id);
      const isConfigured = p.id === 'ollama' ? true : provider?.isConfigured?.() || false;
      return {
        ...p,
        isConfigured
      };
    });
  }

  async checkProviderHealth(providerId) {
    const provider = this.get(providerId);
    if (!provider) {
      return {
        id: providerId,
        connected: false,
        configured: false,
        message: `Unknown provider: ${providerId}`
      };
    }
    return await provider.healthCheck();
  }

  async checkAllHealth() {
    const results = {};
    for (const [id, provider] of this.providers.entries()) {
      results[id] = await provider.healthCheck();
    }
    return results;
  }

  async getAllModels(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cachedModels && now - this.cacheTimestamp < this.cacheTTL) {
      return this.cachedModels;
    }

    const aggregatedMap = new Map();

    // 1. Seed baseline models first to guarantee curated high-quality free models are available
    for (const model of BASELINE_MODELS) {
      aggregatedMap.set(model.id, { ...model });
    }

    // 2. Fetch live models in parallel
    const liveFetches = Array.from(this.providers.values()).map(async (provider) => {
      try {
        const models = await provider.listModels();
        for (const m of models) {
          aggregatedMap.set(m.id, m);
        }
      } catch (err) {
        logger.debug(`Live fetch error from ${provider.name}:`, err.message);
      }
    });

    await Promise.allSettled(liveFetches);

    this.cachedModels = Array.from(aggregatedMap.values());
    this.cacheTimestamp = now;
    return this.cachedModels;
  }

  async getModelById(modelId) {
    const all = await this.getAllModels();
    return all.find((m) => m.id === modelId) || null;
  }

  resolveProviderForModel(modelId) {
    if (modelId.startsWith('cf/') || modelId.startsWith('flagshiprouter/')) return this.flagship;
    if (modelId.startsWith('google-ai/')) return this.googleAI;
    if (modelId.startsWith('huggingface/')) return this.huggingface;
    if (modelId.startsWith('ollama/')) return this.ollama;
    // Default to FlagshipRouter if configured and model matches one of its models, otherwise OpenRouter
    return this.flagship.isConfigured() ? this.flagship : this.openrouter;
  }
}

export const providerRegistry = new ProviderRegistry();
