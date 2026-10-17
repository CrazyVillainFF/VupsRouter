import { Router } from 'express';
import { modelController } from '../controllers/modelController.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/models', generalLimiter, modelController.getModels);
router.get('/models/:modelId(*)', generalLimiter, modelController.getModelById);
router.get('/providers', generalLimiter, modelController.getProviders);
router.get('/providers/health/all', generalLimiter, modelController.getAllProvidersHealth);
router.get('/providers/:providerId/health', generalLimiter, modelController.getProviderHealth);
router.get('/config/public', modelController.getPublicConfig);

export default router;
