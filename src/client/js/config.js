/**
 * Konfiguration für API-URLs
 * Verwendet automatisch die aktuelle Domain (funktioniert lokal und auf Railway)
 */

// Verwende relative URLs - funktioniert immer auf der gleichen Domain
// Wenn die Seite auf Railway läuft, verwendet sie automatisch die Railway-URL
// Wenn die Seite lokal läuft, verwendet sie localhost
export const API_BASE_URL = '/api';

// WebSocket URL basierend auf aktueller Domain
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

export const WS_BASE_URL = getWebSocketUrl();

console.log('🌐 API Konfiguration:', { 
  API_BASE_URL, 
  WS_BASE_URL,
  currentOrigin: window.location.origin 
});
