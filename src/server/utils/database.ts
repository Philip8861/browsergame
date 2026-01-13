import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Connection Pool
 * Optimiert für Production mit Connection Pooling
 * Unterstützt Railway DATABASE_URL und einzelne Umgebungsvariablen
 */
const poolConfig = process.env.DATABASE_URL
  ? {
      // Railway / Heroku / andere Cloud-Provider verwenden DATABASE_URL
      connectionString: process.env.DATABASE_URL,
      // SSL für Production-Datenbanken (Railway benötigt SSL)
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Connection Pool Settings
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
    }
  : {
      // Einzelne Umgebungsvariablen für lokale Entwicklung
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'browsergame_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      // Connection Pool Settings
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
      // SSL für Production (z.B. bei Cloud-Datenbanken)
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

// Event Handler für Connection Pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // In Production: Hier könntest du einen Monitoring-Service benachrichtigen
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Neue Datenbankverbindung etabliert');
  }
});

/**
 * Teste die Datenbankverbindung
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Datenbankverbindung fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Führe eine Query aus
 */
export async function query(text: string, params?: unknown[]): Promise<any> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error:', error);
    // In Production: Logge Fehler, aber gib keine Details preis
    if (process.env.NODE_ENV === 'production') {
      console.error('Database query failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: text.substring(0, 100), // Nur ersten 100 Zeichen loggen
      });
    }
    throw error;
  }
}

/**
 * Beginne eine Transaktion
 */
export async function getTransaction(): Promise<PoolClient> {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
}

/**
 * Committe eine Transaktion
 */
export async function commitTransaction(client: PoolClient): Promise<void> {
  await client.query('COMMIT');
  client.release();
}

/**
 * Rollback einer Transaktion
 */
export async function rollbackTransaction(client: PoolClient): Promise<void> {
  await client.query('ROLLBACK');
  client.release();
}


export default pool;

