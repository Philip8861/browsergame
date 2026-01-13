import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

/**
 * Erweitert Express Request um user Property
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    isAdmin?: boolean;
  };
}

/**
 * JWT Authentication Middleware
 * Validiert den Token und fügt User-Informationen zum Request hinzu
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Kein Token bereitgestellt' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET ist nicht gesetzt!');
    res.status(500).json({ error: 'Server-Konfigurationsfehler' });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      logger.warn('Token-Verifizierung fehlgeschlagen:', err.message);
      res.status(403).json({ error: 'Ungültiger oder abgelaufener Token' });
      return;
    }

    // Token ist gültig, User-Informationen zum Request hinzufügen
    req.user = decoded as { id: number; username: string; email: string; isAdmin?: boolean };
    next();
  });
};

/**
 * Admin Authentication Middleware
 * Prüft ob der Benutzer Admin-Rechte hat
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Nicht authentifiziert' });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ error: 'Admin-Rechte erforderlich' });
    return;
  }

  next();
};




