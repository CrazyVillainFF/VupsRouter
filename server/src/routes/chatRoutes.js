import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Conversation management (requires authentication)
router.get('/chats', requireAuth, chatController.listChats);
router.post('/chats', requireAuth, chatController.createChat);
router.get('/chats/:chatId', requireAuth, chatController.getChat);
router.patch('/chats/:chatId', requireAuth, chatController.updateChat);
router.delete('/chats/:chatId', requireAuth, chatController.deleteChat);

// Chat execution (optionalAuth so guests can try, and authenticated users persist)
router.post('/chat', chatLimiter, optionalAuth, chatController.chatCompletion);
router.post('/chat/stream', chatLimiter, optionalAuth, chatController.streamChat);

export default router;
