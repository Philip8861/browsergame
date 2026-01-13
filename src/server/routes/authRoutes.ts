import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registriere einen neuen Benutzer
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login eines bestehenden Benutzers
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Hole aktuellen Benutzer
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

export default router;




