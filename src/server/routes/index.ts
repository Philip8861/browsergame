import { Express } from 'express';
import { logger } from '../utils/logger';

/**
 * Setup aller API-Routen
 */
export function setupRoutes(app: Express): void {
  try {
    logger.info('Lade Routes...');
    
    // Auth Routes
    try {
      const authRoutes = require('./authRoutes').default;
      app.use('/api/auth', authRoutes);
      logger.info('✅ Auth Routes geladen');
    } catch (error) {
      logger.error('❌ Fehler beim Laden der Auth Routes:', error);
    }
    
    // Village Routes
    try {
      const villageRoutes = require('./villageRoutes').default;
      app.use('/api/villages', villageRoutes);
      logger.info('✅ Village Routes geladen');
    } catch (error) {
      logger.error('❌ Fehler beim Laden der Village Routes:', error);
    }
    
    // Island Routes
    try {
      const islandRoutes = require('./islandRoutes').default;
      app.use('/api/players', islandRoutes);
      logger.info('✅ Island Routes geladen');
    } catch (error) {
      logger.error('❌ Fehler beim Laden der Island Routes:', error);
    }
    
    // Backup Routes
    try {
      const backupRoutes = require('./backupRoutes').default;
      app.use('/api/backup', backupRoutes);
      logger.info('✅ Backup Routes geladen');
    } catch (error) {
      logger.error('❌ Fehler beim Laden der Backup Routes:', error);
    }
    
    // Leaderboard Routes
    try {
      const leaderboardRoutes = require('./leaderboardRoutes').default;
      app.use('/api/leaderboard', leaderboardRoutes);
      logger.info('✅ Leaderboard Routes geladen');
    } catch (error) {
      logger.error('❌ Fehler beim Laden der Leaderboard Routes:', error);
    }
    
    
    logger.info('✅ Alle Routes erfolgreich geladen');
  } catch (error) {
    logger.error('❌ Kritischer Fehler beim Setup der Routes:', error);
    throw error;
  }
}

