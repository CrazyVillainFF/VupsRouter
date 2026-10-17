import { providerRegistry } from '../providers/ProviderRegistry.js';
import { CAPABILITIES, FREE_STATUS } from '../utils/modelCatalog.js';

export const modelController = {
  async getModels(req, res, next) {
    try {
      const {
        search = '',
        provider = '',
        capability = '',
        freeOnly = 'false',
        sort = 'popular',
        refresh = 'false'
      } = req.query;

      let models = await providerRegistry.getAllModels(refresh === 'true');

      // 1. Search filter
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        models = models.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.id.toLowerCase().includes(query) ||
            m.description.toLowerCase().includes(query) ||
            m.provider.toLowerCase().includes(query)
        );
      }

      // 2. Provider filter
      if (provider && provider.trim()) {
        const p = provider.toLowerCase().trim();
        models = models.filter((m) => m.providerId.toLowerCase() === p || m.provider.toLowerCase() === p);
      }

      // 3. Capability filter
      if (capability && capability.trim()) {
        const c = capability.toLowerCase().trim();
        models = models.filter((m) =>
          m.capabilities.some((cap) => cap.toLowerCase().includes(c))
        );
      }

      // 4. Free-only filter
      if (freeOnly === 'true') {
        models = models.filter((m) =>
          m.freeStatus === FREE_STATUS.VERIFIED_FREE_HOSTED ||
          m.freeStatus === FREE_STATUS.FREE_TIER_LIMITS ||
          m.freeStatus === FREE_STATUS.LOCAL_INFERENCE
        );
      }

      // 5. Sorting
      if (sort === 'context') {
        models.sort((a, b) => (b.contextLength || 0) - (a.contextLength || 0));
      } else if (sort === 'name') {
        models.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'pricing') {
        models.sort((a, b) => (a.inputPrice || 0) - (b.inputPrice || 0));
      }

      res.json({
        success: true,
        data: {
          models,
          total: models.length,
          availableCapabilities: Object.values(CAPABILITIES),
          freeCategories: Object.values(FREE_STATUS),
          lastVerifiedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getModelById(req, res, next) {
    try {
      const { modelId } = req.params;
      // In case route decoded slashes or encoded URI
      const decodedId = decodeURIComponent(modelId);
      const model = await providerRegistry.getModelById(decodedId);

      if (!model) {
        return res.status(404).json({
          success: false,
          error: { message: `Model '${decodedId}' not found in registry.` }
        });
      }

      res.json({
        success: true,
        data: { model }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProviders(req, res, next) {
    try {
      const providers = providerRegistry.getProvidersMetadata();
      res.json({
        success: true,
        data: { providers }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProviderHealth(req, res, next) {
    try {
      const { providerId } = req.params;
      const health = await providerRegistry.checkProviderHealth(providerId);
      res.json({
        success: true,
        data: { health }
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllProvidersHealth(req, res, next) {
    try {
      const health = await providerRegistry.checkAllHealth();
      res.json({
        success: true,
        data: { health }
      });
    } catch (err) {
      next(err);
    }
  },

  async getPublicConfig(req, res) {
    res.json({
      success: true,
      data: {
        appName: 'VupsRouter',
        version: '1.0.0',
        defaultModel: 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
        defaultProvider: 'flagshiprouter',
        features: {
          streaming: true,
          modelComparison: true,
          localModels: true,
          voiceInput: false
        }
      }
    });
  }
};
