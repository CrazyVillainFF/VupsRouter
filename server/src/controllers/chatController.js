import { z } from 'zod';
import { chatService } from '../services/chatService.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { logger } from '../utils/logger.js';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty')
});

const chatRequestSchema = z.object({
  model: z.string().min(1, 'Model identifier is required'),
  messages: z.array(messageSchema).min(1, 'At least one message is required'),
  providerId: z.string().optional(),
  chatId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(32768).optional().default(2048)
});

const createChatSchema = z.object({
  title: z.string().optional().default('New Conversation'),
  modelId: z.string().default('cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'),
  providerId: z.string().default('flagshiprouter')
});

const updateChatSchema = z.object({
  title: z.string().optional(),
  pinned: z.boolean().optional(),
  modelId: z.string().optional(),
  providerId: z.string().optional()
});

export const chatController = {
  async listChats(req, res, next) {
    try {
      const { search } = req.query;
      const chats = await chatService.listChats(req.user.id, search);
      res.json({
        success: true,
        data: { chats }
      });
    } catch (err) {
      next(err);
    }
  },

  async getChat(req, res, next) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.getChat(req.user.id, chatId);
      res.json({
        success: true,
        data: { chat }
      });
    } catch (err) {
      next(err);
    }
  },

  async createChat(req, res, next) {
    try {
      const data = createChatSchema.parse(req.body);
      const chat = await chatService.createChat(req.user.id, data);
      res.status(201).json({
        success: true,
        data: { chat }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateChat(req, res, next) {
    try {
      const { chatId } = req.params;
      const data = updateChatSchema.parse(req.body);
      const updated = await chatService.updateChat(req.user.id, chatId, data);
      res.json({
        success: true,
        data: { chat: updated }
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteChat(req, res, next) {
    try {
      const { chatId } = req.params;
      await chatService.deleteChat(req.user.id, chatId);
      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async chatCompletion(req, res, next) {
    try {
      const data = chatRequestSchema.parse(req.body);

      const provider = providerRegistry.resolveProviderForModel(data.model);
      if (!provider) {
        return res.status(400).json({
          success: false,
          error: { message: `No active provider found for model: ${data.model}` }
        });
      }

      const lastUserMsg = data.messages[data.messages.length - 1];

      // If user is authenticated and chatId is provided, record user message
      if (req.user && data.chatId) {
        await chatService.addMessage(req.user.id, data.chatId, {
          role: lastUserMsg.role,
          content: lastUserMsg.content,
          modelId: data.model,
          providerId: provider.id
        });
      }

      const result = await provider.chat({
        model: data.model,
        messages: data.messages,
        temperature: data.temperature,
        maxTokens: data.maxTokens
      });

      // Save assistant reply
      if (req.user && data.chatId) {
        await chatService.addMessage(req.user.id, data.chatId, {
          role: 'assistant',
          content: result.content,
          modelId: result.model || data.model,
          providerId: provider.id,
          metadata: { usage: result.usage, finishReason: result.finishReason }
        });
      }

      res.json({
        success: true,
        data: {
          content: result.content,
          model: result.model || data.model,
          providerId: provider.id,
          finishReason: result.finishReason,
          usage: result.usage
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async streamChat(req, res, next) {
    try {
      const data = chatRequestSchema.parse(req.body);

      const provider = providerRegistry.resolveProviderForModel(data.model);
      if (!provider) {
        return res.status(400).json({
          success: false,
          error: { message: `No active provider found for model: ${data.model}` }
        });
      }

      const lastUserMsg = data.messages[data.messages.length - 1];

      if (req.user && data.chatId) {
        await chatService.addMessage(req.user.id, data.chatId, {
          role: lastUserMsg.role,
          content: lastUserMsg.content,
          modelId: data.model,
          providerId: provider.id
        });
      }

      // Initialize SSE Headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      res.flushHeaders?.();

      let fullContent = '';

      res.write(`data: ${JSON.stringify({ type: 'start', model: data.model, providerId: provider.id })}\n\n`);

      let isClosed = false;
      req.on('close', () => {
        isClosed = true;
      });

      await provider.chatStream({
        model: data.model,
        messages: data.messages,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        onChunk: (delta) => {
          if (isClosed) return;
          fullContent += delta;
          res.write(`data: ${JSON.stringify({ type: 'chunk', delta })}\n\n`);
        },
        onDone: async () => {
          if (isClosed) return;
          // Persist assistant message
          if (req.user && data.chatId && fullContent) {
            try {
              await chatService.addMessage(req.user.id, data.chatId, {
                role: 'assistant',
                content: fullContent,
                modelId: data.model,
                providerId: provider.id
              });
            } catch (saveErr) {
              logger.warn('Failed to persist assistant stream message:', saveErr.message);
            }
          }

          res.write(`data: ${JSON.stringify({ type: 'done', fullContent })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        },
        onError: (err) => {
          if (isClosed) return;
          logger.error('Stream error:', err.message);
          res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream generation failed' })}\n\n`);
          res.end();
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
        res.end();
      }
    }
  }
};
