import dotenv from 'dotenv';

dotenv.config();

/**
 * Database Factory - Wählt die richtige Datenbank-Implementierung
 */
const dbType = process.env.DB_TYPE || 'postgresql';

if (dbType === 'sqlite') {
  // SQLite verwenden
  const sqliteDb = require('./database-sqlite');
  sqliteDb.initDatabase();
  console.log('✅ SQLite Datenbank initialisiert');
  module.exports = sqliteDb;
} else {
  // PostgreSQL verwenden (Standard)
  module.exports = require('./database');
}

