import { authManager } from './auth.js';
import { initGame } from './game.js';
import { api, getCurrentIslandId } from './api.js';

// Import authManager für Token-Prüfung

/**
 * Haupt-Initialisierungslogik
 */
class GameApp {
  constructor() {
    this.resourceUpdateInterval = null;
    this.init();
  }

  async init() {
    // Warte auf erfolgreiche Authentifizierung
    if (authManager.getCurrentUser()) {
      await this.startGame();
    } else {
      // Prüfe periodisch ob User eingeloggt ist
      const checkInterval = setInterval(() => {
        if (authManager.getCurrentUser()) {
          clearInterval(checkInterval);
          this.startGame();
        }
      }, 500);
    }
  }

  async startGame() {
    console.log('Spiel wird gestartet...');

    // Zeige Dashboard statt alte Ansichten
    const mapView = document.getElementById('island-map-view');
    
    if (mapView) {
      mapView.classList.add('hidden');
    }

    // Initialisiere Karten-Viewport
    setTimeout(() => {
      import('./map-view.js').then(module => {
        module.initMapView();
      }).catch(err => {
        console.error('Fehler beim Laden der Karten-Ansicht:', err);
      });
    }, 200);

    // Initialisiere Menü
    setTimeout(() => {
      import('./menu.js').then(module => {
        module.initMenu();
        // Die initMenu() Funktion zeigt bereits die Insel-Ansicht an
      }).catch(err => {
        console.error('Fehler beim Laden des Menüs:', err);
      });
    }, 300);

    // Initialisiere Gebäude-Manager
    setTimeout(() => {
      import('./buildings.js').then(module => {
        module.initBuildings();
      }).catch(err => {
        console.error('Fehler beim Laden des Buildings-Managers:', err);
      });
    }, 400);

    // Starte Ressourcen-Updates
    this.startResourceUpdates();

    // Setup Event Listeners
    this.setupEventListeners();
  }

  startResourceUpdates() {
    // Update Ressourcen alle 5 Sekunden
    this.resourceUpdateInterval = setInterval(async () => {
      try {
        // Prüfe ob User eingeloggt ist und Token vorhanden ist
        if (!authManager.getCurrentUser() || !api.token) {
          return; // Überspringe Update wenn nicht eingeloggt
        }
        
        const currentIslandId = await getCurrentIslandId();
        if (currentIslandId) {
          const resources = await api.getResources(currentIslandId);
          this.updateResourceDisplay(resources);
        }
      } catch (error) {
        // Ignoriere Token-Fehler (User ist möglicherweise nicht eingeloggt)
        if (!error.message.includes('Token')) {
          console.error('Fehler beim Aktualisieren der Ressourcen:', error);
        }
      }
    }, 5000);

    // Prüfe regelmäßig, ob Spieler Inseln verloren hat
    this.checkIslandConquered();
  }

  async checkIslandConquered() {
    // Prüfe alle 10 Sekunden, ob Spieler noch Inseln hat
    setInterval(async () => {
      try {
        const { api } = await import('./api.js');
        const islands = await api.getVillages();
        
        // Wenn Spieler keine Inseln mehr hat, zeige Pop-Up
        if (islands.length === 0) {
          const modal = document.getElementById('island-conquered-modal');
          if (modal && !modal.classList.contains('shown')) {
            modal.classList.remove('hidden');
            modal.classList.add('shown');
            
            // Event Listener für Buttons
            const yesBtn = document.getElementById('restart-island-yes');
            const noBtn = document.getElementById('restart-island-no');
            
            if (yesBtn) {
              yesBtn.onclick = async () => {
                await this.restartIsland();
                modal.classList.add('hidden');
                modal.classList.remove('shown');
              };
            }
            
            if (noBtn) {
              noBtn.onclick = async () => {
                modal.classList.add('hidden');
                modal.classList.remove('shown');
                // Logge den Benutzer aus
                const { authManager } = await import('./auth.js');
                authManager.logout();
              };
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Prüfen der Inseln:', error);
      }
    }, 10000); // Alle 10 Sekunden
  }

  async restartIsland() {
    try {
      const { api } = await import('./api.js');
      
      // Erstelle ein neues Dorf
      const result = await api.createNewVillage();
      
      if (result && result.success && result.village) {
        const newVillage = result.village;
        
        // Setze neue Insel als aktuelle
        localStorage.setItem('currentIslandId', newVillage.id.toString());
        
        // Lade Inseln neu
        const { MenuManager } = await import('./menu.js');
        const menuManager = window.menuManagerInstance || window.menuManager;
        if (menuManager && menuManager.loadIslandsOverview) {
          await menuManager.loadIslandsOverview();
        }
        
        // Aktualisiere Ressourcen
        const resources = await api.getResources(newVillage.id);
        this.updateResourceDisplay(resources);
        
        // Aktualisiere Karte falls geladen
        const mapView = window.mapView;
        if (mapView && typeof mapView.loadPlayerIslands === 'function') {
          await mapView.loadPlayerIslands();
          if (typeof mapView.centerOnCurrentVillage === 'function') {
            await mapView.centerOnCurrentVillage();
          }
          if (typeof mapView.setZoom === 'function') {
            mapView.setZoom(1);
          }
          if (mapView.canvas && mapView.ctx && typeof mapView.updateView === 'function') {
            mapView.updateView();
          }
        }
        
        // Wechsle zur Insel-Ansicht
        if (menuManager && typeof menuManager.showIslandView === 'function') {
          menuManager.showIslandView();
          menuManager.switchMenu('island');
        }
        
        // Zeige Erfolgs-Meldung als schönes Pop-Up
        const { notificationManager } = await import('./notification.js');
        notificationManager.success(
          `Das neue Dorf "${newVillage.name}" wurde erstellt und auf der Karte platziert.`,
          '✅ Neues Dorf erstellt!'
        );
      } else {
        throw new Error('Fehler beim Erstellen des neuen Dorfes');
      }
    } catch (error) {
      console.error('Fehler beim Neustart:', error);
      // Zeige Fehler-Meldung als schönes Pop-Up
      const { notificationManager } = await import('./notification.js');
      notificationManager.error(`Fehler beim Erstellen eines neuen Dorfes: ${error.message || 'Unbekannter Fehler'}`);
    }
  }

  async updateResourceDisplay(resources) {
    if (resources) {
      // Aktualisiere Ressourcen auf der Startseite
      const woodEl = document.getElementById('resource-wood');
      const stoneEl = document.getElementById('resource-stone');
      const waterEl = document.getElementById('resource-water');
      const foodEl = document.getElementById('resource-food');
      const luxuryEl = document.getElementById('resource-luxury');
      
      // Produktionsrate-Elemente
      const woodRateEl = document.getElementById('resource-wood-rate');
      const stoneRateEl = document.getElementById('resource-stone-rate');
      const waterRateEl = document.getElementById('resource-water-rate');
      const foodRateEl = document.getElementById('resource-food-rate');
      const luxuryRateEl = document.getElementById('resource-luxury-rate');
      
      if (woodEl) woodEl.textContent = Math.floor(resources.wood || 0);
      if (stoneEl) stoneEl.textContent = Math.floor(resources.stone || 0);
      if (waterEl) waterEl.textContent = Math.floor(resources.water || 0);
      if (foodEl) foodEl.textContent = Math.floor(resources.food || 0);
      if (luxuryEl) luxuryEl.textContent = Math.floor(resources.luxury || 0);
      
      // Produktionsrate anzeigen (vorerst immer 0)
      const productionRate = 0; // TODO: Später aus resources.productionRate oder ähnlich holen
      if (woodRateEl) woodRateEl.textContent = `+${productionRate}`;
      if (stoneRateEl) stoneRateEl.textContent = `+${productionRate}`;
      if (waterRateEl) waterRateEl.textContent = `+${productionRate}`;
      if (foodRateEl) foodRateEl.textContent = `+${productionRate}`;
      if (luxuryRateEl) luxuryRateEl.textContent = `+${productionRate}`;
      
      // Aktualisiere auch über MenuManager für Bevölkerung und Pfeile
      const menuManager = window.menuManagerInstance || window.menuManager;
      if (menuManager && typeof menuManager.updateResourcesDisplay === 'function') {
        try {
          const { getCurrentIslandId } = await import('./api.js');
          const currentIslandId = await getCurrentIslandId();
          if (currentIslandId) {
            const { api } = await import('./api.js');
            const islandDetails = await api.getVillageDetails(currentIslandId);
            await menuManager.updateResourcesDisplay(resources, islandDetails.village);
          }
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Ressourcen über MenuManager:', error);
        }
      }
    }
  }

  setupEventListeners() {
    // Logout-Button ist bereits in auth.js gesetzt
    // Hier können weitere globale Event Listeners hinzugefügt werden
  }

  cleanup() {
    if (this.resourceUpdateInterval) {
      clearInterval(this.resourceUpdateInterval);
    }
  }
}

// Starte App wenn DOM geladen ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
  });
} else {
  new GameApp();
}

