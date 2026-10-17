import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { providerRegistry } from '../src/providers/ProviderRegistry.js';
import { FREE_STATUS } from '../src/utils/modelCatalog.js';

describe('VupsRouter Backend API & Provider Integration Tests', () => {
  const testUser = {
    name: 'Test Pilot',
    email: `pilot_${Date.now()}@vupsrouter.test`,
    password: 'Password123!'
  };
  let userToken = '';
  let createdChatId = '';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: '@vupsrouter.test' } }
      });
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });

  describe('1. Health and Public Config Endpoints', () => {
    it('GET /api/health should return 200 with service status and providers', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('ok');
      expect(res.body.providers).toBeDefined();
      expect(res.body.providers.flagshiprouter).toBeDefined();
    });

    it('GET /api/config/public should return public app features without leaking secrets', async () => {
      const res = await request(app).get('/api/config/public');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appName).toBe('VupsRouter');
      expect(res.body.data.defaultModel).toBeDefined();
      // Ensure API keys are not returned
      expect(res.body.data.FLAGSHIPROUTER_API_KEY).toBeUndefined();
      expect(res.body.data.OPENROUTER_API_KEY).toBeUndefined();
    });
  });

  describe('2. Authentication Flow & Security', () => {
    it('POST /api/auth/signup should create an account with hashed password and return token', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
      userToken = res.body.data.token;
    });

    it('POST /api/auth/signup should reject duplicate email registrations with 409', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/signup should reject weak passwords with validation error', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Short',
        email: 'short@test.com',
        password: '123'
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/signin should sign in with valid credentials and return cookie', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: testUser.email,
        password: testUser.password
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/signin should reject incorrect password with 401', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: testUser.email,
        password: 'WrongPassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return authenticated user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Model Discovery & Normalization', () => {
    it('GET /api/models should return normalized model catalog including FlagshipRouter models', async () => {
      const res = await request(app).get('/api/models');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.models)).toBe(true);
      expect(res.body.data.models.length).toBeGreaterThan(0);

      // Verify FlagshipRouter models are normalized
      const flagshipModels = res.body.data.models.filter((m) => m.providerId === 'flagshiprouter');
      expect(flagshipModels.length).toBeGreaterThan(0);
      const sample = flagshipModels[0];
      expect(sample.id).toBeDefined();
      expect(sample.name).toBeDefined();
      expect(sample.provider).toBe('FlagshipRouter');
      expect(sample.contextLength).toBeGreaterThan(0);
      expect(sample.freeStatus).toBeDefined();
      expect(Array.isArray(sample.capabilities)).toBe(true);
    });

    it('GET /api/models with capability filter should filter correctly', async () => {
      const res = await request(app).get('/api/models?capability=Reasoning');
      expect(res.status).toBe(200);
      for (const m of res.body.data.models) {
        expect(m.capabilities).toContain('Reasoning');
      }
    });

    it('GET /api/providers should return provider metadata with configuration status', async () => {
      const res = await request(app).get('/api/providers');
      expect(res.status).toBe(200);
      expect(res.body.data.providers.length).toBeGreaterThan(0);
      const flagship = res.body.data.providers.find((p) => p.id === 'flagshiprouter');
      expect(flagship).toBeDefined();
      expect(flagship.isConfigured).toBe(true);
    });
  });

  describe('4. AI Chat Persistence & Ownership Verification', () => {
    it('POST /api/chats should create a new conversation for authenticated user', async () => {
      const res = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Deep Exploration Chat',
          modelId: 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
          providerId: 'flagshiprouter'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.chat.id).toBeDefined();
      expect(res.body.data.chat.title).toBe('Deep Exploration Chat');
      createdChatId = res.body.data.chat.id;
    });

    it('GET /api/chats should list user conversations', async () => {
      const res = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.chats.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/chats/:chatId should rename conversation', async () => {
      const res = await request(app)
        .patch(`/api/chats/${createdChatId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Renamed Chat Title' });
      expect(res.status).toBe(200);
      expect(res.body.data.chat.title).toBe('Renamed Chat Title');
    });

    it('Enforce ownership: another user cannot access or delete this conversation', async () => {
      // Create another user
      const otherRes = await request(app).post('/api/auth/signup').send({
        name: 'Intruder',
        email: `intruder_${Date.now()}@vupsrouter.test`,
        password: 'Password123!'
      });
      const otherToken = otherRes.body.data.token;

      // Other user tries to read first user's chat
      const readRes = await request(app)
        .get(`/api/chats/${createdChatId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(readRes.status).toBe(403);

      // Other user tries to delete first user's chat
      const deleteRes = await request(app)
        .delete(`/api/chats/${createdChatId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(deleteRes.status).toBe(403);
    });

    it('DELETE /api/chats/:chatId should allow owner to delete conversation', async () => {
      const res = await request(app)
        .delete(`/api/chats/${createdChatId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Chat Completion via FlagshipRouter', () => {
    it('POST /api/chat should execute real AI generation with FlagshipRouter', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          model: 'cf/@cf/meta/llama-3.2-3b-instruct',
          messages: [{ role: 'user', content: 'Say "Antigravity online" in 2 words.' }]
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBeDefined();
      expect(res.body.data.content.length).toBeGreaterThan(0);
      expect(res.body.data.providerId).toBe('flagshiprouter');
    }, 20000);
  });
});
