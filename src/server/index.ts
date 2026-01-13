import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { migrateResourcesTable } from './utils/migrate-resources';
import { migrateVillagesTable } from './utils/migrate-villages';

// Lade Umgebungsvariablen
dotenv.config();

// Führe automatische Migrationen beim Serverstart aus
// Warte kurz, damit die Datenbankverbindung initialisiert werden kann
setImmediate(async () => {
  try {
    // Warte zusätzlich, damit die Datenbankverbindung bereit ist
    await new Promise(resolve => setTimeout(resolve, 1000));
    await migrateResourcesTable();
    await migrateVillagesTable();
  } catch (error: any) {
    logger.error('❌ Fehler bei automatischer Migration:', error);
    // Server trotzdem starten
  }
});

const app = express();
const PORT = process.env.PORT || 5000;
const WS_PORT = parseInt(process.env.WS_PORT || '5001', 10);

// Middleware
// CORS Konfiguration für Production und Mobile Apps
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

// Mobile App Origins hinzufügen falls gesetzt
if (process.env.MOBILE_APP_ORIGINS) {
  const mobileOrigins = process.env.MOBILE_APP_ORIGINS.split(',').map(origin => origin.trim());
  corsOrigins.push(...mobileOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Erlaube Requests ohne Origin (z.B. Mobile Apps, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Erlaube localhost mit beliebigem Port für Development
    if (process.env.NODE_ENV === 'development') {
      const localhostPattern = /^http:\/\/localhost:\d+$/;
      if (localhostPattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Prüfe ob Origin erlaubt ist
    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`CORS-Fehler: Origin ${origin} nicht erlaubt. Erlaubte Origins:`, corsOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
try {
  setupRoutes(app);
  logger.info('✅ Routes erfolgreich geladen');
} catch (error: any) {
  logger.error('❌ Fehler beim Setup der Routes:', error);
  logger.error('Fehler-Details:', {
    message: error?.message,
    stack: error?.stack
  });
  // Server trotzdem starten, damit Fehler sichtbar werden
  // Füge eine Fallback-Route hinzu
  app.use('/api/*', (req, res) => {
    logger.error('Fallback-Route aufgerufen für:', req.path);
    res.status(500).json({ 
      error: 'Server-Fehler: Routes konnten nicht geladen werden',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      path: req.path
    });
  });
}

// Statische Dateien für Frontend (Production) - NACH API Routes
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const distPath = path.join(__dirname, '../../dist/client');
  
  // Statische Assets (CSS, JS, Bilder, etc.)
  app.use(express.static(distPath, {
    maxAge: '1y', // Cache für 1 Jahr
    etag: true,
  }));
  
  // Alle anderen Routes zum Frontend (SPA Fallback) - MUSS ZULETZT sein
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  logger.info('✅ Statische Dateien aktiviert für Production');
}

// Error Handler (muss am Ende stehen)
app.use(errorHandler);

// Unhandled Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  logger.error('Promise:', promise);
});

// Uncaught Exception Handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Server nicht beenden, damit Fehler sichtbar bleiben
});

// HTTP Server erstellen
const server = createServer(app);

// WebSocket Server
try {
  const wss = new WebSocketServer({ server, path: '/ws' });
  setupWebSocket(wss);
  logger.info('✅ WebSocket Server initialisiert');
} catch (error) {
  logger.error('❌ Fehler beim Initialisieren des WebSocket Servers:', error);
  // Server trotzdem starten
}

// Server starten
try {
  server.listen(PORT, () => {
    logger.info(`🚀 Server läuft auf Port ${PORT}`);
    logger.info(`📡 WebSocket Server bereit auf Port ${WS_PORT}`);
    logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`💾 DB_TYPE: ${process.env.DB_TYPE || 'postgresql'}`);
    logger.info(`✅ Server bereit für Requests`);
  });
  
  server.on('error', (error: any) => {
    logger.error('❌ Server-Fehler:', error);
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} ist bereits belegt!`);
      logger.error(`💡 Beende den Prozess auf Port ${PORT} oder ändere PORT in .env`);
    } else {
      logger.error('❌ Unbekannter Server-Fehler:', error);
    }
  });
  
  server.on('listening', () => {
    logger.info(`✅ Server hört auf Port ${PORT}`);
  });
  
  server.on('close', () => {
    logger.info('⚠️ Server wurde geschlossen');
  });
} catch (error: any) {
  logger.error('❌ Fehler beim Starten des Servers:', error);
  logger.error('Fehler-Details:', {
    message: error?.message,
    stack: error?.stack
  });
  // Nicht sofort beenden, damit Fehler sichtbar bleiben
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}

export default app;

