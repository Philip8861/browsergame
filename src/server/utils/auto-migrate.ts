import { query } from './database-wrapper';
import { logger } from './logger';

/**
 * Automatische Migration: Führt alle notwendigen Tabellen-Erstellungen aus
 * Wird beim Serverstart ausgeführt, wenn PostgreSQL verwendet wird
 */
export async function runAutoMigrations(): Promise<void> {
  // Nur für PostgreSQL ausführen
  if (process.env.DB_TYPE === 'sqlite') {
    return; // SQLite hat bereits die Migrationen in initDatabase()
  }

  try {
    logger.info('🔧 Prüfe Datenbank-Schema...');

    // Prüfe ob users Tabelle existiert
    const usersTableExists = await checkTableExists('users');
    if (!usersTableExists) {
      logger.info('➕ Erstelle users Tabelle...');
      await createUsersTable();
    }

    // Prüfe ob villages Tabelle existiert
    const villagesTableExists = await checkTableExists('villages');
    if (!villagesTableExists) {
      logger.info('➕ Erstelle villages Tabelle...');
      await createVillagesTable();
    }

    // Prüfe ob resources Tabelle existiert
    const resourcesTableExists = await checkTableExists('resources');
    if (!resourcesTableExists) {
      logger.info('➕ Erstelle resources Tabelle...');
      await createResourcesTable();
    }

    // Prüfe ob buildings Tabelle existiert
    const buildingsTableExists = await checkTableExists('buildings');
    if (!buildingsTableExists) {
      logger.info('➕ Erstelle buildings Tabelle...');
      await createBuildingsTable();
    }

    // Prüfe ob pgmigrations Tabelle existiert (für node-pg-migrate)
    const pgmigrationsTableExists = await checkTableExists('pgmigrations');
    if (!pgmigrationsTableExists) {
      logger.info('➕ Erstelle pgmigrations Tabelle...');
      await createPgmigrationsTable();
    }

    logger.info('✅ Automatische Migrationen abgeschlossen');
  } catch (error: any) {
    logger.error('❌ Fehler bei automatischer Migration:', error.message);
    logger.error('⚠️ Server startet trotzdem, aber Registrierung könnte fehlschlagen');
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0]?.exists === true;
  } catch (error: any) {
    logger.error(`Fehler beim Prüfen der Tabelle ${tableName}:`, error.message);
    return false;
  }
}

async function createUsersTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
}

async function createVillagesTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS villages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      x INTEGER NOT NULL DEFAULT 0,
      y INTEGER NOT NULL DEFAULT 0,
      population INTEGER NOT NULL DEFAULT 2,
      points INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_villages_user_id ON villages(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_villages_coords ON villages(x, y)`);
}

async function createResourcesTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS resources (
      village_id INTEGER PRIMARY KEY REFERENCES villages(id) ON DELETE CASCADE,
      wood NUMERIC(15, 2) NOT NULL DEFAULT 750,
      clay NUMERIC(15, 2) NOT NULL DEFAULT 750,
      iron NUMERIC(15, 2) NOT NULL DEFAULT 750,
      wheat NUMERIC(15, 2) NOT NULL DEFAULT 750,
      stone NUMERIC(15, 2) DEFAULT 750,
      water NUMERIC(15, 2) DEFAULT 750,
      food NUMERIC(15, 2) DEFAULT 750,
      luxury NUMERIC(15, 2) DEFAULT 0,
      last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_resources_village_id ON resources(village_id)`);
}

async function createBuildingsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS buildings (
      id SERIAL PRIMARY KEY,
      village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      building_type VARCHAR(50) NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      position INTEGER NOT NULL,
      upgrade_finishes_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(village_id, building_type, position)
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_buildings_village_id ON buildings(village_id)`);
}

async function createPgmigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS pgmigrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
