import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';

const router = Router();

router.get('/health', async (req, res) => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  const providers = await providerRegistry.checkAllHealth();

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'VupsRouter Backend API',
    database: dbStatus,
    providers
  });
});

export default router;
