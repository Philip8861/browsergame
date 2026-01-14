import { query } from '../utils/database-wrapper';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  last_login?: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

/**
 * User Model - Datenbankoperationen für Benutzer
 */
export class UserModel {
  /**
   * Erstelle einen neuen Benutzer
   */
  static async create(userData: CreateUserData): Promise<User> {
    try {
      console.log('[UserModel] Erstelle Benutzer:', { username: userData.username, email: userData.email });
      const passwordHash = await bcrypt.hash(userData.password, 10);
      console.log('[UserModel] Passwort gehasht, DB_TYPE:', process.env.DB_TYPE);
      
      if (process.env.DB_TYPE === 'sqlite') {
        // SQLite: INSERT ohne RETURNING, dann SELECT
        console.log('[UserModel] Führe INSERT aus (SQLite)');
        const insertResult = await query(
          `INSERT INTO users (username, email, password_hash)
           VALUES (?, ?, ?)`,
          [userData.username, userData.email, passwordHash]
        );
        console.log('[UserModel] INSERT erfolgreich:', insertResult);
        
        // Hole den erstellten Benutzer zurück
        console.log('[UserModel] Hole erstellten Benutzer zurück');
        const result = await query(
          `SELECT id, username, email, created_at FROM users 
           WHERE username = ? AND email = ? 
           ORDER BY id DESC LIMIT 1`,
          [userData.username, userData.email]
        );
        console.log('[UserModel] SELECT Ergebnis:', result);
        
        if (Array.isArray(result)) {
          const user = result[0];
          console.log('[UserModel] Benutzer gefunden (Array):', user);
          if (!user) {
            throw new Error('Benutzer konnte nach INSERT nicht gefunden werden');
          }
          return user;
        }
        const user = result.rows?.[0];
        console.log('[UserModel] Benutzer gefunden (rows):', user);
        if (!user) {
          throw new Error('Benutzer konnte nach INSERT nicht gefunden werden');
        }
        return user;
      } else {
        // PostgreSQL: Mit RETURNING
        console.log('[UserModel] Führe INSERT aus (PostgreSQL)');
        const result = await query(
          `INSERT INTO users (username, email, password_hash)
           VALUES ($1, $2, $3)
           RETURNING id, username, email, created_at`,
          [userData.username, userData.email, passwordHash]
        );
        console.log('[UserModel] INSERT Ergebnis:', result);
        const user = result.rows?.[0];
        if (!user) {
          throw new Error('Benutzer konnte nach INSERT nicht gefunden werden');
        }
        return user;
      }
    } catch (error) {
      console.error('[UserModel] Fehler beim Erstellen des Benutzers:', error);
      throw error;
    }
  }

  /**
   * Finde Benutzer nach E-Mail
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (Array.isArray(result)) {
      return result[0] || null;
    }
    return result.rows?.[0] || null;
  }

  /**
   * Finde Benutzer nach Username
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      console.log('[UserModel] Suche Benutzer nach Username:', username, 'DB_TYPE:', process.env.DB_TYPE);
      const result = await query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM users WHERE username = ?'
          : 'SELECT * FROM users WHERE username = $1',
        [username]
      );
      console.log('[UserModel] Query Ergebnis:', result);
      if (Array.isArray(result)) {
        const user = result[0] || null;
        console.log('[UserModel] Benutzer gefunden (Array):', user);
        return user;
      }
      const user = result.rows?.[0] || null;
      console.log('[UserModel] Benutzer gefunden (rows):', user);
      return user;
    } catch (error: any) {
      console.error('[UserModel] Fehler beim Suchen nach Username:', error);
      console.error('[UserModel] Fehler-Message:', error?.message);
      console.error('[UserModel] Fehler-Code:', error?.code);
      console.error('[UserModel] Fehler-Stack:', error?.stack);
      // Wirf einen aussagekräftigeren Fehler
      const errorMessage = error?.message || 'Unbekannter Datenbankfehler';
      const dbError = new Error(`Datenbankfehler beim Suchen nach Benutzer: ${errorMessage}`);
      (dbError as any).originalError = error;
      throw dbError;
    }
  }

  /**
   * Finde Benutzer nach ID
   */
  static async findById(id: number): Promise<User | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?'
        : 'SELECT id, username, email, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    if (Array.isArray(result)) {
      return result[0] || null;
    }
    return result.rows?.[0] || null;
  }

  /**
   * Validiere Passwort
   */
  static async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Aktualisiere letzten Login
   */
  static async updateLastLogin(userId: number): Promise<void> {
    await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
        : 'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }
}

