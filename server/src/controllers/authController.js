import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authService } from '../services/authService.js';
import { emailService } from '../services/emailService.js';
import { env } from '../config/env.js';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const signinSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim()
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  password: z.string().min(8, 'New password must be at least 8 characters')
});

function setSessionCookie(res, token) {
  res.cookie('vups_session', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export const authController = {
  async signup(req, res, next) {
    try {
      const data = signupSchema.parse(req.body);

      const existing = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: { message: 'An account with this email address already exists.' }
        });
      }

      const passwordHash = await authService.hashPassword(data.password);

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          preferences: {
            create: {
              theme: 'dark',
              defaultModel: 'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
              defaultProvider: 'flagshiprouter'
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          preferences: true
        }
      });

      const token = authService.generateToken(user);
      setSessionCookie(res, token);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async signin(req, res, next) {
    try {
      const data = signinSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { preferences: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password.' }
        });
      }

      const isMatch = await authService.comparePassword(data.password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password.' }
        });
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        preferences: user.preferences
      };

      const token = authService.generateToken(safeUser);
      setSessionCookie(res, token);

      res.json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    res.clearCookie('vups_session', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({
      success: true,
      message: 'Successfully signed out'
    });
  },

  async me(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          preferences: true,
          _count: {
            select: { chats: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const data = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      // Avoid leaking user existence
      if (user) {
        const token = await authService.createPasswordResetToken(user.id);
        const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
        await emailService.sendPasswordResetEmail(user.email, resetUrl);
      }

      res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.'
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const data = resetPasswordSchema.parse(req.body);

      const userId = await authService.verifyAndConsumeResetToken(data.token);
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Password reset link is invalid or has expired. Please request a new one.' }
        });
      }

      const passwordHash = await authService.hashPassword(data.password);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in with your new password.'
      });
    } catch (err) {
      next(err);
    }
  }
};
