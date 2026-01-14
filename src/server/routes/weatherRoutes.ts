import { Router } from 'express';
import { getWeather } from '../controllers/weatherController';

const router = Router();

/**
 * @route   GET /api/weather
 * @desc    Hole aktuelles Wetter (für alle Spieler gleich)
 * @access  Public
 */
router.get('/', getWeather);

export default router;
