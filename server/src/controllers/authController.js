import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

// In-memory fallback user registry for offline development / test resilience
const inMemoryUsers = new Map();

const VALID_ROLES = ['ADMIN', 'COMMANDER', 'ANALYST', 'FIELD_OPERATOR', 'VIEWER'];

/**
 * POST /api/auth/register
 * Registers a new operator
 */
export async function register(req, res) {
  try {
    const { name, email, password, role = 'COMMANDER', organizationId = null } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role ? role.toUpperCase() : 'COMMANDER';

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (mongoose.connection.readyState === 1) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: normalizedRole,
        organizationId
      });

      const token = signToken(newUser);

      return res.status(201).json({
        message: 'Operator registered successfully',
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          organizationId: newUser.organizationId,
          createdAt: newUser.createdAt
        }
      });
    } else {
      // In-memory fallback
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const mockId = 'usr_' + Date.now().toString(36);
      const fallbackUser = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: normalizedRole,
        organizationId: organizationId || 'demo-org-chandigarh',
        createdAt: new Date().toISOString()
      };
      inMemoryUsers.set(normalizedEmail, fallbackUser);

      const token = signToken(fallbackUser);

      return res.status(201).json({
        message: 'Operator registered successfully (in-memory mode)',
        token,
        user: {
          id: fallbackUser.id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role,
          organizationId: fallbackUser.organizationId,
          createdAt: fallbackUser.createdAt
        }
      });
    }
  } catch (err) {
    console.error('[AEGIS-AUTH] Registration error:', err);
    return res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

/**
 * POST /api/auth/login
 * Authenticates operator and issues JWT token
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = inMemoryUsers.get(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Operator authenticated successfully',
      token,
      user: {
        id: (user._id ? user._id.toString() : user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[AEGIS-AUTH] Login error:', err);
    return res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
}

/**
 * POST /api/auth/logout
 * Terminates session / instructs client to discard token
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Session terminated successfully'
  });
}

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated operator's profile
 */
export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    return res.status(200).json({
      user: req.user
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch operator profile', details: err.message });
  }
}
