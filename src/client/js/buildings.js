/**
 * Gebäude-Manager - Verwaltet Gebäude-Anzeige und Pop-Ups
 */
class BuildingsManager {
  constructor() {
    this.buildings = {
      hafen: {
        name: 'Hafen',
        level: 1,
        maxLevel: 20,
        image: '/assets/Gebäude/Hafen/hafen1.png',
        description: 'Der Hafen ermöglicht den Handel mit anderen Inseln und die Verschiffung von Ressourcen.',
        icon: '⚓',
        buildTime: 10, // Sekunden pro Stufe
        costs: {
          2: { wood: 10 },
          3: { wood: 15 },
          4: { wood: 25 },
          5: { wood: 30 }
        },
        functions: {
          '1-5': 'Angeln',
          '5-15': 'Boot bauen',
          '15-20': 'Handeln'
        },
        getImage: (level) => {
          // Hafen: Stufe 1 = hafen1.png, Stufe 2+ = hafen2.png
          return level === 1 
            ? '/assets/Gebäude/Hafen/hafen1.png'
            : '/assets/Gebäude/Hafen/hafen2.png';
        }
      }
    };
    this.upgradeTimers = new Map(); // Speichert aktive Timer
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupDragAndResize();
    this.renderBuildings();
  }

  setupEventListeners() {
    // Gebäude-Karten Klicks (beide Varianten)
    document.addEventListener('click', (e) => {
      const buildingCard = e.target.closest('.building-card, .building-card-modern');
      if (buildingCard) {
        const buildingType = buildingCard.dataset.building;
        if (buildingType) {
          this.showAllPopups(buildingType);
        }
      }
    });

    // Pop-Up schließen wird neu implementiert

    // Escape-Taste zum Schließen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideBuildingPopup();
      }
    });
  }

  setupDragAndResize() {
    // Nicht mehr benötigt - einfaches zentriertes Pop-Up
  }

  makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let dragActive = false;

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      // Verhindere Drag wenn auf Resize-Handle oder Close-Button geklickt wird
      if (e.target.closest('.popup-resize-handle') || 
          e.target.closest('.popup-close') ||
          e.target.tagName === 'BUTTON') {
        return;
      }

      // Prüfe ob Resize aktiv ist
      if (element.dataset.resizing === 'true') {
        return;
      }

      isDragging = true;
      dragActive = false; // Wird true nach kleinem Bewegungs-Threshold
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      e.preventDefault();
      e.stopPropagation();
    }

    function drag(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Kleiner Threshold um versehentliches Ziehen zu vermeiden
      if (!dragActive && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        dragActive = true;
        element.style.cursor = 'grabbing';
        element.style.userSelect = 'none';
      }
      
      if (dragActive) {
        e.preventDefault();
        element.style.left = (startLeft + deltaX) + 'px';
        element.style.top = (startTop + deltaY) + 'px';
      }
    }

    function dragEnd() {
      if (isDragging) {
        isDragging = false;
        dragActive = false;
        element.style.cursor = '';
        element.style.userSelect = '';
      }
    }
  }

  makeResizableAdvanced(element) {
    // Individuelle Mindestgrößen basierend auf Pop-Up-Typ
    let minWidth, minHeight;
    const id = element.id;
    
    if (id === 'building-popup-image-modal') {
      minWidth = 300;
      minHeight = 300;
    } else if (id === 'building-popup-upgrade-modal') {
      minWidth = 280;
      minHeight = 300;
    } else if (id === 'building-popup-overview-modal') {
      minWidth = 400;
      minHeight = 400;
    } else {
      minWidth = 300;
      minHeight = 200;
    }

    let isResizing = false;
    let resizeDirection = '';
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // Prüfe ob Handles bereits existieren
    if (element.querySelector('.popup-resize-handle')) {
      return; // Bereits initialisiert
    }

    // Erstelle Resize-Handles an allen Rändern
    const handles = {
      n: this.createResizeHandle('n'),
      s: this.createResizeHandle('s'),
      e: this.createResizeHandle('e'),
      w: this.createResizeHandle('w'),
      nw: this.createResizeHandle('nw'),
      ne: this.createResizeHandle('ne'),
      sw: this.createResizeHandle('sw'),
      se: this.createResizeHandle('se')
    };

    Object.values(handles).forEach(handle => {
      element.appendChild(handle);
    });

    function resizeStart(e, direction) {
      isResizing = true;
      resizeDirection = direction;
      element.dataset.resizing = 'true'; // Markiere als resizing
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Verhindere Drag während Resize
      element.style.userSelect = 'none';
      document.body.style.cursor = getCursorForDirection(direction);
      document.body.style.userSelect = 'none';
    }

    function getCursorForDirection(direction) {
      const cursors = {
        'n': 'ns-resize',
        's': 'ns-resize',
        'e': 'ew-resize',
        'w': 'ew-resize',
        'nw': 'nwse-resize',
        'ne': 'nesw-resize',
        'sw': 'nesw-resize',
        'se': 'nwse-resize'
      };
      return cursors[direction] || 'default';
    }

    function resize(e) {
      if (!isResizing) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // Resize basierend auf Richtung
      // Horizontal (Breite)
      if (resizeDirection.includes('e')) {
        // Rechts ziehen - Breite erhöhen, Position bleibt gleich
        newWidth = Math.max(minWidth, startWidth + deltaX);
      }
      if (resizeDirection.includes('w')) {
        // Links ziehen - Breite erhöhen, Position nach links verschieben
        const widthChange = startWidth - deltaX;
        if (widthChange >= minWidth) {
          newWidth = widthChange;
          newLeft = startLeft + deltaX;
        }
      }
      
      // Vertikal (Höhe)
      if (resizeDirection.includes('s')) {
        // Unten ziehen - Höhe erhöhen, Position bleibt gleich
        newHeight = Math.max(minHeight, startHeight + deltaY);
      }
      if (resizeDirection.includes('n')) {
        // Oben ziehen - Höhe erhöhen, Position nach oben verschieben
        const heightChange = startHeight - deltaY;
        if (heightChange >= minHeight) {
          newHeight = heightChange;
          newTop = startTop + deltaY;
        }
      }

      // Wende Größenänderungen an
      element.style.width = newWidth + 'px';
      element.style.height = newHeight + 'px';
      
      // Position anpassen wenn von links oder oben gezogen wird
      if (resizeDirection.includes('w')) {
        element.style.left = newLeft + 'px';
      }
      if (resizeDirection.includes('n')) {
        element.style.top = newTop + 'px';
      }
    }

    function resizeEnd() {
      if (!isResizing) return;
      
      isResizing = false;
      resizeDirection = '';
      element.dataset.resizing = 'false'; // Entferne Resize-Markierung
      element.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    // Event Listeners für alle Handles
    handles.n.addEventListener('mousedown', (e) => resizeStart(e, 'n'));
    handles.s.addEventListener('mousedown', (e) => resizeStart(e, 's'));
    handles.e.addEventListener('mousedown', (e) => resizeStart(e, 'e'));
    handles.w.addEventListener('mousedown', (e) => resizeStart(e, 'w'));
    handles.nw.addEventListener('mousedown', (e) => resizeStart(e, 'nw'));
    handles.ne.addEventListener('mousedown', (e) => resizeStart(e, 'ne'));
    handles.sw.addEventListener('mousedown', (e) => resizeStart(e, 'sw'));
    handles.se.addEventListener('mousedown', (e) => resizeStart(e, 'se'));

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', resizeEnd);
  }

  createResizeHandle(direction) {
    const handle = document.createElement('div');
    handle.className = `popup-resize-handle ${direction}`;
    return handle;
  }

  renderBuildings() {
    const buildingsGrid = document.querySelector('.buildings-grid');
    if (!buildingsGrid) return;
    console.log('Gebäude-Sektion geladen');
  }

  async showAllPopups(buildingType) {
    const building = this.buildings[buildingType];
    if (!building) {
      console.error('Gebäude nicht gefunden:', buildingType);
      return;
    }

    // Zeige Pop-Up
    this.showBuildingPopup(building);
  }

  showBuildingPopup(building) {
    // Pop-up wird neu aufgebaut
    const modal = document.getElementById('building-popup-modal');
    if (!modal) return;
    
    // Pop-up wird hier neu erstellt
    console.log('Zeige Pop-up für:', building.name);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  showUpgradePopup(buildingType, building, currentWood) {
    const modal = document.getElementById('building-popup-upgrade-modal');
    const levelValue = document.getElementById('upgrade-level-value');
    const costValue = document.getElementById('upgrade-cost-value');
    const timeValue = document.getElementById('upgrade-time-value');
    const upgradeBtn = document.getElementById('building-upgrade-btn');
    const timerDiv = document.getElementById('upgrade-timer');

    if (!modal) return;

    const nextLevel = building.level + 1;

    if (nextLevel > building.maxLevel) {
      if (levelValue) levelValue.textContent = 'Max';
      if (costValue) costValue.textContent = '-';
      if (timeValue) timeValue.textContent = '-';
      if (upgradeBtn) {
        upgradeBtn.disabled = true;
        upgradeBtn.textContent = 'Maximale Stufe erreicht';
      }
      if (timerDiv) timerDiv.style.display = 'none';
      modal.classList.remove('hidden');
      return;
    }

    const cost = building.costs[nextLevel] || { wood: 0 };
    const canAfford = currentWood >= cost.wood;

    // Prüfe ob bereits ein Upgrade läuft
    const isUpgrading = this.upgradeTimers.has(buildingType);
    if (isUpgrading) {
      const timer = this.upgradeTimers.get(buildingType);
      this.showTimer(timerDiv, timer.remaining, building.buildTime);
      if (upgradeBtn) {
        upgradeBtn.disabled = true;
        upgradeBtn.textContent = 'Ausbau läuft...';
      }
    } else {
      if (timerDiv) timerDiv.style.display = 'none';
      if (levelValue) levelValue.textContent = `Stufe ${nextLevel}`;
      if (costValue) {
        costValue.textContent = cost.wood > 0 ? `${cost.wood} Holz` : '-';
        costValue.className = canAfford ? 'upgrade-cost-value' : 'upgrade-cost-value insufficient';
      }
      if (timeValue) timeValue.textContent = `${building.buildTime}s`;

      if (upgradeBtn) {
        upgradeBtn.disabled = !canAfford;
        upgradeBtn.textContent = canAfford ? '⬆️ Ausbauen' : '❌ Nicht genug Holz';

        // Entferne alte Event-Listener
        const newBtn = upgradeBtn.cloneNode(true);
        upgradeBtn.parentNode.replaceChild(newBtn, upgradeBtn);

        newBtn.addEventListener('click', () => {
          this.startUpgrade(buildingType, nextLevel, cost, building.buildTime);
        });
      }
    }

    modal.classList.remove('hidden');
  }

  showOverviewPopup(building, currentWood) {
    const modal = document.getElementById('building-popup-overview-modal');
    if (!modal) return;

    this.renderAvailableFunctions(building);
    this.renderUpgradeOverview(building, currentWood);

    modal.classList.remove('hidden');
  }

  renderAvailableFunctions(building) {
    const functionsList = document.querySelector('#building-popup-functions .building-functions-list');
    if (!functionsList) return;

    functionsList.innerHTML = '';
    
    if (building.level >= 1 && building.level <= 5) {
      const li = document.createElement('li');
      li.textContent = `✅ ${building.functions['1-5']}`;
      functionsList.appendChild(li);
    }
    if (building.level >= 5 && building.level <= 15) {
      const li = document.createElement('li');
      li.textContent = `✅ ${building.functions['5-15']}`;
      functionsList.appendChild(li);
    }
    if (building.level >= 15 && building.level <= 20) {
      const li = document.createElement('li');
      li.textContent = `✅ ${building.functions['15-20']}`;
      functionsList.appendChild(li);
    }
  }

  renderUpgradeOverview(building, currentWood) {
    const tbody = document.getElementById('building-overview-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    for (let level = 1; level <= building.maxLevel; level++) {
      const isCurrentLevel = level === building.level;
      const cost = building.costs[level] || { wood: 0 };
      
      let functions = [];
      if (level >= 1 && level <= 5) functions.push(building.functions['1-5']);
      if (level >= 5 && level <= 15) functions.push(building.functions['5-15']);
      if (level >= 15 && level <= 20) functions.push(building.functions['15-20']);
      
      functions = [...new Set(functions)];
      const functionsText = functions.length > 0 ? functions.join(', ') : '-';
      
      const tr = document.createElement('tr');
      if (isCurrentLevel) tr.classList.add('current-level');
      
      tr.innerHTML = `
        <td>${level}</td>
        <td>${cost.wood > 0 ? cost.wood + ' Holz' : '-'}</td>
        <td>${level > 1 ? building.buildTime + 's' : '-'}</td>
        <td>${functionsText}</td>
      `;
      
      tbody.appendChild(tr);
    }
  }

  async startUpgrade(buildingType, targetLevel, cost, buildTime) {
    try {
      const { api } = await import('./api.js');
      
      const { getCurrentIslandId } = await import('./api.js');
      const currentIslandId = await getCurrentIslandId();
      if (!currentIslandId) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Keine Insel gefunden!');
        return;
      }

      const resources = await api.getResources(currentIslandId);
      const currentWood = Math.floor(resources.wood || 0);

      if (currentWood < cost.wood) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.warning(`Nicht genug Holz! Du hast ${currentWood}, benötigst aber ${cost.wood}.`, 'Ressourcen fehlen');
        return;
      }

      // Starte Timer
      const timer = {
        buildingType,
        targetLevel,
        startTime: Date.now(),
        duration: buildTime * 1000, // in Millisekunden
        remaining: buildTime * 1000,
        interval: null
      };

      this.upgradeTimers.set(buildingType, timer);

      // Zeige Timer
      const timerDiv = document.getElementById('upgrade-timer');
      if (timerDiv) timerDiv.style.display = 'block';

      // Starte Timer-Update
      timer.interval = setInterval(() => {
        const elapsed = Date.now() - timer.startTime;
        timer.remaining = Math.max(0, timer.duration - elapsed);

        if (timer.remaining <= 0) {
          // Upgrade abgeschlossen
          clearInterval(timer.interval);
          this.completeUpgrade(buildingType, targetLevel);
        } else {
          this.updateTimer(timerDiv, timer.remaining, timer.duration);
        }
      }, 100);

      // Update Button
      const upgradeBtn = document.getElementById('building-upgrade-btn');
      if (upgradeBtn) {
        upgradeBtn.disabled = true;
        upgradeBtn.textContent = 'Ausbau läuft...';
      }

      console.log(`Ausbau gestartet: ${buildingType} -> Stufe ${targetLevel}`);

    } catch (error) {
      console.error('Fehler beim Ausbau:', error);
      alert('Fehler beim Ausbau: ' + error.message);
    }
  }

  updateTimer(timerDiv, remaining, total) {
    if (!timerDiv) return;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timerValue = timerDiv.querySelector('.timer-value');
    if (timerValue) timerValue.textContent = timeString;

    const progress = ((total - remaining) / total) * 100;
    const progressBar = timerDiv.querySelector('.timer-progress-bar');
    if (progressBar) progressBar.style.width = progress + '%';
  }

  showTimer(timerDiv, remaining, total) {
    if (!timerDiv) return;
    timerDiv.style.display = 'block';
    this.updateTimer(timerDiv, remaining, total);
  }

  async completeUpgrade(buildingType, targetLevel) {
    const building = this.buildings[buildingType];
    if (!building) return;

    // Update Gebäude-Level
    building.level = targetLevel;

    // Entferne Timer
    const timer = this.upgradeTimers.get(buildingType);
    if (timer && timer.interval) {
      clearInterval(timer.interval);
    }
    this.upgradeTimers.delete(buildingType);

    // Verstecke Timer
    const timerDiv = document.getElementById('upgrade-timer');
    if (timerDiv) timerDiv.style.display = 'none';

    // Aktualisiere alle Pop-Ups
    let currentWood = 0;
    try {
      const { api, getCurrentIslandId } = await import('./api.js');
      const currentIslandId = await getCurrentIslandId();
      if (currentIslandId) {
        const resources = await api.getResources(currentIslandId);
        currentWood = Math.floor(resources.wood || 0);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ressourcen:', error);
    }

    this.showImagePopup(building);
    this.showUpgradePopup(buildingType, building, currentWood);
    this.showOverviewPopup(building, currentWood);

    // Notification entfernt - kein Pop-up mehr beim Beenden des Ausbaus
  }

  hideBuildingPopup() {
    const modal = document.getElementById('building-popup-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}

// Initialisiere Buildings-Manager
let buildingsManager = null;

function initBuildings() {
  if (!buildingsManager) {
    buildingsManager = new BuildingsManager();
  }
}

// Initialisiere wenn Game-Container sichtbar ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && !gameContainer.classList.contains('hidden')) {
      initBuildings();
    }
  });
} else {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer && !gameContainer.classList.contains('hidden')) {
    initBuildings();
  }
}

// Beobachte Game-Container
const buildingsObserver = new MutationObserver(() => {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer && !gameContainer.classList.contains('hidden')) {
    if (!buildingsManager) {
      initBuildings();
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      buildingsObserver.observe(gameContainer, { attributes: true, attributeFilter: ['class'] });
    }
  });
} else {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    buildingsObserver.observe(gameContainer, { attributes: true, attributeFilter: ['class'] });
  }
}

export { BuildingsManager, initBuildings };
