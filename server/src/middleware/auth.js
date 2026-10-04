import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'aegis-command-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign a JWT token for an authenticated user
 */
export function signToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId || null
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Authentication middleware: verifies Bearer token and attaches req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Malformed authorization header'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: err.message
      });
    }

    // Try finding user in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-passwordHash').lean();
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } else {
      // In-memory or fallback mode
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId
      };
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication failure',
      details: err.message
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role ${req.user.role} does not have required permissions`
      });
    }
    next();
  };
}

/**
 * Organization access authorization middleware:
 * Ensures the authenticated user's organizationId matches the target organization.
 * NEVER trusts client-supplied organizationId.
 * Returns 403 Forbidden if accessing another organization's data.
 */
export function requireOrganizationAccess(paramName = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const targetOrgId = req.params[paramName];
    if (!targetOrgId) {
      return res.status(400).json({ error: 'Missing organization identifier parameter' });
    }

    const userOrgId = req.user.organizationId ? req.user.organizationId.toString() : null;

    // Strict organization data isolation
    if (!userOrgId || userOrgId !== targetOrgId.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You are not authorized to access this organization'
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware:
 * Populates req.user if a valid Bearer token is provided, otherwise proceeds without failing.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      req.user = null;
      return next();
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-passwordHash').lean();
      if (user) {
        req.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId
      };
    }

    next();
  } catch (err) {
    req.user = null;
    next();
  }
}
