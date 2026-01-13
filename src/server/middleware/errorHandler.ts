import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Globaler Error Handler Middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('=== Unbehandelter Fehler ===');
  logger.error('Fehler-Objekt:', err);
  logger.error('Fehler-Details:', {
    message: err?.message,
    stack: err?.stack,
    name: err?.name,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Standard Error Response
  const statusCode = (err as any)?.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Ein Fehler ist aufgetreten'
    : err?.message || 'Unbekannter Fehler';

  // Stelle sicher, dass eine Antwort gesendet wird
  if (!res.headersSent) {
    try {
      res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err?.stack,
          name: err?.name,
          details: String(err)
        }),
      });
      logger.info('Fehler-Response gesendet');
    } catch (responseError) {
      logger.error('Fehler beim Senden der Fehler-Response:', responseError);
      // Fallback: Versuche einfache Text-Antwort
      try {
        res.status(statusCode).send(`Fehler: ${message}`);
      } catch (e) {
        logger.error('Konnte keine Antwort senden:', e);
      }
    }
  } else {
    logger.error('Response bereits gesendet, kann keine Fehlerantwort senden');
  }
};




