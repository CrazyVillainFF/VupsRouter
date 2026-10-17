import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16).default('vupsrouter_default_session_secret_32bytes_min!'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  FLAGSHIPROUTER_BASE_URL: z.string().default('http://localhost:20128/v1'),
  FLAGSHIPROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  HUGGINGFACE_API_KEY: z.string().optional().default(''),
  GOOGLE_AI_API_KEY: z.string().optional().default(''),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  MODEL_CACHE_TTL_SECONDS: z.coerce.number().default(300),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  EMAIL_PROVIDER_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('noreply@vupsrouter.ai')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
