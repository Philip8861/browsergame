import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Führt das setup.sql Script direkt aus
 * Nützlich wenn node-pg-migrate Probleme macht
 */
async function setupDatabase() {
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'browsergame_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };

  const pool = new Pool(poolConfig);

  try {
    console.log('🔌 Verbinde mit Datenbank...');
    const client = await pool.connect();
    console.log('✅ Verbunden!');

    // Lese SQL-Datei
    const sqlPath = path.join(__dirname, 'setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Führe SQL-Setup aus...');
    await client.query(sql);
    console.log('✅ Datenbank-Setup erfolgreich abgeschlossen!');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Fehler beim Datenbank-Setup:', error);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
