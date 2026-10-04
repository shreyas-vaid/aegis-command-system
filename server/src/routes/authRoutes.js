import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public authentication endpoints
 */
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

/**
 * Protected session endpoint
 */
router.get('/me', requireAuth, getMe);

export default router;
