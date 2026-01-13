import dotenv from 'dotenv';

dotenv.config();

/**
 * Unified Database Wrapper
 * Unterstützt sowohl PostgreSQL als auch SQLite
 */
const dbType = process.env.DB_TYPE || 'postgresql';

let dbModule: any;

try {
  if (dbType === 'sqlite') {
    // SQLite verwenden
    try {
      // Prüfe ob better-sqlite3 verfügbar ist
      try {
        require.resolve('better-sqlite3');
      } catch (resolveError) {
        console.error('❌ better-sqlite3 Modul nicht gefunden!');
        console.error('⚠️ Installiere es mit: npm install better-sqlite3');
        console.error('⚠️ Oder verwende DB_TYPE=mock oder DB_TYPE=postgresql');
        throw new Error('better-sqlite3 nicht installiert');
      }
      
      const sqliteDb = require('./database-sqlite');
      sqliteDb.initDatabase();
      console.log('✅ SQLite Datenbank initialisiert');
      dbModule = sqliteDb;
    } catch (sqliteError: any) {
      console.error('❌ Fehler beim Laden von SQLite:', sqliteError?.message || sqliteError);
      console.error('⚠️ Fallback zu Mock-Datenbank');
      dbModule = require('./database-mock');
      console.log('✅ Mock-Datenbank als Fallback aktiviert');
    }
  } else if (dbType === 'mock') {
    // Mock-Datenbank verwenden (für Tests ohne PostgreSQL)
    dbModule = require('./database-mock');
    console.log('✅ Mock-Datenbank aktiviert');
  } else {
    // PostgreSQL verwenden (Standard)
    try {
      dbModule = require('./database');
      console.log('✅ PostgreSQL Datenbank-Modul geladen');
    } catch (pgError: any) {
      console.error('❌ Fehler beim Laden von PostgreSQL:', pgError?.message || pgError);
      console.error('⚠️ Fallback zu Mock-Datenbank');
      dbModule = require('./database-mock');
      console.log('✅ Mock-Datenbank als Fallback aktiviert');
    }
  }
} catch (error: any) {
  console.error('❌ Kritischer Fehler beim Laden der Datenbank:', error?.message || error);
  console.error('⚠️ Verwende Mock-Datenbank als letzten Fallback');
  try {
    dbModule = require('./database-mock');
    console.log('✅ Mock-Datenbank als Fallback aktiviert');
  } catch (mockError) {
    console.error('❌ KRITISCH: Auch Mock-Datenbank konnte nicht geladen werden!');
    throw error;
  }
}

// Exportiere die gleichen Funktionen wie database.ts
export const query = dbModule.query;
export const testConnection = dbModule.testConnection;
export const getTransaction = dbModule.getTransaction;
export const commitTransaction = dbModule.commitTransaction;
export const rollbackTransaction = dbModule.rollbackTransaction;

export default dbModule;
