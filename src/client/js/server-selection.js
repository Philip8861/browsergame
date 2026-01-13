import { api } from './api.js';

/**
 * Server-Selection Manager - Verwaltet die Server-Auswahl für Spieler
 */
class ServerSelectionManager {
  constructor() {
    this.selectedServerId = localStorage.getItem('selectedServerId');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const closeBtn = document.getElementById('server-selection-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideServerSelection();
      });
    }
  }

  async showServerSelection() {
    try {
      const servers = await api.getActiveServers();
      const modal = document.getElementById('server-selection-modal');
      const list = document.getElementById('servers-selection-list');

      if (!modal || !list) return;

      if (servers.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 2rem;">Keine aktiven Server verfügbar.</p>';
      } else {
        list.innerHTML = servers.map(server => {
          const settings = server.settings || {};
          return `
          <div class="server-selection-item" data-server-id="${server.id}">
            <h4>${server.name}</h4>
            <p>${server.description || 'Keine Beschreibung'}</p>
            <div style="font-size: 0.85rem; margin-top: 0.5rem; color: rgba(255, 255, 255, 0.6);">
              <p>Gestartet: ${new Date(server.start_date).toLocaleString('de-DE')}</p>
              <div style="margin-top: 0.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
                <div>⚡ Spielgeschwindigkeit: ${settings.gameSpeed || 1.0}x</div>
                <div>🏃 Laufgeschwindigkeit: ${settings.movementSpeed || 1.0}x</div>
                <div>💎 Loot-Chance: ${((settings.lootChance || 0.1) * 100).toFixed(0)}%</div>
                <div>💰 Händler-Kurs: ${settings.traderRate || 1.0}x</div>
              </div>
            </div>
          </div>
        `;
        }).join('');

        // Event Listeners für Server-Auswahl
        list.querySelectorAll('.server-selection-item').forEach(item => {
          item.addEventListener('click', () => {
            const serverId = parseInt(item.dataset.serverId, 10);
            this.selectServer(serverId);
          });
        });
      }

      modal.classList.remove('hidden');
    } catch (error) {
      console.error('Fehler beim Laden der Server:', error);
      alert('Fehler beim Laden der Server: ' + error.message);
    }
  }

  hideServerSelection() {
    const modal = document.getElementById('server-selection-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  async selectServer(serverId) {
    this.selectedServerId = serverId;
    localStorage.setItem('selectedServerId', serverId.toString());
    this.hideServerSelection();
    
    // Prüfe ob Spieler bereits ein Dorf auf diesem Server hat
    try {
      const villages = await api.getVillages();
      const villageOnServer = villages.find(v => v.server_id === serverId);
      
      if (!villageOnServer) {
        // Erstelle erstes Dorf auf diesem Server
        await this.createFirstVillage(serverId);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen/Erstellen des Dorfes:', error);
    }
    
    // Event auslösen, dass Server ausgewählt wurde
    window.dispatchEvent(new CustomEvent('serverSelected', { detail: { serverId } }));
    
    // Weiter zum Spiel
    const { authManager } = await import('./auth.js');
    authManager.showGameContainer();
  }
  
  async createFirstVillage(serverId) {
    try {
      // Hole Server-Info für Namen
      const server = await api.getServerById(serverId);
      const username = (await import('./auth.js')).authManager.currentUser?.username || 'Spieler';
      
      // Erstelle Dorf auf dem Server
      // Die Position wird vom Server berechnet
      const response = await fetch('/api/villages/create-on-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ serverId: parseInt(serverId, 10) })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen des Dorfes');
      }
      
      const data = await response.json();
      console.log('Dorf erstellt:', data);
    } catch (error) {
      console.error('Fehler beim Erstellen des ersten Dorfes:', error);
      alert('Fehler beim Erstellen deines ersten Dorfes auf diesem Kontinent. Bitte versuche es erneut.');
    }
  }

  getSelectedServerId() {
    return this.selectedServerId ? parseInt(this.selectedServerId, 10) : null;
  }
}

// Exportiere Singleton-Instanz
export const serverSelectionManager = new ServerSelectionManager();

