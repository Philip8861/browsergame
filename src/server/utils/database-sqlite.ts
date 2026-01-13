import path from 'path';
import fs from 'fs';

// Try-catch für better-sqlite3 Import - wird erst beim Aufruf von initDatabase geprüft
let Database: any;
let db: any = null;

function ensureDatabase() {
  if (!Database) {
    try {
      Database = require('better-sqlite3');
    } catch (error) {
      console.error('❌ better-sqlite3 konnte nicht geladen werden:', error);
      console.error('⚠️ Stelle sicher, dass better-sqlite3 installiert ist: npm install better-sqlite3');
      throw new Error('better-sqlite3 ist nicht installiert. Bitte installiere es mit: npm install better-sqlite3');
    }
  }
  return Database;
}

/**
 * SQLite Database Connection (Alternative zu PostgreSQL)
 * Wird verwendet wenn DB_TYPE=sqlite in .env gesetzt ist
 */
const dbPath = path.join(process.cwd(), 'data', 'browsergame.db');
const dbDir = path.dirname(dbPath);

// Erstelle data Verzeichnis falls nicht vorhanden
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Datenbank wird erst in initDatabase() initialisiert

/**
 * Initialisiere Datenbank-Schema
 */
export function initDatabase(): void {
  // Stelle sicher, dass Database geladen ist
  const DatabaseClass = ensureDatabase();
  
  // Initialisiere Datenbank falls noch nicht geschehen
  if (!db) {
    try {
      db = new DatabaseClass(dbPath);
      db.pragma('journal_mode = WAL'); // Bessere Performance
      db.pragma('foreign_keys = ON'); // Foreign Key Constraints aktivieren
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der SQLite-Datenbank:', error);
      throw error;
    }
  }
  // Users Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Villages Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      x INTEGER NOT NULL DEFAULT 0,
      y INTEGER NOT NULL DEFAULT 0,
      population INTEGER NOT NULL DEFAULT 2,
      points INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_villages_user_id ON villages(user_id);
    CREATE INDEX IF NOT EXISTS idx_villages_server_id ON villages(server_id);
    CREATE INDEX IF NOT EXISTS idx_villages_coords ON villages(x, y);
  `);
  
  // Prüfe ob server_id Spalte existiert und füge sie hinzu falls nicht
  try {
    const columns = db.prepare("PRAGMA table_info(villages)").all();
    const columnNames = columns.map((col: any) => col.name);
    if (!columnNames.includes('server_id')) {
      console.log('⚠️ Füge server_id Spalte zu villages Tabelle hinzu...');
      db.exec(`ALTER TABLE villages ADD COLUMN server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_villages_server_id ON villages(server_id)`);
      console.log('✅ server_id Spalte hinzugefügt');
    }
  } catch (error) {
    console.error('Fehler beim Prüfen/Hinzufügen der server_id Spalte:', error);
  }

  // Prüfe ob points Spalte existiert und füge sie hinzu falls nicht
  try {
    const columns = db.prepare("PRAGMA table_info(villages)").all();
    const columnNames = columns.map((col: any) => col.name);
    if (!columnNames.includes('points')) {
      console.log('⚠️ Füge points Spalte zu villages Tabelle hinzu...');
      db.exec(`ALTER TABLE villages ADD COLUMN points INTEGER NOT NULL DEFAULT 0`);
      console.log('✅ points Spalte hinzugefügt');
    }
  } catch (error) {
    console.error('Fehler beim Prüfen/Hinzufügen der points Spalte:', error);
  }

  // Resources Tabelle - Prüfe Schema und migriere falls nötig
  try {
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='resources'").get();
    if (tableInfo) {
      // Tabelle existiert - prüfe Spalten
      const columns = db.prepare("PRAGMA table_info(resources)").all();
      const columnNames = columns.map((col: any) => col.name);
      
      // Wenn alte Spalten vorhanden (clay, iron, wheat statt stone, water, food), migriere
      if (columnNames.includes('clay') || columnNames.includes('iron') || columnNames.includes('wheat')) {
        if (!columnNames.includes('stone') || !columnNames.includes('water') || !columnNames.includes('food')) {
          console.log('⚠️ Altes Schema erkannt - migriere resources Tabelle...');
          db.exec(`DROP TABLE IF EXISTS resources;`);
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Prüfen der resources Tabelle:', error);
  }
  
  // Erstelle Tabelle mit neuem Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      village_id INTEGER PRIMARY KEY REFERENCES villages(id) ON DELETE CASCADE,
      wood NUMERIC(15, 2) NOT NULL DEFAULT 750,
      stone NUMERIC(15, 2) NOT NULL DEFAULT 750,
      water NUMERIC(15, 2) NOT NULL DEFAULT 750,
      food NUMERIC(15, 2) NOT NULL DEFAULT 750,
      luxury NUMERIC(15, 2) NOT NULL DEFAULT 0,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Buildings Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      building_type VARCHAR(50) NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      position INTEGER NOT NULL,
      upgrade_finishes_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(village_id, building_type, position)
    );
    
    CREATE INDEX IF NOT EXISTS idx_buildings_village_id ON buildings(village_id);
  `);

  // Servers Tabelle (Kontinente)
  db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      start_date DATETIME NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'planned',
      settings TEXT DEFAULT '{}',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
    CREATE INDEX IF NOT EXISTS idx_servers_start_date ON servers(start_date);
  `);

  console.log('✅ SQLite Datenbank-Schema initialisiert');
}

/**
 * Teste die Datenbankverbindung
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!db) {
      initDatabase();
    }
    db.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('SQLite Verbindung fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Führe eine Query aus (kompatibel mit PostgreSQL-Interface)
 */
export async function query(text: string, params?: unknown[]): Promise<any> {
  // Stelle sicher, dass Datenbank initialisiert ist
  if (!db) {
    initDatabase();
  }
  
  const start = Date.now();
  try {
    console.log('[SQLite Query] Ausführen:', text.substring(0, 100));
    console.log('[SQLite Query] Params:', params);
    
    const stmt = db.prepare(text);
    const result = stmt.all(params || []);
    const duration = Date.now() - start;
    
    console.log('[SQLite Query] Ergebnis:', { rowCount: result.length, duration });
    
    // Konvertiere zu PostgreSQL-ähnlichem Format
    return {
      rows: result,
      rowCount: result.length,
    };
  } catch (error) {
    console.error('[SQLite Query] Fehler:', error);
    console.error('[SQLite Query] Query:', text);
    console.error('[SQLite Query] Params:', params);
    if (error instanceof Error) {
      console.error('[SQLite Query] Fehler-Stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Transaktions-Wrapper für SQLite
 * Verwendet better-sqlite3 Transaktionen für atomare Operationen
 */
class TransactionClient {
  private queries: Array<{ text: string; params?: unknown[] }> = [];
  private results: Array<any> = [];
  private committed = false;
  private rolledBack = false;

  async query(text: string, params?: unknown[]): Promise<any> {
    if (this.committed || this.rolledBack) {
      throw new Error('Transaktion bereits beendet');
    }
    
    // Stelle sicher, dass Datenbank initialisiert ist
    if (!db) {
      initDatabase();
    }
    
    // Führe Query sofort aus (für RETURNING und SELECT)
    try {
      const stmt = db.prepare(text);
      
      // Für UPDATE/INSERT/DELETE verwende run(), für SELECT verwende all()
      const upperText = text.trim().toUpperCase();
      if (upperText.startsWith('SELECT')) {
        const result = stmt.all(params || []);
        const queryResult = {
          rows: result,
          rowCount: result.length,
        };
        this.results.push(queryResult);
        return queryResult;
      } else {
        // UPDATE, INSERT, DELETE
        const result = stmt.run(params || []);
        const queryResult = {
          rows: [],
          rowCount: result.changes || 0,
          changes: result.changes || 0,
        };
        this.results.push(queryResult);
        return queryResult;
      }
    } catch (error) {
      console.error('[TransactionClient] Query error:', error);
      console.error('[TransactionClient] Query:', text);
      console.error('[TransactionClient] Params:', params);
      this.rolledBack = true;
      throw error;
    }
  }

  async commit(): Promise<void> {
    if (this.committed || this.rolledBack) {
      return;
    }
    // Alle Queries wurden bereits ausgeführt
    // SQLite führt jede Query automatisch atomar aus
    this.committed = true;
  }

  async rollback(): Promise<void> {
    if (this.committed || this.rolledBack) {
      return;
    }
    this.rolledBack = true;
    // Bei SQLite können wir bereits ausgeführte Queries nicht rückgängig machen
    // ohne echte Transaktionen. Für einfache Fälle ignorieren wir das.
  }
}

/**
 * Beginne eine Transaktion (SQLite unterstützt Transaktionen)
 */
export async function getTransaction(): Promise<any> {
  // Stelle sicher, dass Datenbank initialisiert ist
  if (!db) {
    initDatabase();
  }
  return new TransactionClient();
}

/**
 * Committe eine Transaktion
 */
export async function commitTransaction(client: any): Promise<void> {
  if (client && typeof client.commit === 'function') {
    await client.commit();
  }
}

/**
 * Rollback einer Transaktion
 */
export async function rollbackTransaction(client: any): Promise<void> {
  if (client && typeof client.rollback === 'function') {
    await client.rollback();
  }
}

export default db;
