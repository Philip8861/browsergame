import { Router } from 'express';
import { getFishingBoats, buildFishingBoat } from '../controllers/fishingBoatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/villages/:villageId/fishing-boats
 * @desc    Hole Fischerboote für ein Dorf
 * @access  Private
 */
router.get('/:villageId/fishing-boats', authenticateToken, getFishingBoats);

/**
 * @route   POST /api/villages/:villageId/fishing-boats/build
 * @desc    Baue ein Fischerboot
 * @access  Private
 */
router.post('/:villageId/fishing-boats/build', authenticateToken, buildFishingBoat);

export default router;
