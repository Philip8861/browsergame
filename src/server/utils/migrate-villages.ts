import { query } from './database-wrapper';
import { logger } from './logger';

/**
 * Automatische Migration: Füge fehlende points-Spalte zur villages Tabelle hinzu
 * Wird beim Serverstart ausgeführt, wenn PostgreSQL verwendet wird
 */
export async function migrateVillagesTable(): Promise<void> {
  // Nur für PostgreSQL ausführen
  if (process.env.DB_TYPE === 'sqlite') {
    return; // SQLite hat bereits die Migration in initDatabase()
  }

  try {
    logger.info('🔧 Prüfe villages Tabelle auf fehlende points-Spalte...');

    // Prüfe ob points-Spalte existiert
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'villages' 
      AND column_name = 'points'
    `);

    if (checkColumn.rows.length === 0) {
      logger.info('➕ Füge Spalte "points" zu villages Tabelle hinzu...');
      await query(`
        ALTER TABLE villages 
        ADD COLUMN points INTEGER NOT NULL DEFAULT 0
      `);
      logger.info('✅ points-Spalte erfolgreich hinzugefügt');
    } else {
      logger.info('✅ points-Spalte existiert bereits');
    }

    logger.info('✅ Villages Tabelle Migration abgeschlossen');
  } catch (error: any) {
    // Fehler loggen, aber Server nicht abstürzen lassen
    logger.error('❌ Fehler bei der villages Tabelle Migration:', error.message);
    logger.error('⚠️ Server startet trotzdem, aber Registrierung könnte fehlschlagen');
  }
}
