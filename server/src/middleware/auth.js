import { authService } from '../services/authService.js';
import { prisma } from '../config/prisma.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.vups_session) {
      token = req.cookies.vups_session;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Please sign in to continue.' }
      });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: { message: 'Session expired or invalid. Please sign in again.' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User account no longer exists.' }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication failed.' }
    });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.vups_session) {
      token = req.cookies.vups_session;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = authService.verifyToken(token);
      if (decoded && decoded.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true
          }
        });
        req.user = user || null;
      }
    }
  } catch (err) {
    req.user = null;
  }
  next();
}
