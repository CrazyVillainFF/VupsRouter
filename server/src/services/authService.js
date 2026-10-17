import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export const authService = {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      env.SESSION_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, env.SESSION_SECRET);
    } catch (err) {
      return null;
    }
  },

  async createPasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Invalidate old tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true }
    });

    const resetRecord = await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });

    return resetRecord.token;
  },

  async verifyAndConsumeResetToken(token) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!record || record.used || new Date() > record.expiresAt) {
      return null;
    }

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true }
    });

    return record.userId;
  }
};
