import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { VillageModel } from '../models/Village';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { query } from '../utils/database-wrapper';

/**
 * Registrierung eines neuen Benutzers
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validierung
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, E-Mail und Passwort sind erforderlich' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
      return;
    }

    // Prüfe ob Benutzer bereits existiert
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'E-Mail bereits registriert' });
      return;
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      res.status(409).json({ error: 'Username bereits vergeben' });
      return;
    }

    // Benutzer erstellen
    logger.info('Erstelle Benutzer...');
    const user = await UserModel.create({ username, email, password });
    logger.info('Benutzer erstellt:', { id: user.id, username: user.username });

    // Hole alle bestehenden Inseln für Positionsberechnung
    const allIslandsResult = await query(
      `SELECT x, y FROM villages`
    );
    const allIslands = Array.isArray(allIslandsResult) ? allIslandsResult : allIslandsResult.rows || [];
    
    // Berechne nächste freie Position im Kreis von der Mitte weg
    const fieldsX = 100;
    const fieldsY = 100;
    const worldCenterX = Math.floor(fieldsX / 2);
    const worldCenterY = Math.floor(fieldsY / 2);
    const minDistance = 3;
    
    let position = { x: worldCenterX, y: worldCenterY };
    if (allIslands.length > 0) {
      // Suche im Kreis von der Mitte weg
      let radius = minDistance;
      const maxRadius = Math.max(fieldsX, fieldsY);
      let found = false;
      
      while (radius <= maxRadius && !found) {
        for (let angle = 0; angle < 360; angle += 15) {
          const rad = (angle * Math.PI) / 180;
          const x = Math.round(worldCenterX + radius * Math.cos(rad));
          const y = Math.round(worldCenterY + radius * Math.sin(rad));
          
          if (x >= 0 && x < fieldsX && y >= 0 && y < fieldsY) {
            let isValid = true;
            for (const island of allIslands) {
              const distance = Math.abs(island.x - x) + Math.abs(island.y - y);
              if (distance < minDistance) {
                isValid = false;
                break;
              }
            }
            
            if (isValid) {
              position = { x, y };
              found = true;
              break;
            }
          }
        }
        radius++;
      }
    }

    // Erstelle automatisch das erste Dorf für den neuen Benutzer
    logger.info('Erstelle erstes Dorf für Benutzer:', { userId: user.id, username: user.username });
    const villageName = `${user.username}s Insel`;
    const village = await VillageModel.create(
      user.id,
      villageName,
      position.x,
      position.y
    );
    logger.info('Dorf erstellt:', { villageId: village.id, name: village.name, x: village.x, y: village.y });

    // JWT Token generieren
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET nicht konfiguriert');
    }

    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn }
    );

    res.status(201).json({
      message: 'Registrierung erfolgreich',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      village: {
        id: village.id,
        name: village.name,
        x: village.x,
        y: village.y,
      },
    });
  } catch (error) {
    logger.error('Registrierungsfehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Fehlerdetails:', errorMessage);
    logger.error('Fehler-Stack:', errorStack);
    
    // Immer Details zurückgeben für besseres Debugging
    res.status(500).json({ 
      error: 'Registrierung fehlgeschlagen',
      details: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    });
  }
};

/**
 * Login eines bestehenden Benutzers
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Login-Versuch:', { username: req.body.username });
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
      return;
    }

    // Benutzer finden (nach Username statt Email)
    logger.info('Suche Benutzer:', { username });
    const user = await UserModel.findByUsername(username);
    if (!user) {
      logger.warn('Benutzer nicht gefunden:', { username });
      res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      return;
    }
    logger.info('Benutzer gefunden:', { id: user.id, username: user.username });

    // Passwort validieren
    logger.info('Validiere Passwort...');
    const isValidPassword = await UserModel.validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Ungültiges Passwort:', { username });
      res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      return;
    }
    logger.info('Passwort gültig');

    // Last login aktualisieren
    logger.info('Aktualisiere Last Login...');
    await UserModel.updateLastLogin(user.id);

    // JWT Token generieren
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET nicht konfiguriert');
    }

    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    logger.info('Generiere JWT Token...');
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn }
    );
    logger.info('Login erfolgreich:', { userId: user.id, username: user.username });

    res.json({
      message: 'Login erfolgreich',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Login-Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Fehlerdetails:', errorMessage);
    logger.error('Fehler-Stack:', errorStack);
    
    // Immer Details zurückgeben für besseres Debugging
    res.status(500).json({ 
      error: 'Login fehlgeschlagen',
      details: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    });
  }
};

/**
 * Hole aktuellen Benutzer (benötigt Auth)
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'Benutzer nicht gefunden' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      last_login: user.last_login,
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen des Benutzers:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Benutzerdaten' });
  }
};

