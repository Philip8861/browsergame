import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';

interface Client {
  ws: WebSocket;
  userId?: number;
  villageId?: number;
}

/**
 * WebSocket Server Setup
 * Bereit für Echtzeit-Updates (Ressourcen, Gebäude-Upgrades, etc.)
 */
export function setupWebSocket(wss: WebSocketServer): void {
  const clients = new Map<WebSocket, Client>();

  wss.on('connection', (ws: WebSocket) => {
    logger.info('Neue WebSocket-Verbindung');
    clients.set(ws, { ws });

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleMessage(ws, data, clients);
      } catch (error) {
        logger.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', error);
        ws.send(JSON.stringify({ error: 'Ungültige Nachricht' }));
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket-Verbindung geschlossen');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket-Fehler:', error);
      clients.delete(ws);
    });

    // Willkommensnachricht
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket-Verbindung hergestellt',
    }));
  });

  logger.info('WebSocket Server initialisiert');
}

/**
 * Verarbeite eingehende WebSocket-Nachrichten
 */
function handleMessage(
  ws: WebSocket,
  data: any,
  clients: Map<WebSocket, Client>
): void {
  const client = clients.get(ws);
  if (!client) return;

  switch (data.type) {
    case 'subscribe':
      // Benutzer abonniert Updates für ein Dorf
      if (data.villageId) {
        client.villageId = data.villageId;
        ws.send(JSON.stringify({
          type: 'subscribed',
          villageId: data.villageId,
        }));
      }
      break;

    case 'ping':
      // Heartbeat
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      ws.send(JSON.stringify({ error: 'Unbekannter Nachrichtentyp' }));
  }
}

/**
 * Broadcast Nachricht an alle Clients eines Dorfes
 */
export function broadcastToVillage(
  wss: WebSocketServer,
  villageId: number,
  message: any
): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Hier würde man die Client-Informationen aus einem Store holen
      // Für jetzt senden wir an alle verbundenen Clients
      client.send(JSON.stringify(message));
    }
  });
}




