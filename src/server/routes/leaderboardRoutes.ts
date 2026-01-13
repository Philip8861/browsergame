import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';

const router = Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Hole Rangliste aller Spieler
 * @access  Public
 */
router.get('/', getLeaderboard);

export default router;
