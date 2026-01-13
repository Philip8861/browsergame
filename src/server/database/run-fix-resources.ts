import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function fixResourcesColumns() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'browsergame_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('🔧 Prüfe und füge fehlende Spalten zur resources Tabelle hinzu...');

    // Prüfe ob Spalten existieren
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' 
      AND column_name IN ('stone', 'water', 'food', 'luxury')
    `);

    const existingColumns = checkColumns.rows.map((r: any) => r.column_name);
    console.log('Vorhandene Spalten:', existingColumns);

    // Füge fehlende Spalten hinzu
    if (!existingColumns.includes('stone')) {
      console.log('➕ Füge Spalte "stone" hinzu...');
      await pool.query('ALTER TABLE resources ADD COLUMN stone NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('water')) {
      console.log('➕ Füge Spalte "water" hinzu...');
      await pool.query('ALTER TABLE resources ADD COLUMN water NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('food')) {
      console.log('➕ Füge Spalte "food" hinzu...');
      await pool.query('ALTER TABLE resources ADD COLUMN food NUMERIC(15, 2) DEFAULT 750');
    }

    if (!existingColumns.includes('luxury')) {
      console.log('➕ Füge Spalte "luxury" hinzu...');
      await pool.query('ALTER TABLE resources ADD COLUMN luxury NUMERIC(15, 2) DEFAULT 0');
    }

    // Prüfe ob alte Spalten existieren und migriere Daten
    const checkOldColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resources' 
      AND column_name IN ('clay', 'iron', 'wheat')
    `);

    const oldColumns = checkOldColumns.rows.map((r: any) => r.column_name);
    console.log('Alte Spalten gefunden:', oldColumns);

    if (oldColumns.includes('clay')) {
      console.log('🔄 Migriere Daten von "clay" zu "stone"...');
      await pool.query(`
        UPDATE resources 
        SET stone = COALESCE(clay, 750)
        WHERE stone IS NULL
      `);
    }

    if (oldColumns.includes('iron')) {
      console.log('🔄 Migriere Daten von "iron" zu "water"...');
      await pool.query(`
        UPDATE resources 
        SET water = COALESCE(iron, 750)
        WHERE water IS NULL
      `);
    }

    if (oldColumns.includes('wheat')) {
      console.log('🔄 Migriere Daten von "wheat" zu "food"...');
      await pool.query(`
        UPDATE resources 
        SET food = COALESCE(wheat, 750)
        WHERE food IS NULL
      `);
    }

    // Setze NOT NULL Constraints
    console.log('🔒 Setze NOT NULL Constraints...');
    await pool.query('ALTER TABLE resources ALTER COLUMN stone SET NOT NULL');
    await pool.query('ALTER TABLE resources ALTER COLUMN water SET NOT NULL');
    await pool.query('ALTER TABLE resources ALTER COLUMN food SET NOT NULL');
    await pool.query('ALTER TABLE resources ALTER COLUMN luxury SET NOT NULL');

    console.log('✅ Migration erfolgreich abgeschlossen!');
  } catch (error) {
    console.error('❌ Fehler bei der Migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixResourcesColumns()
  .then(() => {
    console.log('✨ Fertig!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fehler:', error);
    process.exit(1);
  });
