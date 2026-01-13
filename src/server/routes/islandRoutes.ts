import { Router } from 'express';
import { getIslands, placeIsland } from '../controllers/islandController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/players/islands
 * @desc    Hole alle Spieler-Inseln
 * @access  Public
 */
router.get('/islands', getIslands);

/**
 * @route   POST /api/players/islands
 * @desc    Platziere eine neue Insel für einen Spieler
 * @access  Private
 */
router.post('/islands', authenticateToken, placeIsland);

export default router;




