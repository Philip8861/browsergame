import { Request, Response } from 'express';
import { getWeatherManager } from '../utils/weather-manager';
import { logger } from '../utils/logger';

/**
 * Hole aktuelles Wetter
 * @route   GET /api/weather
 * @access  Public (für alle Spieler gleich)
 */
export const getWeather = async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('🌤️ Wetter-API aufgerufen');
    const weatherManager = getWeatherManager();
    const weather = weatherManager.getCurrentWeather();
    const remainingSeconds = weatherManager.getRemainingSeconds();
    
    const response = {
      ...weather,
      remainingSeconds,
    };
    
    logger.info('🌤️ Wetter-Response:', response);
    res.json(response);
  } catch (error) {
    logger.error('Fehler beim Abrufen des Wetters:', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen des Wetters',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
