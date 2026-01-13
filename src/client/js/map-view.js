/**
 * Island Escape - Karten-Viewport mit Drag-Navigation
 * 
 * Verwaltet die interne Kartenlogik mit Variablen für:
 * - Weltgröße (worldWidth, worldHeight)
 * - Viewport-Position (viewX, viewY)
 * - Drag-Navigation
 */

class MapView {
  constructor() {
    // Basis-Feldgröße: 150px × 150px (bei Zoom-Level 1)
    this.baseFieldSize = 150; // 150px pro Feld (Basis)
    
    // Aktuelle Feldgröße (ändert sich je nach Zoom-Level)
    this.fieldSize = 150; // Wird beim Zoom angepasst
    
    // Anzahl der Felder (10.000 Felder insgesamt)
    this.fieldsX = 100; // 100 Felder horizontal
    this.fieldsY = 100; // 100 Felder vertikal
    
    // Viewport-Größe (konstant)
    this.baseViewportSize = 750; // 750px × 750px (konstant)
    
    // Gesamtgröße der Karte (Welt) basierend auf Basis-Feldgröße
    this.worldWidth = this.fieldsX * this.baseFieldSize;  // 15000px (100 Felder × 150px)
    this.worldHeight = this.fieldsY * this.baseFieldSize;  // 15000px (100 Felder × 150px)
    
    // Hintergrundbild-Originalgröße (wird beim Laden gesetzt)
    this.backgroundImageWidth = 0;
    this.backgroundImageHeight = 0;
    
    // Aktuelle Position des Viewports (sichtbarer Bereich)
    this.viewX = 0; // X-Position der Karte, die sichtbar ist
    this.viewY = 0; // Y-Position der Karte, die sichtbar ist
    
    // Canvas-Referenz
    this.canvas = null;
    this.ctx = null;
    
    // Viewport-Größe (wird beim Initialisieren gesetzt)
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    
    // Drag-State
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartViewX = 0;
    this.dragStartViewY = 0;
    
    // Hintergrund-Bild
    this.backgroundImage = null;
    this.backgroundLoaded = false;
    
    // Insel-Bild
    this.islandImage = null;
    this.islandLoaded = false;
    
    // Spieler-Inseln (Array von {x, y, playerId, username, villageName})
    this.playerIslands = [];
    
    // Insel-Info-Panel State
    this.hoveredIsland = null;
    this.selectedIsland = null; // Ausgewählte Insel (beim Klick)
    this.islandNotes = {}; // Speichert Notizen lokal (key: "x-y")
    
    // Zentrum der Welt (Mitte) - intern 0-basiert
    this.worldCenterX = Math.floor(this.fieldsX / 2);
    this.worldCenterY = Math.floor(this.fieldsY / 2);
    
    // Gesamtanzahl der Felder
    this.totalFields = this.fieldsX * this.fieldsY; // 10.000 Felder
    this.fieldsPerContinent = 100; // 100 Felder = 1 Kontinent (10×10)
    this.continentsPerSide = 10; // 10 Kontinente pro Seite
    
    // Zoom-System
    this.zoomLevel = 1; // Aktueller Zoom-Level (1-10)
    this.zoomLevels = {
      1: 16,     // 4×4 Felder
      2: 32,     // ~5.66×5.66 Felder
      3: 64,     // 8×8 Felder
      4: 128,    // ~11.3×11.3 Felder
      5: 256,    // 16×16 Felder
      6: 512,    // ~22.6×22.6 Felder
      7: 1000,   // ~31.6×31.6 Felder
      8: 2000,   // ~44.7×44.7 Felder
      9: 5000,   // ~70.7×70.7 Felder
      10: 10000  // ~100×100 Felder
    };
    
    this.init();
  }
  
  async init() {
    // Lade Hintergrund-Bild
    this.loadBackground();
    
    // Lade Insel-Bild
    this.loadIslandImage();
    
    // Lade Spieler-Inseln vom Server
    await this.loadPlayerIslands();
    
    // Zentriere Karte auf aktuellem Dorf
    await this.centerOnCurrentVillage();
    
    // Setze Zoom auf 1 beim ersten Laden
    this.setZoom(1);
    
    // Warte kurz, damit DOM bereit ist
    setTimeout(() => {
      this.updateViewportSize(); // Setze initiale Viewport-Größe basierend auf Zoom-Level
      this.setupCanvas();
      this.setupEventListeners();
      // Stelle sicher, dass die Karte sofort gerendert wird
      this.updateView();
    }, 100);
  }
  
  loadBackground() {
    // Lade das Asset karte-background.png (nur als Hintergrund, nicht für Feldgröße)
    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.backgroundLoaded = true;
      
      // Speichere Originalgröße des Bildes (nur für Anzeige)
      this.backgroundImageWidth = this.backgroundImage.width;
      this.backgroundImageHeight = this.backgroundImage.height;
      
      // Feldgröße bleibt bei 5px (5mm) - wird nicht vom Bild beeinflusst
      // Weltgröße ist bereits basierend auf Feldgröße berechnet
      
      // Aktualisiere Viewport-Position wenn Canvas bereits initialisiert
      if (this.canvas && this.ctx) {
        // Viewport-Größe sollte bereits gesetzt sein, aber sicherstellen
        if (this.viewportWidth === 0 || this.viewportHeight === 0) {
          this.updateViewportSize();
          const rect = this.canvas.getBoundingClientRect();
          this.viewportWidth = rect.width;
          this.viewportHeight = rect.height;
        }
        // Zentriere Viewport auf aktuellem Dorf (falls noch nicht gesetzt)
        if (this.viewX === 0 && this.viewY === 0) {
          this.centerOnCurrentVillage();
        }
        this.clampView();
        this.updateView();
      }
    };
    this.backgroundImage.onerror = () => {
      console.warn('Hintergrund-Bild konnte nicht geladen werden:', '/assets/karte-background.png');
      this.backgroundLoaded = false;
      // Feldgröße bleibt unverändert bei 5px
    };
    this.backgroundImage.src = '/assets/karte-background.png';
  }
  
  loadIslandImage() {
    // Lade das Insel-Bild
    this.islandImage = new Image();
    this.islandImage.onload = () => {
      this.islandLoaded = true;
      if (this.canvas && this.ctx) {
        this.updateView();
      }
    };
    this.islandImage.onerror = () => {
      console.warn('Insel-Bild konnte nicht geladen werden:', '/assets/Insel.png');
      this.islandLoaded = false;
    };
    this.islandImage.src = '/assets/Insel.png';
  }
  
  async loadPlayerIslands() {
    try {
      // Lade Spieler-Inseln vom Server
      const response = await fetch('/api/players/islands');
      if (response.ok) {
        const data = await response.json();
        this.playerIslands = (data.islands || []).map(island => ({
          ...island,
          villageId: island.villageId || island.id, // Stelle sicher, dass villageId vorhanden ist
          villageName: island.villageName || island.name || 'Unbenannte Insel' // Stelle sicher, dass villageName vorhanden ist
        }));
        
        // Aktualisiere selectedIsland falls gesetzt (z.B. nach Namensänderung)
        if (this.selectedIsland) {
          const selectedVillageId = this.selectedIsland.villageId || this.selectedIsland.id;
          const updatedIsland = this.playerIslands.find(
            island => (island.villageId || island.id) === selectedVillageId
          );
          if (updatedIsland) {
            this.selectedIsland = updatedIsland;
            // Aktualisiere das Info-Panel mit den neuen Daten (behalte Position)
            const panel = document.getElementById('island-info-panel');
            if (panel && !panel.classList.contains('hidden')) {
              // Aktualisiere nur den Inhalt, nicht die Position
              const islandNameEl = document.getElementById('island-info-name');
              if (islandNameEl) {
                islandNameEl.textContent = updatedIsland.villageName || updatedIsland.name || 'Unbenannte Insel';
              }
              const pointsEl = document.getElementById('island-info-points');
              if (pointsEl) {
                const points = updatedIsland.points !== undefined ? updatedIsland.points : 0;
                pointsEl.textContent = `⭐ Punkte: ${points}`;
              }
              // Aktualisiere auch selectedIsland für zukünftige Referenzen
              this.selectedIsland = updatedIsland;
            }
          }
        }
        
        // Aktualisiere auch hoveredIsland falls gesetzt
        if (this.hoveredIsland) {
          const hoveredVillageId = this.hoveredIsland.villageId || this.hoveredIsland.id;
          const updatedIsland = this.playerIslands.find(
            island => (island.villageId || island.id) === hoveredVillageId
          );
          if (updatedIsland) {
            this.hoveredIsland = updatedIsland;
          }
        }
        
        // Lade gespeicherte Notizen aus localStorage
        this.loadIslandNotes();
        
        if (this.canvas && this.ctx) {
          this.updateView();
        }
      } else {
        console.warn('Spieler-Inseln konnten nicht geladen werden');
        // Fallback: Leeres Array
        this.playerIslands = [];
      }
    } catch (error) {
      console.error('Fehler beim Laden der Spieler-Inseln:', error);
      this.playerIslands = [];
    }
  }
  
  async centerOnCurrentVillage() {
    try {
      // Stelle sicher, dass Viewport-Größe gesetzt ist
      if (this.viewportWidth === 0 || this.viewportHeight === 0) {
        this.viewportWidth = this.baseViewportSize;
        this.viewportHeight = this.baseViewportSize;
      }
      
      // Hole aktuelle Insel-ID aus localStorage
      const currentIslandId = localStorage.getItem('currentIslandId');
      if (!currentIslandId) {
        // Wenn keine aktuelle Insel, verwende die erste verfügbare
        if (this.playerIslands.length > 0) {
          const firstIsland = this.playerIslands[0];
          this.centerOnIsland(firstIsland.x, firstIsland.y);
          return;
        }
        // Fallback: Zentriere auf Kartenmitte
        this.viewX = (this.worldWidth - this.viewportWidth) / 2;
        this.viewY = (this.worldHeight - this.viewportHeight) / 2;
        return;
      }
      
      // Finde die aktuelle Insel in playerIslands
      const currentIsland = this.playerIslands.find(
        island => (island.villageId || island.id) === parseInt(currentIslandId, 10)
      );
      
      if (currentIsland) {
        this.centerOnIsland(currentIsland.x, currentIsland.y);
      } else {
        // Fallback: Zentriere auf erste verfügbare Insel oder Kartenmitte
        if (this.playerIslands.length > 0) {
          const firstIsland = this.playerIslands[0];
          this.centerOnIsland(firstIsland.x, firstIsland.y);
        } else {
          this.viewX = (this.worldWidth - this.viewportWidth) / 2;
          this.viewY = (this.worldHeight - this.viewportHeight) / 2;
        }
      }
    } catch (error) {
      console.error('Fehler beim Zentrieren auf aktuelle Insel:', error);
      // Fallback: Zentriere auf Kartenmitte
      if (this.viewportWidth === 0 || this.viewportHeight === 0) {
        this.viewportWidth = this.baseViewportSize;
        this.viewportHeight = this.baseViewportSize;
      }
      this.viewX = (this.worldWidth - this.viewportWidth) / 2;
      this.viewY = (this.worldHeight - this.viewportHeight) / 2;
    }
  }
  
  centerOnIsland(x, y) {
    // Konvertiere Insel-Koordinaten zu Welt-Koordinaten
    const fieldSize = this.fieldSize || this.baseFieldSize;
    const targetWorldX = x * fieldSize;
    const targetWorldY = y * fieldSize;
    
    // Stelle sicher, dass Viewport-Größe gesetzt ist
    if (this.viewportWidth === 0 || this.viewportHeight === 0) {
      this.viewportWidth = this.baseViewportSize;
      this.viewportHeight = this.baseViewportSize;
    }
    
    // Zentriere die Insel im Viewport
    this.viewX = targetWorldX - (this.viewportWidth / 2) + (fieldSize / 2);
    this.viewY = targetWorldY - (this.viewportHeight / 2) + (fieldSize / 2);
    
    // Begrenze auf Karten-Grenzen
    this.clampView();
  }
  
  findNextIslandPosition() {
    // Finde die nächste freie Position im Kreis von der Mitte weg
    const minDistance = 3; // Mindestabstand zwischen Spielern
    
    // Wenn noch keine Inseln vorhanden, beginne in der Mitte
    if (this.playerIslands.length === 0) {
      return { x: this.worldCenterX, y: this.worldCenterY };
    }
    
    // Suche im Kreis von der Mitte weg
    let radius = minDistance;
    const maxRadius = Math.max(this.fieldsX, this.fieldsY);
    
    while (radius <= maxRadius) {
      // Berechne alle Positionen auf diesem Radius
      const positions = this.getCirclePositions(radius);
      
      for (const pos of positions) {
        // Prüfe ob Position gültig ist
        if (pos.x >= 0 && pos.x < this.fieldsX && 
            pos.y >= 0 && pos.y < this.fieldsY) {
          
          // Prüfe ob Mindestabstand zu allen anderen Inseln eingehalten wird
          let isValid = true;
          for (const island of this.playerIslands) {
            const distance = Math.abs(island.x - pos.x) + Math.abs(island.y - pos.y);
            if (distance < minDistance) {
              isValid = false;
              break;
            }
          }
          
          if (isValid) {
            return pos;
          }
        }
      }
      
      radius++;
    }
    
    // Falls keine Position gefunden, gib null zurück
    return null;
  }
  
  loadIslandNotes() {
    // Lade Notizen aus localStorage
    try {
      const savedNotes = localStorage.getItem('islandNotes');
      if (savedNotes) {
        this.islandNotes = JSON.parse(savedNotes);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Insel-Notizen:', error);
      this.islandNotes = {};
    }
  }
  
  saveIslandNote(x, y, note) {
    // Speichere Notiz lokal
    const key = `${x}-${y}`;
    if (note && note.trim()) {
      this.islandNotes[key] = note.trim();
    } else {
      delete this.islandNotes[key];
    }
    
    // Speichere in localStorage
    try {
      localStorage.setItem('islandNotes', JSON.stringify(this.islandNotes));
    } catch (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
    }
  }
  
  getIslandNote(x, y) {
    // Hole Notiz für Insel
    const key = `${x}-${y}`;
    return this.islandNotes[key] || '';
  }
  
  // Konvertiere interne Koordinaten (0-99) zu Anzeige-Koordinaten (1-100)
  getDisplayCoordinates(x, y) {
    const displayX = x + 1;
    const displayY = y + 1;
    return { x: displayX, y: displayY };
  }
  
  // Konvertiere Anzeige-Koordinaten (1-100) zu internen Koordinaten (0-99)
  getInternalCoordinates(displayX, displayY) {
    const x = displayX - 1;
    const y = displayY - 1;
    return { x, y };
  }
  
  // Berechne Feldnummer (1-10.000)
  getFieldNumber(x, y) {
    // x und y sind intern 0-basiert
    return (y * this.fieldsX) + x + 1;
  }
  
  // Berechne Kontinent-Nummer (1-100)
  getContinent(x, y) {
    // x und y sind intern 0-basiert
    const continentX = Math.floor(x / 10);
    const continentY = Math.floor(y / 10);
    return (continentY * this.continentsPerSide) + continentX + 1;
  }
  
  // Berechne relative Position innerhalb des Kontinents (1-10)
  getContinentPosition(x, y) {
    // x und y sind intern 0-basiert
    const continentLocalX = (x % 10) + 1;
    const continentLocalY = (y % 10) + 1;
    return { x: continentLocalX, y: continentLocalY };
  }
  
  // Formatiere Koordinaten-Anzeige: "Kontinent X, x Y, y Z" oder "Feld 1234"
  formatCoordinates(x, y, includeFieldNumber = true) {
    const continent = this.getContinent(x, y);
    const continentPos = this.getContinentPosition(x, y);
    const displayCoords = this.getDisplayCoordinates(x, y);
    
    if (includeFieldNumber) {
      const fieldNumber = this.getFieldNumber(x, y);
      return `Feld ${fieldNumber} (Kontinent ${continent}, x ${continentPos.x}, y ${continentPos.y})`;
    } else {
      return `Kontinent ${continent}, x ${continentPos.x}, y ${continentPos.y}`;
    }
  }
  
  getIslandAtPosition(mouseX, mouseY) {
    // Finde Insel an Mausposition
    if (!this.canvas || !this.islandImage || !this.islandLoaded) return null;
    
    const fieldSize = this.fieldSize;
    const islandSize = fieldSize * 0.9;
    const offsetX = (fieldSize - islandSize) / 2;
    const offsetY = (fieldSize - islandSize) / 2;
    
    // Prüfe alle Inseln
    for (const island of this.playerIslands) {
      const islandCanvasX = (island.x * fieldSize) - this.viewX + offsetX;
      const islandCanvasY = (island.y * fieldSize) - this.viewY + offsetY;
      
      // Prüfe ob Maus über Insel ist
      if (mouseX >= islandCanvasX && mouseX <= islandCanvasX + islandSize &&
          mouseY >= islandCanvasY && mouseY <= islandCanvasY + islandSize) {
        return island;
      }
    }
    
    return null;
  }
  
  // Konvertiere Mausposition zu Feld-Koordinaten
  getFieldCoordinatesFromMouse(mouseX, mouseY) {
    if (!this.canvas) return null;
    
    // Berechne Feld-Koordinaten basierend auf Viewport-Position und Zoom
    const worldX = this.viewX + mouseX;
    const worldY = this.viewY + mouseY;
    
    // Konvertiere zu Feld-Koordinaten (0-basiert intern)
    const fieldX = Math.floor(worldX / this.fieldSize);
    const fieldY = Math.floor(worldY / this.fieldSize);
    
    // Konvertiere zu Anzeige-Koordinaten (1-basiert)
    const displayCoords = this.getDisplayCoordinates(fieldX, fieldY);
    
    return {
      x: displayCoords.x,
      y: displayCoords.y,
      fieldX: fieldX,
      fieldY: fieldY
    };
  }
  
  // Aktualisiere Koordinaten-Anzeige
  updateCoordinates(mouseX, mouseY) {
    const coordsEl = document.getElementById('map-coords-text');
    if (!coordsEl) return;
    
    const coords = this.getFieldCoordinatesFromMouse(mouseX, mouseY);
    if (coords) {
      // Prüfe ob Koordinaten innerhalb der Karte sind
      if (coords.fieldX >= 0 && coords.fieldX < this.fieldsX && 
          coords.fieldY >= 0 && coords.fieldY < this.fieldsY) {
        coordsEl.textContent = `X: ${coords.x}, Y: ${coords.y}`;
        const container = document.getElementById('map-coordinates');
        if (container) {
          container.classList.remove('hidden');
        }
      } else {
        coordsEl.textContent = `X: -, Y: -`;
      }
    }
  }
  
  // Verstecke Koordinaten-Anzeige
  hideCoordinates() {
    const container = document.getElementById('map-coordinates');
    if (container) {
      container.classList.add('hidden');
    }
  }
  
  async showIslandInfo(island, mouseX, mouseY, isClick = false) {
    // Zeige Info-Panel für Insel
    const panel = document.getElementById('island-info-panel');
    if (!panel) return;
    
    // Hole aktuelle Daten aus playerIslands falls vorhanden (für aktualisierte Namen)
    const villageId = island.villageId || island.id;
    const currentIslandData = this.playerIslands.find(
      i => (i.villageId || i.id) === villageId
    );
    // Verwende aktualisierte Daten falls vorhanden, sonst die übergebenen Daten
    const islandData = currentIslandData || island;
    
    this.hoveredIsland = islandData;
    
    // Wenn geklickt, setze als ausgewählte Insel (Panel bleibt geöffnet)
    if (isClick) {
      this.selectedIsland = islandData;
    }
    
    // Berechne Feldnummer (y * fieldsX + x + 1) - y zuerst, dann x
    const fieldNumber = (islandData.y * this.fieldsX) + islandData.x + 1;
    
    // Zeige Feldnummer
    const fieldNumberEl = document.getElementById('island-info-field-number');
    if (fieldNumberEl) {
      fieldNumberEl.textContent = `Feld: ${fieldNumber}`;
    }
    
    // Zeige Inselname (immer aus den aktuellsten Daten) - groß oben
    const islandNameEl = document.getElementById('island-info-name');
    if (islandNameEl) {
      islandNameEl.textContent = islandData.villageName || islandData.name || 'Unbenannte Insel';
    }
    
    // Zeige Spielername - kleiner darunter
    const playerNameEl = document.getElementById('island-info-player');
    if (playerNameEl) {
      playerNameEl.textContent = islandData.username || `Spieler ${islandData.playerId}`;
    }
    
    // Zeige Punkte
    const pointsEl = document.getElementById('island-info-points');
    if (pointsEl) {
      const points = islandData.points !== undefined ? islandData.points : 0;
      pointsEl.textContent = `⭐ Punkte: ${points}`;
    }
    
    // Prüfe ob Insel dem aktuellen Spieler gehört
    try {
      // Hole aktuelle Benutzer-ID
      const authModule = await import('./auth.js');
      const currentUserId = authModule.authManager?.currentUser?.id;
      const villageId = islandData.villageId || islandData.id;
      const isOwnIsland = currentUserId && islandData.playerId === currentUserId;
      
      // Zeige/Verstecke "Insel betreten" Button (nur für eigene Inseln)
      const enterBtn = document.querySelector('.island-action-enter');
      if (enterBtn) {
        if (isOwnIsland && villageId) {
          enterBtn.style.display = 'flex';
          enterBtn.dataset.villageId = villageId.toString();
        } else {
          enterBtn.style.display = 'none';
        }
      }
      
      // Zeige/Verstecke "Erobern" Button (nur für fremde Inseln)
      const conquerBtn = document.querySelector('.island-action-conquer');
      if (conquerBtn) {
        if (!isOwnIsland && villageId) {
          conquerBtn.style.display = 'flex';
          conquerBtn.dataset.villageId = villageId.toString();
        } else {
          conquerBtn.style.display = 'none';
        }
      }
      
      // Zeige/Verstecke "Angreifen" Button (nur für fremde Inseln)
      const attackBtn = document.querySelector('.island-action-btn[data-action="attack"]');
      if (attackBtn) {
        if (!isOwnIsland) {
          attackBtn.style.display = 'flex';
        } else {
          attackBtn.style.display = 'none';
        }
      }
      
      // Zeige/Verstecke "Nachricht" und "Handeln" Buttons (immer sichtbar für fremde Inseln)
      const messageBtn = document.querySelector('.island-action-btn[data-action="message"]');
      const tradeBtn = document.querySelector('.island-action-btn[data-action="trade"]');
      if (messageBtn) {
        messageBtn.style.display = isOwnIsland ? 'none' : 'flex';
      }
      if (tradeBtn) {
        tradeBtn.style.display = isOwnIsland ? 'none' : 'flex';
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Besitzers:', error);
    }
    
    // Lade Notiz
    const noteTextarea = document.getElementById('island-info-note-text');
    if (noteTextarea) {
      noteTextarea.value = this.getIslandNote(islandData.x, islandData.y);
    }
    
    // Positioniere Panel
    const rect = this.canvas.getBoundingClientRect();
    const panelX = rect.left + mouseX + 20;
    const panelY = rect.top + mouseY - 10;
    
    // Stelle sicher, dass Panel nicht außerhalb des Bildschirms ist
    const panelWidth = 300; // Feste Panel-Breite (25% größer: 240 * 1.25)
    const estimatedHeight = 350; // Geschätzte Panel-Höhe (25% größer: 280 * 1.25)
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - estimatedHeight;
    const finalX = Math.min(panelX, maxX);
    const finalY = Math.max(10, Math.min(panelY, maxY));
    
    panel.style.left = finalX + 'px';
    panel.style.top = finalY + 'px';
    
    // Zeige Panel
    panel.classList.remove('hidden');
  }
  
  hideIslandInfo() {
    // Verstecke Info-Panel nur wenn keine Insel ausgewählt ist
    if (this.selectedIsland) {
      return; // Panel bleibt sichtbar wenn Insel ausgewählt
    }
    
    const panel = document.getElementById('island-info-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
    this.hoveredIsland = null;
  }
  
  closeIslandInfo() {
    // Schließe Panel komplett (beim Klick außerhalb)
    const panel = document.getElementById('island-info-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
    this.hoveredIsland = null;
    this.selectedIsland = null;
  }
  
  setupIslandInfoPanel() {
    // Event-Listener für Panel
    const panel = document.getElementById('island-info-panel');
    if (!panel) return;
    
    // Schließen-Button
    const closeBtn = panel.querySelector('.island-info-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeIslandInfo();
      });
    }
    
    // Verhindere, dass Klicks im Panel das Panel schließen
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Notiz speichern
    const saveNoteBtn = panel.querySelector('.island-note-save-btn');
    const noteTextarea = document.getElementById('island-info-note-text');
    if (saveNoteBtn && noteTextarea) {
      saveNoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const island = this.selectedIsland || this.hoveredIsland;
        if (island) {
          this.saveIslandNote(island.x, island.y, noteTextarea.value);
          saveNoteBtn.textContent = '✅ Gespeichert!';
          setTimeout(() => {
            saveNoteBtn.textContent = '💾 Speichern';
          }, 1500);
        }
      });
    }
    
    // Erobern-Button wird jetzt über handleIslandAction behandelt
    // (kein separater Event-Handler nötig, da alle Action-Buttons über handleIslandAction gehen)
  }
  
  async handleConquerIsland(villageId) {
    console.log('handleConquerIsland aufgerufen mit villageId:', villageId);
    
    if (!villageId || isNaN(villageId)) {
      console.error('❌ Ungültige villageId:', villageId);
      alert('Fehler: Ungültige Insel-ID. Bitte versuche es erneut.');
      return;
    }
    
    try {
      const { api } = await import('./api.js');
      
      // Zeige Lade-Indikator
      const conquerBtn = document.querySelector('.island-action-conquer');
      const originalText = conquerBtn ? conquerBtn.textContent : '⚔️ Erobern';
      
      if (conquerBtn) {
        conquerBtn.disabled = true;
        conquerBtn.textContent = '⏳ Erobere...';
      }
      
      try {
        console.log('📡 Sende Erobern-Anfrage für villageId:', villageId);
        
        // Erobere die Insel
        const result = await api.conquerIsland(villageId);
        
        console.log('📥 Erobern-API-Antwort erhalten:', result);
        console.log('📥 Antwort-Typ:', typeof result);
        console.log('📥 success:', result?.success);
        console.log('📥 village:', result?.village);
        
        // Prüfe ob Erfolg (API gibt success: true zurück)
        if (result && (result.success === true || result.village)) {
          // Erfolg: Zeige Erfolgs-Meldung
          const islandName = result.village?.name || 'Insel';
          // Zeige Erfolgs-Meldung als schönes Pop-Up
          const { notificationManager } = await import('./notification.js');
          notificationManager.success(
            `Die Insel "${islandName}" gehört jetzt dir.`,
            '✅ Insel erfolgreich erobert!'
          );
          
          // Aktualisiere die Karte - lade Spieler-Inseln neu, damit die eroberte Insel dem neuen Besitzer zugeordnet wird
          console.log('🗺️ Aktualisiere Karte...');
          await this.loadPlayerIslands(); // Lade Spieler-Inseln neu
          // Aktualisiere die Karten-Ansicht
          if (this.canvas && this.ctx) {
            this.updateView();
          }
          
          // Aktualisiere die Insel-Übersicht falls sie geöffnet ist
          const menuManager = window.menuManager;
          if (menuManager) {
            if (menuManager.currentMenu === 'islands-overview') {
              console.log('🏖️ Aktualisiere Insel-Übersicht...');
              await menuManager.loadIslandsOverview();
            }
          }
          
          // Schließe das Info-Panel
          this.closeIslandInfo();
          
          // Setze die eroberte Insel als aktuelle Insel
          if (result.village && result.village.id) {
            console.log('🔄 Wechsle zur eroberten Insel:', result.village.id);
            await this.switchToIsland(result.village.id);
          }
        } else {
          const errorMsg = result?.error || 'Erobern fehlgeschlagen';
          console.error('❌ Erobern fehlgeschlagen:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('❌ Fehler beim Erobern der Insel:', error);
        const errorMessage = error.message || error.toString() || 'Unbekannter Fehler';
        alert(`❌ Fehler beim Erobern: ${errorMessage}`);
      } finally {
        if (conquerBtn) {
          conquerBtn.disabled = false;
          conquerBtn.textContent = originalText;
        }
      }
    } catch (error) {
      console.error('❌ Kritischer Fehler beim Erobern der Insel:', error);
        // Zeige Fehler-Meldung als schönes Pop-Up
        const { notificationManager } = await import('./notification.js');
        notificationManager.error(`Fehler beim Erobern: ${error.message || 'Unbekannter Fehler'}`);
    }
  }
  
  async switchToIsland(islandId) {
    try {
      // Verwende die MenuManager-Funktion zum Wechseln
      const menuManager = window.menuManagerInstance || window.menuManager;
      if (menuManager && typeof menuManager.switchToIsland === 'function') {
        await menuManager.switchToIsland(islandId);
      } else {
        // Fallback: Direkte Implementierung
        localStorage.setItem('currentIslandId', islandId.toString());
        
        // Lade die Insel-Daten neu
        const { api } = await import('./api.js');
        const resources = await api.getResources(islandId);
        const islandDetails = await api.getVillageDetails(islandId);
        
        // Aktualisiere die Ressourcen-Anzeige
        const gameApp = window.gameApp;
        if (gameApp && gameApp.updateResourceDisplay) {
          gameApp.updateResourceDisplay(resources);
        }
        
        // Lade Gebäude neu
        setTimeout(() => {
          import('./buildings.js').then(module => {
            module.initBuildings();
          }).catch(err => {
            console.error('Fehler beim Laden der Gebäude:', err);
          });
        }, 100);
      }
      
      console.log(`✅ Zu Insel ${islandId} gewechselt`);
    } catch (error) {
      console.error('Fehler beim Wechseln zur Insel:', error);
        const { notificationManager } = await import('./notification.js');
        notificationManager.error(`Fehler beim Wechseln zur Insel: ${error.message || 'Unbekannter Fehler'}`);
    }
  }
  
  // Kompass-Navigation entfernt - nicht mehr benötigt
  
  async handleIslandAction(action, island) {
    // Behandle Aktionen für Insel
    console.log(`Aktion "${action}" für Insel bei (${island.x}, ${island.y})`);
    
    switch (action) {
      case 'enter':
        // Insel betreten - wechsle zur Startseite der Insel
        const enterVillageId = island.villageId || island.id;
        if (enterVillageId) {
          console.log('🏝️ Insel betreten für villageId:', enterVillageId);
          // Verwende MenuManager zum Wechseln
          const menuManager = window.menuManagerInstance || window.menuManager;
          if (menuManager && typeof menuManager.switchToIsland === 'function') {
            await menuManager.switchToIsland(parseInt(enterVillageId, 10));
          } else {
            // Fallback: Setze nur die Insel-ID
            localStorage.setItem('currentIslandId', enterVillageId.toString());
          }
          // Schließe die Karte
          this.closeMap();
        } else {
          console.error('❌ Keine villageId für Insel betreten gefunden');
          const { notificationManager } = await import('./notification.js');
          notificationManager.error('Fehler: Keine Insel-ID gefunden. Bitte versuche es erneut.');
        }
        break;
      case 'conquer':
        // Erobern-Funktion
        const villageId = island.villageId || island.id;
        if (villageId) {
          console.log('⚔️ Erobern-Aktion für villageId:', villageId);
          await this.handleConquerIsland(parseInt(villageId, 10));
        } else {
          console.error('❌ Keine villageId für Erobern gefunden');
          const { notificationManager } = await import('./notification.js');
          notificationManager.error('Fehler: Keine Insel-ID gefunden. Bitte versuche es erneut.');
        }
        break;
      case 'message':
        const { notificationManager } = await import('./notification.js');
        notificationManager.info(`Nachricht an ${island.username || 'Spieler'} senden (noch nicht implementiert)`, 'Nachricht');
        break;
      case 'attack':
        const { notificationManager: nm1 } = await import('./notification.js');
        nm1.info(`Insel von ${island.username || 'Spieler'} angreifen (noch nicht implementiert)`, 'Angriff');
        break;
      case 'trade':
        const { notificationManager: nm2 } = await import('./notification.js');
        nm2.info(`Mit ${island.username || 'Spieler'} handeln (noch nicht implementiert)`, 'Handel');
        break;
      default:
        console.warn('Unbekannte Aktion:', action);
    }
  }
  
  setupIslandInfoPanel() {
    // Event-Listener für Panel
    const panel = document.getElementById('island-info-panel');
    if (!panel) return;
    
    // Verhindere, dass Klicks im Panel das Panel schließen
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Notiz automatisch speichern beim Verlassen des Textfelds (blur)
    const noteTextarea = document.getElementById('island-info-note-text');
    if (noteTextarea) {
      noteTextarea.addEventListener('blur', (e) => {
        const island = this.selectedIsland || this.hoveredIsland;
        if (island) {
          this.saveIslandNote(island.x, island.y, noteTextarea.value);
        }
      });
    }
    
    // Action-Buttons
    const actionButtons = panel.querySelectorAll('.island-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = e.target.dataset.action;
        const island = this.selectedIsland || this.hoveredIsland;
        if (island) {
          await this.handleIslandAction(action, island);
        }
      });
    });
    
    // Klick außerhalb des Panels schließt es automatisch (nur wenn nicht auf Canvas)
    document.addEventListener('click', (e) => {
      // Ignoriere Klicks im Panel selbst
      if (panel && panel.contains(e.target)) {
        return;
      }
      
      // Ignoriere Klicks auf Canvas (werden separat behandelt)
      if (this.canvas && this.canvas.contains(e.target)) {
        return;
      }
      
      // Klick außerhalb von Panel und Canvas - schließe Panel automatisch
      this.closeIslandInfo();
    });
    
    // Mausbewegung auf Canvas für Hover-Detection (nur wenn keine Insel ausgewählt)
    if (this.canvas) {
      // Klick auf Canvas - prüfe ob auf Insel
      this.canvas.addEventListener('click', (e) => {
        // Verhindere dass Drag das Panel öffnet
        if (this.isDragging) {
          return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const island = this.getIslandAtPosition(mouseX, mouseY);
        if (island) {
          // Klick auf Insel - öffne Panel und lasse es geöffnet
          e.stopPropagation();
          this.showIslandInfo(island, mouseX, mouseY, true);
        } else {
          // Klick auf Canvas aber nicht auf Insel - schließe Panel
          this.closeIslandInfo();
        }
      });
      
      this.canvas.addEventListener('mousemove', async (e) => {
        if (this.isDragging) {
          // Während Drag nichts tun
          return;
        }
        
        // Wenn eine Insel ausgewählt ist, ignoriere Hover-Änderungen
        if (this.selectedIsland) {
          return; // Panel bleibt geöffnet, keine Hover-Änderungen
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const island = this.getIslandAtPosition(mouseX, mouseY);
        if (island) {
          // Nur Hover, kein Klick
          await this.showIslandInfo(island, mouseX, mouseY, false);
        } else {
          // Maus nicht über Insel - verstecke Panel (nur wenn nicht ausgewählt)
          this.hideIslandInfo();
        }
      });
      
    }
  }
  
  async handleIslandAction(action, island) {
    // Behandle Aktionen für Insel
    console.log(`Aktion "${action}" für Insel bei (${island.x}, ${island.y})`);
    
    switch (action) {
      case 'enter':
        // Insel betreten - wechsle zur Startseite der Insel
        const enterVillageId = island.villageId || island.id;
        if (enterVillageId) {
          console.log('🏝️ Insel betreten für villageId:', enterVillageId);
          // Verwende MenuManager zum Wechseln
          const menuManager = window.menuManagerInstance || window.menuManager;
          if (menuManager && typeof menuManager.switchToIsland === 'function') {
            await menuManager.switchToIsland(parseInt(enterVillageId, 10));
          } else {
            // Fallback: Setze nur die Insel-ID
            localStorage.setItem('currentIslandId', enterVillageId.toString());
          }
          // Schließe die Karte
          this.closeMap();
        } else {
          console.error('❌ Keine villageId für Insel betreten gefunden');
          const { notificationManager } = await import('./notification.js');
          notificationManager.error('Fehler: Keine Insel-ID gefunden. Bitte versuche es erneut.');
        }
        break;
      case 'conquer':
        // Erobern-Funktion
        const villageId = island.villageId || island.id;
        if (villageId) {
          console.log('⚔️ Erobern-Aktion für villageId:', villageId);
          await this.handleConquerIsland(parseInt(villageId, 10));
        } else {
          console.error('❌ Keine villageId für Erobern gefunden');
          const { notificationManager } = await import('./notification.js');
          notificationManager.error('Fehler: Keine Insel-ID gefunden. Bitte versuche es erneut.');
        }
        break;
      case 'message':
        const { notificationManager } = await import('./notification.js');
        notificationManager.info(`Nachricht an ${island.username || 'Spieler'} senden (noch nicht implementiert)`, 'Nachricht');
        break;
      case 'attack':
        const { notificationManager: nm1 } = await import('./notification.js');
        nm1.info(`Insel von ${island.username || 'Spieler'} angreifen (noch nicht implementiert)`, 'Angriff');
        break;
      case 'trade':
        const { notificationManager: nm2 } = await import('./notification.js');
        nm2.info(`Mit ${island.username || 'Spieler'} handeln (noch nicht implementiert)`, 'Handel');
        break;
      default:
        console.warn('Unbekannte Aktion:', action);
    }
  }
  
  getCirclePositions(radius) {
    // Generiere alle Positionen auf einem Kreis mit gegebenem Radius
    const positions = [];
    
    // Gehe im Kreis um die Mitte
    for (let angle = 0; angle < 360; angle += 15) { // 15 Grad Schritte für gleichmäßige Verteilung
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(this.worldCenterX + radius * Math.cos(rad));
      const y = Math.round(this.worldCenterY + radius * Math.sin(rad));
      positions.push({ x, y });
    }
    
    return positions;
  }
  
  async placeIslandForPlayer(playerId) {
    // Finde nächste freie Position
    const position = this.findNextIslandPosition();
    
    if (!position) {
      console.error('Keine freie Position für neue Insel gefunden');
      return null;
    }
    
    // Füge Insel zur lokalen Liste hinzu
    const island = { x: position.x, y: position.y, playerId };
    this.playerIslands.push(island);
    
    // Speichere auf Server
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/players/islands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ x: position.x, y: position.y })
      });
      
      if (!response.ok) {
        console.error('Fehler beim Speichern der Insel auf dem Server');
        // Entferne aus lokaler Liste bei Fehler
        this.playerIslands = this.playerIslands.filter(i => i.playerId !== playerId);
        return null;
      }
      
      const data = await response.json();
      // Aktualisiere mit Server-Daten
      const index = this.playerIslands.findIndex(i => i.playerId === playerId);
      if (index !== -1) {
        this.playerIslands[index] = {
          x: data.island.x,
          y: data.island.y,
          playerId: data.island.playerId
        };
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Insel:', error);
      // Entferne aus lokaler Liste bei Fehler
      this.playerIslands = this.playerIslands.filter(i => i.playerId !== playerId);
      return null;
    }
    
    // Aktualisiere Ansicht
    if (this.canvas && this.ctx) {
      this.updateView();
    }
    
    return island;
  }
  
  async drawIslands() {
    if (!this.ctx || !this.islandImage || !this.islandLoaded) return;
    if (this.viewportWidth === 0 || this.viewportHeight === 0) return;
    
    const fieldSize = this.fieldSize;
    if (fieldSize === 0) return;
    
    const islandSize = fieldSize * 0.9; // Insel ist etwas kleiner als das Feld (90%)
    
    // Hole aktuelle Benutzer-ID für Leuchteffekt
    let currentUserId = null;
    try {
      const authModule = await import('./auth.js');
      currentUserId = authModule.authManager?.currentUser?.id;
    } catch (error) {
      // Ignoriere Fehler, currentUserId bleibt null
    }
    
    for (const island of this.playerIslands) {
      // Berechne Position im Canvas
      const canvasX = (island.x * fieldSize) - this.viewX;
      const canvasY = (island.y * fieldSize) - this.viewY;
      
      // Nur zeichnen wenn sichtbar
      if (canvasX + islandSize > 0 && canvasX < this.viewportWidth &&
          canvasY + islandSize > 0 && canvasY < this.viewportHeight) {
        
        // Zeichne Insel zentriert im Feld
        const offsetX = (fieldSize - islandSize) / 2;
        const offsetY = (fieldSize - islandSize) / 2;
        const islandDrawX = canvasX + offsetX;
        const islandDrawY = canvasY + offsetY;
        
        // Zeichne Insel
        this.ctx.drawImage(
          this.islandImage,
          islandDrawX,
          islandDrawY,
          islandSize,
          islandSize
        );
      }
    }
  }
  
  setupCanvas() {
    this.canvas = document.getElementById('map-viewport');
    if (!this.canvas) {
      console.error('Canvas-Element nicht gefunden!');
      return;
    }
    
    // Berechne Viewport-Größe basierend auf aktuellem Zoom-Level
    this.updateViewportSize();
    
    // Setze Canvas-Größe basierend auf berechneter Viewport-Größe
    const rect = this.canvas.getBoundingClientRect();
    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;
    
    // Setze interne Canvas-Auflösung für High-DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.viewportWidth * dpr;
    this.canvas.height = this.viewportHeight * dpr;
    
    // CSS-Größe bleibt gleich
    this.canvas.style.width = this.viewportWidth + 'px';
    this.canvas.style.height = this.viewportHeight + 'px';
    
    // Context mit High-DPI-Skalierung
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    
    // Zentriere Viewport auf Kartenmitte (nur beim ersten Setup)
    // Weltgröße ist bereits basierend auf Feldgröße berechnet
    if (this.viewX === 0 && this.viewY === 0) {
      this.viewX = (this.worldWidth - this.viewportWidth) / 2;
      this.viewY = (this.worldHeight - this.viewportHeight) / 2;
      this.clampView();
    }
  }
  
  setupEventListeners() {
    if (!this.canvas) return;
    
    // Overlay-Klick schließt die Karte
    const overlay = document.querySelector('.map-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeMap();
      });
    }
    
    // ESC-Taste schließt die Karte
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const mapView = document.getElementById('island-map-view');
        if (mapView && !mapView.classList.contains('hidden')) {
          this.closeMap();
        }
      }
    });
    
    // mousedown → Beginn des Ziehens (speichere Maus-Startposition)
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      // Speichere Maus-Startposition
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      // Speichere aktuelle Viewport-Position
      this.dragStartViewX = this.viewX;
      this.dragStartViewY = this.viewY;
      // Ändere Cursor
      this.canvas.style.cursor = 'grabbing';
      // Verhindere Text-Selektion während Drag
      e.preventDefault();
    });
    
    // mousemove → während der Maustaste gedrückt ist, berechne Delta
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      // Berechne Delta (Bewegung der Maus)
      const deltaX = this.dragStartX - e.clientX;
      const deltaY = this.dragStartY - e.clientY;
      
      // Jede Mausbewegung verschiebt die Ansicht über die große Weltfläche:
      // viewX += deltaX (in umgekehrter Richtung, da wir die Karte bewegen)
      // viewY += deltaY
      this.viewX = this.dragStartViewX + deltaX;
      this.viewY = this.dragStartViewY + deltaY;
      
      // Begrenze auf Karten-Grenzen
      this.clampView();
      
      // Aktualisiere Ansicht sofort
      this.updateView();
    });
    
    // mouseup → Ziehen beenden
    document.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        // Setze Cursor zurück
        if (this.canvas) {
          this.canvas.style.cursor = 'grab';
        }
      }
    });
    
    // Touch-Unterstützung
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.isDragging = true;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.dragStartViewX = this.viewX;
      this.dragStartViewY = this.viewY;
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = this.dragStartX - touch.clientX;
      const deltaY = this.dragStartY - touch.clientY;
      this.viewX = this.dragStartViewX + deltaX;
      this.viewY = this.dragStartViewY + deltaY;
      this.clampView();
      this.updateView();
    });
    
    document.addEventListener('touchend', () => {
      this.isDragging = false;
    });
    
    // Resize-Handler
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
    
    // Zoom mit Mausrad
    // Nach unten scrollen = rauszoomen (mehr Felder), nach oben = reinzoomen (weniger Felder)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1; // Umgekehrte Richtung: nach unten = +1 (rauszoomen)
      this.changeZoom(delta);
    });
    
    // Zoom-Buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.changeZoom(1);
      });
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.changeZoom(-1);
      });
    }
    
    // Temporärer Test-Button für Spieler-Platzierung
    this.setupPlacePlayerButton();
    
    // Insel-Info-Panel Setup
    this.setupIslandInfoPanel();
    
    // Cursor-Style
    this.canvas.style.cursor = 'grab';
  }
  
  setupPlacePlayerButton() {
    const placePlayerBtn = document.getElementById('place-player-btn');
    if (!placePlayerBtn) return;
    
    placePlayerBtn.addEventListener('click', async () => {
      // Generiere eine zufällige Test-Spieler-ID
      const testPlayerId = Date.now(); // Eindeutige ID basierend auf Zeitstempel
      
      try {
        // Finde nächste freie Position
        const position = this.findNextIslandPosition();
        
        if (!position) {
          console.error('❌ Keine freie Position für neue Insel gefunden');
          placePlayerBtn.textContent = '❌ Kein Platz!';
          setTimeout(() => {
            placePlayerBtn.textContent = '🏝️ Spieler plazieren';
          }, 2000);
          return;
        }
        
        // Füge Insel zur lokalen Liste hinzu (für Test)
        const island = { x: position.x, y: position.y, playerId: testPlayerId };
        this.playerIslands.push(island);
        
        // Versuche auf Server zu speichern (optional, funktioniert auch ohne Auth für Test)
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/players/islands', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ x: position.x, y: position.y })
          });
          
          if (response.ok) {
            const data = await response.json();
            // Aktualisiere mit Server-Daten
            const index = this.playerIslands.findIndex(i => i.playerId === testPlayerId);
            if (index !== -1) {
              this.playerIslands[index] = {
                x: data.island.x,
                y: data.island.y,
                playerId: data.island.playerId
              };
            }
            console.log('✅ Test-Spieler erfolgreich platziert (Server):', island);
          } else {
            // Auch wenn Server-Fehler, Insel bleibt lokal sichtbar für Test
            console.log('⚠️ Test-Spieler lokal platziert (Server-Fehler ignoriert):', island);
          }
        } catch (error) {
          // Auch bei Fehler bleibt Insel lokal sichtbar für Test
          console.log('⚠️ Test-Spieler lokal platziert (Fehler ignoriert):', island);
        }
        
        // Aktualisiere Ansicht
        if (this.canvas && this.ctx) {
          this.updateView();
        }
        
        console.log('✅ Test-Spieler erfolgreich platziert:', island);
        // Zeige kurze Erfolgsmeldung
        placePlayerBtn.textContent = '✅ Platziert!';
        setTimeout(() => {
          placePlayerBtn.textContent = '🏝️ Spieler plazieren';
        }, 2000);
        
      } catch (error) {
        console.error('Fehler beim Platzieren des Test-Spielers:', error);
        placePlayerBtn.textContent = '❌ Fehler!';
        setTimeout(() => {
          placePlayerBtn.textContent = '🏝️ Spieler plazieren';
        }, 2000);
      }
    });
  }
  
  setupCompassNeedles() {
    // Event-Listener für alle Kompass-Labels
    const compassLabels = document.querySelectorAll('.compass-label');
    compassLabels.forEach(label => {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const direction = label.dataset.direction;
        this.moveMapByField(direction);
      });
    });
  }
  
  moveMapByField(direction) {
    // Bewege die Karte um genau ein Feld in die angegebene Richtung
    // Verwende aktuelle Feldgröße (ändert sich je nach Zoom)
    const fieldSize = this.fieldSize;
    
    switch (direction) {
      case 'north':
        // Nach Norden = Y verringern (nach oben)
        this.viewY -= fieldSize;
        break;
      case 'south':
        // Nach Süden = Y erhöhen (nach unten)
        this.viewY += fieldSize;
        break;
      case 'east':
        // Nach Osten = X erhöhen (nach rechts)
        this.viewX += fieldSize;
        break;
      case 'west':
        // Nach Westen = X verringern (nach links)
        this.viewX -= fieldSize;
        break;
    }
    
    // Begrenze auf Karten-Grenzen
    this.clampView();
    
    // Aktualisiere Ansicht
    this.updateView();
  }
  
  updateViewportSize() {
    // Viewport-Größe bleibt konstant (750px × 750px)
    const viewportSize = this.baseViewportSize;
    
    // Berechne Feldgröße basierend auf Zoom-Level
    const visibleFields = this.zoomLevels[this.zoomLevel];
    const fieldsPerSide = Math.sqrt(visibleFields);
    
    // Feldgröße = Viewport-Größe / Felder pro Seite
    this.fieldSize = viewportSize / fieldsPerSide;
    
    // Setze CSS-Größe des Viewports (konstant)
    if (this.canvas) {
      this.canvas.style.width = viewportSize + 'px';
      this.canvas.style.height = viewportSize + 'px';
    }
  }
  
  changeZoom(delta) {
    const newZoom = this.zoomLevel + delta;
    if (newZoom >= 1 && newZoom <= 10) {
      // Speichere aktuelle Viewport-Mitte für sanftes Zoomen
      const centerX = this.viewX + (this.viewportWidth / 2);
      const centerY = this.viewY + (this.viewportHeight / 2);
      
      // Alte Feldgröße für Skalierung
      const oldFieldSize = this.fieldSize;
      
      this.zoomLevel = newZoom;
      this.updateViewportSize(); // Aktualisiert fieldSize basierend auf Zoom-Level
      
      // Neue Feldgröße
      const newFieldSize = this.fieldSize;
      
      // Skaliere Viewport-Position entsprechend der Feldgrößenänderung
      // Die Mitte bleibt gleich, aber die Position muss skaliert werden
      const scaleFactor = newFieldSize / oldFieldSize;
      const newCenterX = centerX * scaleFactor;
      const newCenterY = centerY * scaleFactor;
      
      // Warte kurz, damit CSS-Größenänderung wirksam wird
      requestAnimationFrame(() => {
        // Setze Viewport-Größe neu (bleibt konstant)
        const rect = this.canvas.getBoundingClientRect();
        this.viewportWidth = rect.width;
        this.viewportHeight = rect.height;
        
        // Aktualisiere Canvas-Auflösung für High-DPI
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.viewportWidth * dpr;
        this.canvas.height = this.viewportHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Zentriere Viewport auf skalierten Position
        this.viewX = newCenterX - (this.viewportWidth / 2);
        this.viewY = newCenterY - (this.viewportHeight / 2);
        
        this.clampView();
        this.updateView();
      });
    }
  }
  
  setZoom(level) {
    if (level >= 1 && level <= 10) {
      this.zoomLevel = level;
      this.updateViewportSize();
      // Stelle sicher, dass Canvas gesetzt ist
      if (!this.canvas) {
        this.setupCanvas();
      } else {
        // Aktualisiere Canvas-Größe basierend auf neuem Zoom
        const rect = this.canvas.getBoundingClientRect();
        this.viewportWidth = rect.width || this.baseViewportSize;
        this.viewportHeight = rect.height || this.baseViewportSize;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.viewportWidth * dpr;
        this.canvas.height = this.viewportHeight * dpr;
        if (this.ctx) {
          this.ctx.scale(dpr, dpr);
        }
      }
      // Zentriere neu auf aktuelle Insel nach Zoom-Änderung
      this.centerOnCurrentVillage();
      this.updateView();
    }
  }
  
  updateZoomDisplay() {
    const zoomLevelText = document.getElementById('zoom-level-text');
    const zoomFieldsText = document.getElementById('zoom-fields-text');
    
    if (zoomLevelText) {
      zoomLevelText.textContent = `Zoom: ${this.zoomLevel}`;
    }
    if (zoomFieldsText) {
      zoomFieldsText.textContent = `(${this.zoomLevels[this.zoomLevel]} Felder)`;
    }
  }
  
  clampView() {
    // Begrenze Viewport auf Karten-Grenzen
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewportHeight);
    
    this.viewX = Math.max(0, Math.min(maxX, this.viewX));
    this.viewY = Math.max(0, Math.min(maxY, this.viewY));
  }
  
  closeMap() {
    // Schließe die Karten-Ansicht und kehre zur Startseite zurück
    // WICHTIG: Die Karte wird NICHT neu geladen, nur versteckt
    const mapView = document.getElementById('island-map-view');
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    
    if (mapView) {
      mapView.classList.add('hidden');
    }
    
    // Zeige Gebäude-Ansicht statt alter Ansicht
    if (buildingsView) {
      buildingsView.classList.remove('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.add('hidden');
    }
    
    // Schließe auch das Insel-Info-Panel falls geöffnet
    this.closeIslandInfo();
    
    console.log('Karte geschlossen (nicht neu geladen)');
  }
  
  // jumpToCoordinates Funktion entfernt - nicht mehr benötigt
  
  updateView() {
    if (!this.ctx || !this.canvas) return;
    
    // Stelle sicher, dass Viewport-Größe gesetzt ist
    if (this.viewportWidth === 0 || this.viewportHeight === 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.viewportWidth = rect.width || this.baseViewportSize;
      this.viewportHeight = rect.height || this.baseViewportSize;
    }
    
    // Clear Canvas
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    
    // Zeichne gekachelten Hintergrund in Originalgröße
    if (this.backgroundLoaded && this.backgroundImage) {
      this.drawTiledBackground();
    } else {
      // Fallback: Dunkler Hintergrund wenn Bild nicht geladen (wie Spiel-Hintergrund)
      this.ctx.fillStyle = '#2a4a3a';
      this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    }
    
    // Zeichne Kontinente (nur ab Zoom-Level 4, also ab 128 Feldern)
    if (this.fieldSize > 0 && this.zoomLevel >= 4) {
      this.drawContinents();
    }
    
    // Zeichne Spieler-Inseln (immer sichtbar)
    if (this.islandLoaded && this.playerIslands.length > 0) {
      this.drawIslands();
    }
    
    // Leitlinien entfernt - nicht mehr zeichnen
    
    // Zeichne Raster über dem Hintergrund (nur ab Zoom-Level 4, also ab 128 Felder)
    if (this.fieldSize > 0 && this.zoomLevel >= 4) {
      this.drawGrid();
    }
    
    // Aktualisiere Zoom-Anzeige
    this.updateZoomDisplay();
    
    // Debug: Zeige Viewport-Position und Drag-Status
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `View: (${Math.floor(this.viewX)}, ${Math.floor(this.viewY)}) | World: ${this.worldWidth}×${this.worldHeight} | Zoom: ${this.zoomLevel} (${this.zoomLevels[this.zoomLevel]} Felder)`,
      10,
      20
    );
    
    // Zeige Drag-Status
    if (this.isDragging) {
      this.ctx.fillStyle = '#0066cc';
      this.ctx.fillText('Ziehen...', 10, 40);
    }
  }
  
  drawTiledBackground() {
    if (!this.ctx || !this.backgroundImage || !this.backgroundLoaded) return;
    if (this.viewportWidth === 0 || this.viewportHeight === 0) return;
    
    // Hintergrundbild wird gekachelt über die gesamte Karte gezeichnet
    // in seiner Originalgröße (nicht basierend auf Feldgröße)
    const imageWidth = this.backgroundImageWidth;
    const imageHeight = this.backgroundImageHeight;
    
    if (imageWidth === 0 || imageHeight === 0) return;
    
    // Berechne Start-Position der Tiles basierend auf viewX/viewY
    const startTileX = Math.floor(this.viewX / imageWidth);
    const startTileY = Math.floor(this.viewY / imageHeight);
    
    // Berechne End-Position der Tiles (wie viele Tiles sind sichtbar)
    const endTileX = Math.ceil((this.viewX + this.viewportWidth) / imageWidth);
    const endTileY = Math.ceil((this.viewY + this.viewportHeight) / imageHeight);
    
    // Zeichne alle sichtbaren Hintergrund-Tiles in Originalgröße
    for (let tileY = startTileY; tileY < endTileY; tileY++) {
      for (let tileX = startTileX; tileX < endTileX; tileX++) {
        // Berechne Position im Canvas (relativ zum Viewport)
        const canvasX = Math.round((tileX * imageWidth) - this.viewX);
        const canvasY = Math.round((tileY * imageHeight) - this.viewY);
        
        // Zeichne Hintergrundbild in Originalgröße (gekachelt)
        this.ctx.drawImage(
          this.backgroundImage,
          canvasX,                              // Ziel-X im Canvas
          canvasY,                              // Ziel-Y im Canvas
          imageWidth,                           // Original-Breite
          imageHeight                           // Original-Höhe
        );
      }
    }
  }
  
  drawContinents() {
    if (!this.ctx || this.fieldSize === 0) return;
    
    // Kontinente: 100 Felder = 1 Kontinent (10×10 Felder)
    const fieldsPerContinent = 100;
    const fieldsPerContinentSide = 10; // 10×10 = 100 Felder
    
    // Kontinent-Grenzen - weiß
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Weiß
    this.ctx.lineWidth = 2; // Dünner als Leitlinien (3px), aber dicker als Raster (1px)
    
    // Text-Style für Kontinent-Nummern - weiß
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const fieldSize = this.fieldSize;
    const continentSize = fieldsPerContinentSide * fieldSize; // Größe eines Kontinents in Pixeln
    
    // Berechne sichtbaren Bereich basierend auf Kontinent-Größe
    const startContinentX = Math.floor(this.viewX / continentSize);
    const startContinentY = Math.floor(this.viewY / continentSize);
    const endContinentX = Math.ceil((this.viewX + this.viewportWidth) / continentSize);
    const endContinentY = Math.ceil((this.viewY + this.viewportHeight) / continentSize);
    
    // Zeichne Kontinent-Grenzen und Nummern
    for (let continentY = startContinentY; continentY < endContinentY; continentY++) {
      for (let continentX = startContinentX; continentX < endContinentX; continentX++) {
        // Berechne Kontinent-Nummer (von links oben beginnend, zeilenweise)
        // Welt hat 100 Felder × 100 Felder = 10 Kontinente × 10 Kontinente
        const continentNumber = (continentY * 10) + continentX + 1;
        
        // Berechne Position des Kontinents im Canvas
        const continentWorldX = continentX * continentSize;
        const continentWorldY = continentY * continentSize;
        
        // Zeichne Kontinent-Rahmen
        const canvasX = Math.round(continentWorldX - this.viewX);
        const canvasY = Math.round(continentWorldY - this.viewY);
        
        // Nur zeichnen wenn sichtbar
        if (canvasX + continentSize > 0 && canvasX < this.viewportWidth &&
            canvasY + continentSize > 0 && canvasY < this.viewportHeight) {
          
          // Zeichne Kontinent-Rahmen
          this.ctx.beginPath();
          this.ctx.rect(canvasX, canvasY, continentSize, continentSize);
          this.ctx.stroke();
          
          // Zeichne Kontinent-Nummer in der Mitte des Kontinents
          const centerX = canvasX + (continentSize / 2);
          const centerY = canvasY + (continentSize / 2);
          
          // Nur zeichnen wenn die Mitte sichtbar ist
          if (centerX >= 0 && centerX <= this.viewportWidth &&
              centerY >= 0 && centerY <= this.viewportHeight) {
            this.ctx.fillText(continentNumber.toString(), centerX, centerY);
          }
        }
      }
    }
  }
  
  drawGuideLines() {
    if (!this.ctx || this.fieldSize === 0) return;
    
    // Leitlinien - dicker als Kontinente, aber nur ab Zoom-Level 4
    this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'; // Dunkelbraun für Leitlinien
    this.ctx.lineWidth = 3; // Dicker als Kontinente (2px) und Raster (1px)
    
    const centerX = this.viewportWidth / 2;
    const centerY = this.viewportHeight / 2;
    
    // Vertikale Leitlinie durch die Mitte (durch das ganze Feld)
    const verticalLineX = Math.round(centerX);
    this.ctx.beginPath();
    this.ctx.moveTo(verticalLineX, 0);
    this.ctx.lineTo(verticalLineX, this.viewportHeight);
    this.ctx.stroke();
    
    // Horizontale Leitlinie durch die Mitte (durch das ganze Feld)
    const horizontalLineY = Math.round(centerY);
    this.ctx.beginPath();
    this.ctx.moveTo(0, horizontalLineY);
    this.ctx.lineTo(this.viewportWidth, horizontalLineY);
    this.ctx.stroke();
  }
  
  drawGrid() {
    if (!this.ctx || this.fieldSize === 0) return;
    
    // Raster-Linien über dem Hintergrund - dünner und heller
    this.ctx.strokeStyle = 'rgba(200, 220, 240, 0.3)';
    this.ctx.lineWidth = 0.5;
    
    const fieldSize = this.fieldSize; // 150px
    
    // Berechne sichtbaren Bereich basierend auf Feldgröße (150px)
    const startFieldX = Math.floor(this.viewX / fieldSize);
    const startFieldY = Math.floor(this.viewY / fieldSize);
    const endFieldX = Math.ceil((this.viewX + this.viewportWidth) / fieldSize);
    const endFieldY = Math.ceil((this.viewY + this.viewportHeight) / fieldSize);
    
    // Zeichne vertikale Linien - jedes Feld ist 150px breit
    for (let fieldX = startFieldX; fieldX <= endFieldX; fieldX++) {
      const x = Math.round((fieldX * fieldSize) - this.viewX);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.viewportHeight);
      this.ctx.stroke();
    }
    
    // Zeichne horizontale Linien - jedes Feld ist 150px hoch
    for (let fieldY = startFieldY; fieldY <= endFieldY; fieldY++) {
      const y = Math.round((fieldY * fieldSize) - this.viewY);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.viewportWidth, y);
      this.ctx.stroke();
    }
  }
}

// Exportiere Singleton
let mapViewInstance = null;

export function initMapView() {
  if (!mapViewInstance) {
    mapViewInstance = new MapView();
    window.mapView = mapViewInstance; // Stelle global verfügbar
  }
  return mapViewInstance;
}

export default MapView;
