import { prisma } from '../config/prisma.js';

export const chatService = {
  async listChats(userId, search = '') {
    const where = {
      userId
    };

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { messages: { some: { content: { contains: search.trim() } } } }
      ];
    }

    return prisma.chat.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  },

  async getChat(userId, chatId) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      const err = new Error('Chat not found');
      err.status = 404;
      throw err;
    }

    if (chat.userId !== userId) {
      const err = new Error('Unauthorized access to this conversation');
      err.status = 403;
      throw err;
    }

    return chat;
  },

  async createChat(userId, { title = 'New Conversation', modelId, providerId }) {
    return prisma.chat.create({
      data: {
        userId,
        title,
        modelId,
        providerId
      },
      include: {
        messages: true
      }
    });
  },

  async updateChat(userId, chatId, { title, pinned, modelId, providerId }) {
    await this.getChat(userId, chatId); // ensures existence and ownership

    const data = {};
    if (typeof title === 'string') data.title = title.trim();
    if (typeof pinned === 'boolean') data.pinned = pinned;
    if (modelId) data.modelId = modelId;
    if (providerId) data.providerId = providerId;

    return prisma.chat.update({
      where: { id: chatId },
      data,
      include: {
        messages: true
      }
    });
  },

  async deleteChat(userId, chatId) {
    await this.getChat(userId, chatId); // ensures existence and ownership

    return prisma.chat.delete({
      where: { id: chatId }
    });
  },

  async addMessage(userId, chatId, { role, content, modelId, providerId, metadata }) {
    await this.getChat(userId, chatId); // ensures ownership

    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        modelId,
        providerId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Touch chat updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    return message;
  }
};
