import { query } from './database-wrapper';
import { logger } from './logger';

/**
 * Automatische Migration: Füge fehlende Spalten zur resources Tabelle hinzu
 * Wird beim Serverstart ausgeführt, wenn PostgreSQL verwendet wird
 */
export async function migrateResourcesTable(): Promise<void> {
  // Nur für PostgreSQL ausführen
  if (process.env.DB_TYPE === 'sqlite') {
    return; // SQLite hat bereits die richtigen Spalten
  }

  try {
    logger.info('🔧 Prüfe resources Tabelle auf fehlende Spalten...');

    // Prüfe ob Spalten existieren
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' 
      AND column_name IN ('stone', 'water', 'food', 'luxury')
    `);

    const existingColumns = checkColumns.rows.map((r: any) => r.column_name);
    logger.info(`Vorhandene Spalten: ${existingColumns.join(', ')}`);

    // Füge fehlende Spalten hinzu
    if (!existingColumns.includes('stone')) {
      logger.info('➕ Füge Spalte "stone" hinzu...');
      await query('ALTER TABLE resources ADD COLUMN stone NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('water')) {
      logger.info('➕ Füge Spalte "water" hinzu...');
      await query('ALTER TABLE resources ADD COLUMN water NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('food')) {
      logger.info('➕ Füge Spalte "food" hinzu...');
      await query('ALTER TABLE resources ADD COLUMN food NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('luxury')) {
      logger.info('➕ Füge Spalte "luxury" hinzu...');
      await query('ALTER TABLE resources ADD COLUMN luxury NUMERIC(15, 2) DEFAULT 0');
    }

    // Prüfe ob alte Spalten existieren und migriere Daten
    const checkOldColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' 
      AND column_name IN ('clay', 'iron', 'wheat')
    `);

    const oldColumns = checkOldColumns.rows.map((r: any) => r.column_name);
    if (oldColumns.length > 0) {
      logger.info(`🔄 Migriere Daten von alten Spalten: ${oldColumns.join(', ')}`);

      if (oldColumns.includes('clay')) {
        logger.info('🔄 Migriere Daten von "clay" zu "stone"...');
        await query(`
          UPDATE resources 
          SET stone = COALESCE(clay, 750)
          WHERE stone IS NULL
        `);
      }

      if (oldColumns.includes('iron')) {
        logger.info('🔄 Migriere Daten von "iron" zu "water"...');
        await query(`
          UPDATE resources 
          SET water = COALESCE(iron, 750)
          WHERE water IS NULL
        `);
      }

      if (oldColumns.includes('wheat')) {
        logger.info('🔄 Migriere Daten von "wheat" zu "food"...');
        await query(`
          UPDATE resources 
          SET food = COALESCE(wheat, 750)
          WHERE food IS NULL
        `);
      }
    }

    // Setze NOT NULL Constraints (nur wenn Spalten bereits existieren)
    const finalCheck = await query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'resources' 
      AND column_name IN ('stone', 'water', 'food', 'luxury')
    `);

    for (const col of finalCheck.rows) {
      if (col.is_nullable === 'YES') {
        logger.info(`🔒 Setze NOT NULL Constraint für "${col.column_name}"...`);
        try {
          await query(`ALTER TABLE resources ALTER COLUMN ${col.column_name} SET NOT NULL`);
        } catch (error: any) {
          // Ignoriere Fehler wenn Constraint nicht gesetzt werden kann (z.B. wegen NULL-Werten)
          logger.warn(`⚠️ Konnte NOT NULL Constraint für "${col.column_name}" nicht setzen:`, error.message);
        }
      }
    }

    logger.info('✅ Resources Tabelle Migration abgeschlossen');
  } catch (error: any) {
    // Fehler loggen, aber Server nicht abstürzen lassen
    logger.error('❌ Fehler bei der resources Tabelle Migration:', error.message);
    logger.error('⚠️ Server startet trotzdem, aber Registrierung könnte fehlschlagen');
  }
}
