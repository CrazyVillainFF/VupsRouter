import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected successfully (SQLite / Prisma)');

    const server = app.listen(env.PORT, () => {
      logger.info(`VupsRouter server running at http://localhost:${env.PORT}`);
      logger.info(`Client URL: ${env.CLIENT_URL}`);
      logger.info(`Active Providers: FlagshipRouter, OpenRouter, Google AI, Hugging Face, Ollama`);
    });

    const shutdown = async () => {
      logger.info('Gracefully shutting down server...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed. Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
