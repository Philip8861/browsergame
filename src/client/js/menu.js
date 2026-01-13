/**
 * Menüleiste Handler für Island Escape
 */
class MenuManager {
  constructor() {
    this.currentMenu = 'island';
    this.init();
  }

  init() {
    // Event Listeners für Menü-Items (beide Varianten: altes Menü und Sidebar)
    document.querySelectorAll('.menu-item-island, .sidebar-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const menu = e.currentTarget.dataset.menu;
        this.switchMenu(menu);
      });
    });

    // Mausrad-Zoom für Startseite-Bild
    this.initIslandZoom();

    // Event Listeners für Insel-Navigation (Pfeile)
    const leftArrow = document.getElementById('island-nav-left');
    const rightArrow = document.getElementById('island-nav-right');
    
    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        this.navigateToIsland(-1);
      });
    }
    
    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        this.navigateToIsland(1);
      });
    }

    // Event Listener für Rangliste-Sortierung
    const sortSelect = document.getElementById('leaderboard-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        this.loadLeaderboard(sortBy);
      });
    }

    // Event Listener für Ausbau-Karten (Event Delegation)
    // Verwende Arrow Function um this zu binden
    const menuManager = this;
    document.addEventListener('click', (e) => {
      const upgradeCard = e.target.closest('.upgrade-card');
      if (upgradeCard) {
        const upgradeType = upgradeCard.dataset.upgrade;
        if (upgradeType) {
          console.log('Ausbau geklickt:', upgradeType);
          // Verwende die gespeicherte menuManager Instanz
          const manager = menuManager || window.menuManagerInstance || window.menuManager;
          if (manager && manager.showUpgradeModal) {
            manager.showUpgradeModal(upgradeType);
          } else {
            console.error('MenuManager nicht gefunden!', { menuManager, windowMenuManager: window.menuManager });
          }
        }
      }
    });

    // Event Listener für Ausbau-Modal schließen
    const upgradeCloseBtn = document.getElementById('upgrade-close');
    const upgradeBackdrop = document.querySelector('.upgrade-backdrop');
    if (upgradeCloseBtn) {
      upgradeCloseBtn.addEventListener('click', () => {
        this.hideUpgradeModal();
      });
    }
    if (upgradeBackdrop) {
      upgradeBackdrop.addEventListener('click', () => {
        this.hideUpgradeModal();
      });
    }

    // Event Listener für Build-Button (wird dynamisch gesetzt, aber hier für Sicherheit)
    const buildBtn = document.getElementById('upgrade-build-btn');
    if (buildBtn) {
      // Wird in showUpgradeModal neu gesetzt
    }

    // Escape-Taste zum Schließen des Ausbau-Modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const upgradeModal = document.getElementById('upgrade-modal');
        if (upgradeModal && !upgradeModal.classList.contains('hidden')) {
          this.hideUpgradeModal();
        }
      }
    });

    // Initialisiere draggable Lagerfeuer-Icon
    this.initDraggableLagerfeuer();
    
    // Initialisiere draggable Hafen-Icon
    this.initDraggableHafen();
    
    // Initialisiere Mauskoordinaten-Anzeige
    this.initMouseCoordinates();
    
    // Lade Bauschleife aus Backend beim Initialisieren (mit Verzögerung, damit API bereit ist)
    // Warte auf Authentifizierung und dann lade die Bauschleife
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          await this.loadBuildQueueFromBackend();
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bauschleife beim Initialisieren:', error);
      }
    }, 1500);
  }
  
  initMouseCoordinates() {
    // Event Listener für Mausbewegung auf dem gesamten Bildschirm
    document.addEventListener('mousemove', (e) => {
      this.updateMouseCoordinates(e.clientX, e.clientY);
    });
    
    // Setze initial auf "-"
    const coordsEl = document.getElementById('mouse-coords-text');
    if (coordsEl) {
      coordsEl.textContent = 'X: -, Y: -';
    }
  }
  
  updateMouseCoordinates(x, y) {
    const coordsEl = document.getElementById('mouse-coords-text');
    if (coordsEl) {
      coordsEl.textContent = `X: ${x}, Y: ${y}`;
    }
  }

  initDraggableLagerfeuer() {
    const lagerfeuerIcon = document.getElementById('draggable-lagerfeuer');
    if (!lagerfeuerIcon) return;

    // Lade Bild neu (Cache-Busting)
    const img = document.getElementById('lagerfeuer-icon-img');
    if (img) {
      const timestamp = new Date().getTime();
      img.src = `/assets/Lagerfeuer_icon.png?t=${timestamp}`;
      img.onerror = () => {
        console.error('Lagerfeuer-Icon konnte nicht geladen werden');
        // Fallback: Versuche ohne Cache-Busting
        img.src = '/assets/Lagerfeuer_icon.png';
      };
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let hasMoved = false;
    let isFixed = false;
    let currentIslandId = null;

    // Lade gespeicherte Position und Fixierungsstatus aus localStorage (insel-spezifisch)
    const loadLagerfeuerSettings = async () => {
      const islandId = await this.getCurrentIslandIdAsync();
      if (!islandId) return;
      
      currentIslandId = islandId;
      const savedPosition = localStorage.getItem(`lagerfeuer-icon-position-${islandId}`);
      const savedFixed = localStorage.getItem(`lagerfeuer-icon-fixed-${islandId}`);
      
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition);
          lagerfeuerIcon.style.left = `${x}px`;
          lagerfeuerIcon.style.top = `${y}px`;
          lagerfeuerIcon.style.transform = 'translate(-50%, -50%)';
        } catch (e) {
          console.error('Fehler beim Laden der Lagerfeuer-Icon-Position:', e);
        }
      }
      
      if (savedFixed === 'true') {
        isFixed = true;
        lagerfeuerIcon.classList.add('fixed');
        lagerfeuerIcon.style.cursor = 'default';
      } else {
        isFixed = false;
        lagerfeuerIcon.classList.remove('fixed');
        lagerfeuerIcon.style.cursor = 'move';
      }
    };

    // Initial lade Settings
    loadLagerfeuerSettings();

    // Mousedown Event
    lagerfeuerIcon.addEventListener('mousedown', async (e) => {
      // Rechtsklick zum Fixieren/Entfixieren (funktioniert immer, auch wenn fixiert)
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        isFixed = !isFixed;
        
        const islandId = await this.getCurrentIslandIdAsync();
        if (!islandId) return;
        
        if (isFixed) {
          lagerfeuerIcon.classList.add('fixed');
          lagerfeuerIcon.style.cursor = 'default';
          localStorage.setItem(`lagerfeuer-icon-fixed-${islandId}`, 'true');
          const { notificationManager } = await import('./notification.js');
          notificationManager.success('Lagerfeuer-Icon wurde fixiert');
        } else {
          lagerfeuerIcon.classList.remove('fixed');
          lagerfeuerIcon.style.cursor = 'move';
          localStorage.setItem(`lagerfeuer-icon-fixed-${islandId}`, 'false');
          const { notificationManager } = await import('./notification.js');
          notificationManager.info('Lagerfeuer-Icon kann wieder verschoben werden');
        }
        return;
      }
      
      // Linker Klick - Pop-up entfernt, keine Aktion
      if (isFixed) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Wenn nicht fixiert, erlaube Verschieben
      isDragging = true;
      hasMoved = false;
      lagerfeuerIcon.classList.add('dragging');
      
      // Hole aktuelle Position
      const rect = lagerfeuerIcon.getBoundingClientRect();
      initialX = rect.left + rect.width / 2;
      initialY = rect.top + rect.height / 2;
      
      startX = e.clientX;
      startY = e.clientY;
      
      e.preventDefault();
    });
    
    // Verhindere Kontextmenü bei Rechtsklick
    lagerfeuerIcon.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Mousemove Event - nur wenn nicht fixiert
    document.addEventListener('mousemove', (e) => {
      if (!isDragging || isFixed) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Prüfe ob sich die Maus bewegt hat
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
      }
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      // Keine Begrenzung - kann überall platziert werden
      lagerfeuerIcon.style.left = `${newX}px`;
      lagerfeuerIcon.style.top = `${newY}px`;
      lagerfeuerIcon.style.transform = 'translate(-50%, -50%)';
    });

    // Mouseup Event
    document.addEventListener('mouseup', async (e) => {
      if (isDragging && !isFixed) {
        isDragging = false;
        lagerfeuerIcon.classList.remove('dragging');
        
        // Speichere Position in localStorage
        const rect = lagerfeuerIcon.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        localStorage.setItem('lagerfeuer-icon-position', JSON.stringify({ x, y }));
        
        // Pop-up entfernt, keine Aktion bei Klick
        hasMoved = false; // Reset für nächsten Klick
      }
    });

    // Touch Events für mobile Unterstützung
    lagerfeuerIcon.addEventListener('touchstart', async (e) => {
      if (isFixed) {
        // Pop-up entfernt, keine Aktion
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      isDragging = true;
      hasMoved = false;
      lagerfeuerIcon.classList.add('dragging');
      
      const touch = e.touches[0];
      const rect = lagerfeuerIcon.getBoundingClientRect();
      initialX = rect.left + rect.width / 2;
      initialY = rect.top + rect.height / 2;
      
      startX = touch.clientX;
      startY = touch.clientY;
      
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging || isFixed) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
      }
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      // Keine Begrenzung - kann überall platziert werden
      lagerfeuerIcon.style.left = `${newX}px`;
      lagerfeuerIcon.style.top = `${newY}px`;
      lagerfeuerIcon.style.transform = 'translate(-50%, -50%)';
      
      e.preventDefault();
    });

    document.addEventListener('touchend', async () => {
      if (isDragging && !isFixed) {
        isDragging = false;
        lagerfeuerIcon.classList.remove('dragging');
        
        const islandId = await this.getCurrentIslandIdAsync();
        if (islandId) {
          const rect = lagerfeuerIcon.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          localStorage.setItem(`lagerfeuer-icon-position-${islandId}`, JSON.stringify({ x, y }));
        }
        
        // Pop-up entfernt, keine Aktion bei Touch
      }
    });
  }

  async updateLagerfeuerLevel() {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        // Verstecke Icon wenn keine Insel ausgewählt
        const lagerfeuerIcon = document.getElementById('draggable-lagerfeuer');
        if (lagerfeuerIcon) {
          lagerfeuerIcon.style.display = 'none';
        }
        const badge = document.getElementById('lagerfeuer-level-badge');
        if (badge) {
          badge.textContent = 'Stufe 0';
        }
        return;
      }

      const { api } = await import('./api.js');
      const details = await api.getVillageDetails(currentIslandId);
      const buildings = details?.buildings || [];
      
      const lagerfeuer = buildings.find(b => b.building_type === 'lagerfeuer');
      const level = lagerfeuer?.level || 0;
      
      const badge = document.getElementById('lagerfeuer-level-badge');
      if (badge) {
        badge.textContent = `Stufe ${level}`;
      }
      
      // Zeige/Verstecke Icon basierend auf Stufe (nur Stufe 1+)
      const lagerfeuerIcon = document.getElementById('draggable-lagerfeuer');
      if (lagerfeuerIcon) {
        if (level >= 1) {
          lagerfeuerIcon.style.display = 'block';
          // Lade gespeicherte Position für diese Insel
          const savedPosition = localStorage.getItem(`lagerfeuer-icon-position-${currentIslandId}`);
          if (savedPosition) {
            try {
              const { x, y } = JSON.parse(savedPosition);
              lagerfeuerIcon.style.left = `${x}px`;
              lagerfeuerIcon.style.top = `${y}px`;
              lagerfeuerIcon.style.transform = 'translate(-50%, -50%)';
            } catch (e) {
              console.error('Fehler beim Laden der Lagerfeuer-Icon-Position:', e);
            }
          }
        } else {
          lagerfeuerIcon.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Lagerfeuer-Stufe:', error);
    }
  }

  initDraggableHafen() {
    const hafenIcon = document.getElementById('draggable-hafen');
    if (!hafenIcon) return;

    // Lade Bild neu (Cache-Busting)
    const img = document.getElementById('hafen-icon-img');
    if (img) {
      let errorCount = 0;
      const maxErrors = 3;
      
      const loadImage = (src) => {
        const timestamp = new Date().getTime();
        img.src = `${src}?t=${timestamp}`;
      };
      
      img.onerror = () => {
        errorCount++;
        if (errorCount < maxErrors) {
          console.warn(`Hafen-Icon konnte nicht geladen werden (Versuch ${errorCount}/${maxErrors}):`, img.src);
          // Versuche Fallback-Pfad
          if (img.src.includes('Hafen_icon1.png') || img.src.includes('hafen_icon1.png')) {
            loadImage('/assets/Gebäude/Hafen/Hafen_icon1.png');
          } else {
            loadImage('/assets/Gebäude/Hafen/Hafen_icon1.png');
          }
        } else {
          console.error('Hafen-Icon konnte nach mehreren Versuchen nicht geladen werden. Bitte Datei prüfen.');
          img.onerror = null; // Verhindere weitere Fehler
        }
      };
      
      // Initial: Verwende Hafen_icon1.png (Standard)
      loadImage('/assets/Gebäude/Hafen/Hafen_icon1.png');
      
      // Stelle sicher, dass Transparenz erhalten bleibt
      img.style.background = 'transparent';
      img.style.opacity = '1';
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let hasMoved = false;
    let isFixed = false;
    let currentIslandId = null;

    // Lade gespeicherte Position und Fixierungsstatus aus localStorage (insel-spezifisch)
    const loadHafenSettings = async () => {
      const islandId = await this.getCurrentIslandIdAsync();
      if (!islandId) return;
      
      currentIslandId = islandId;
      const savedPosition = localStorage.getItem(`hafen-icon-position-${islandId}`);
      const savedFixed = localStorage.getItem(`hafen-icon-fixed-${islandId}`);
      
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition);
          hafenIcon.style.left = `${x}px`;
          hafenIcon.style.top = `${y}px`;
          hafenIcon.style.transform = 'translate(-50%, -50%)';
        } catch (e) {
          console.error('Fehler beim Laden der Hafen-Icon-Position:', e);
        }
      }
      
      if (savedFixed === 'true') {
        isFixed = true;
        hafenIcon.classList.add('fixed');
        hafenIcon.style.cursor = 'default';
      } else {
        isFixed = false;
        hafenIcon.classList.remove('fixed');
        hafenIcon.style.cursor = 'move';
      }
    };

    // Initial lade Settings
    loadHafenSettings();

    // Mousedown Event
    hafenIcon.addEventListener('mousedown', async (e) => {
      // Rechtsklick zum Fixieren/Entfixieren
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        isFixed = !isFixed;
        
        const islandId = await this.getCurrentIslandIdAsync();
        if (!islandId) return;
        
        if (isFixed) {
          hafenIcon.classList.add('fixed');
          hafenIcon.style.cursor = 'default';
          localStorage.setItem(`hafen-icon-fixed-${islandId}`, 'true');
          const { notificationManager } = await import('./notification.js');
          notificationManager.success('Hafen-Icon wurde fixiert');
        } else {
          hafenIcon.classList.remove('fixed');
          hafenIcon.style.cursor = 'move';
          localStorage.setItem(`hafen-icon-fixed-${islandId}`, 'false');
          const { notificationManager } = await import('./notification.js');
          notificationManager.info('Hafen-Icon kann wieder verschoben werden');
        }
        return;
      }
      
      // Linker Klick - Pop-up entfernt, keine Aktion
      if (isFixed) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      isDragging = true;
      hasMoved = false;
      hafenIcon.classList.add('dragging');
      
      const rect = hafenIcon.getBoundingClientRect();
      initialX = rect.left + rect.width / 2;
      initialY = rect.top + rect.height / 2;
      
      startX = e.clientX;
      startY = e.clientY;
      
      e.preventDefault();
    });
    
    // Verhindere Kontextmenü bei Rechtsklick
    hafenIcon.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Mousemove Event - nur wenn nicht fixiert
    document.addEventListener('mousemove', (e) => {
      if (!isDragging || isFixed) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
      }
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      hafenIcon.style.left = `${newX}px`;
      hafenIcon.style.top = `${newY}px`;
      hafenIcon.style.transform = 'translate(-50%, -50%)';
    });

    // Mouseup Event
    document.addEventListener('mouseup', async (e) => {
      if (isDragging && !isFixed) {
        isDragging = false;
        hafenIcon.classList.remove('dragging');
        
        const islandId = await this.getCurrentIslandIdAsync();
        if (islandId) {
          const rect = hafenIcon.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          localStorage.setItem(`hafen-icon-position-${islandId}`, JSON.stringify({ x, y }));
          
          // Pop-up entfernt, keine Aktion bei Klick
        }
        hasMoved = false;
      }
    });

    // Touch Events für mobile Unterstützung
    hafenIcon.addEventListener('touchstart', async (e) => {
      if (isFixed) {
        // Pop-up entfernt, keine Aktion
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      isDragging = true;
      hasMoved = false;
      hafenIcon.classList.add('dragging');
      
      const touch = e.touches[0];
      const rect = hafenIcon.getBoundingClientRect();
      initialX = rect.left + rect.width / 2;
      initialY = rect.top + rect.height / 2;
      
      startX = touch.clientX;
      startY = touch.clientY;
      
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging || isFixed) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
      }
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      hafenIcon.style.left = `${newX}px`;
      hafenIcon.style.top = `${newY}px`;
      hafenIcon.style.transform = 'translate(-50%, -50%)';
      
      e.preventDefault();
    });

    document.addEventListener('touchend', async () => {
      if (isDragging && !isFixed) {
        isDragging = false;
        hafenIcon.classList.remove('dragging');
        
        const islandId = await this.getCurrentIslandIdAsync();
        if (islandId) {
          const rect = hafenIcon.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          localStorage.setItem(`hafen-icon-position-${islandId}`, JSON.stringify({ x, y }));
        }
        
        // Pop-up entfernt, keine Aktion bei Touch
      }
    });
  }

  async updateHafenLevel() {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        const badge = document.getElementById('hafen-level-badge');
        if (badge) {
          badge.textContent = 'Stufe 0';
        }
        return;
      }

      const { api } = await import('./api.js');
      const details = await api.getVillageDetails(currentIslandId);
      const buildings = details?.buildings || [];
      
      const hafen = buildings.find(b => b.building_type === 'hafen');
      const level = hafen?.level || 0;
      
      const badge = document.getElementById('hafen-level-badge');
      if (badge) {
        badge.textContent = `Stufe ${level}`;
      }
      
      // Zeige/Verstecke Icon basierend auf Stufe (nur Stufe 1+)
      const hafenIcon = document.getElementById('draggable-hafen');
      const hafenIconImg = document.getElementById('hafen-icon-img');
      
      if (hafenIcon && hafenIconImg) {
        if (level >= 1) {
          hafenIcon.style.display = 'block';
          
          // Wechsle Icon basierend auf Stufe
          // Stufe 1-2: Hafen_icon1.png, Stufe 3+: Hafen_icon2.png
          let iconPath;
          if (level >= 3) {
            iconPath = '/assets/Gebäude/Hafen/Hafen_icon2.png';
          } else {
            iconPath = '/assets/Gebäude/Hafen/Hafen_icon1.png';
          }
          
          // Entferne alten onerror Handler um Endlosschleife zu vermeiden
          hafenIconImg.onerror = null;
          
          const timestamp = new Date().getTime();
          hafenIconImg.src = `${iconPath}?t=${timestamp}`;
          
          // Setze neuen Error-Handler mit Fallback
          hafenIconImg.onerror = () => {
            console.warn('Hafen-Icon konnte nicht geladen werden:', iconPath);
            // Versuche Fallback-Pfad nur einmal
            if (iconPath.includes('Hafen_icon1.png') || iconPath.includes('hafen_icon1.png')) {
              hafenIconImg.src = `/assets/Gebäude/Hafen/Hafen_icon1.png?t=${timestamp}`;
              hafenIconImg.onerror = () => {
                console.error('Hafen-Icon konnte auch im Fallback-Pfad nicht geladen werden');
                hafenIconImg.onerror = null; // Verhindere weitere Fehler
              };
            } else {
              hafenIconImg.onerror = null; // Verhindere weitere Fehler
            }
          };
          
          // Stelle sicher, dass Transparenz erhalten bleibt
          hafenIconImg.style.background = 'transparent';
          hafenIconImg.style.opacity = '1';
          
          // Lade gespeicherte Position für diese Insel
          const savedPosition = localStorage.getItem(`hafen-icon-position-${currentIslandId}`);
          if (savedPosition) {
            try {
              const { x, y } = JSON.parse(savedPosition);
              hafenIcon.style.left = `${x}px`;
              hafenIcon.style.top = `${y}px`;
              hafenIcon.style.transform = 'translate(-50%, -50%)';
            } catch (e) {
              console.error('Fehler beim Laden der Hafen-Icon-Position:', e);
            }
          }
        } else {
          hafenIcon.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Hafen-Stufe:', error);
    }
  }

  switchMenu(menu) {
    // Entferne active von allen Items (beide Varianten)
    document.querySelectorAll('.menu-item-island, .sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });

    // Setze active auf geklicktes Item (beide Varianten)
    document.querySelectorAll(`[data-menu="${menu}"]`).forEach(item => {
      item.classList.add('active');
    });

    this.currentMenu = menu;
    this.handleMenuAction(menu);
  }

  handleMenuAction(menu) {
    // Hier können später die verschiedenen Menü-Aktionen implementiert werden
    console.log(`Menü gewechselt zu: ${menu}`);

    switch (menu) {
      case 'island':
        // Zeige Gebäude-Sektion und Karten-Ansicht
        this.showIslandView();
        break;
      case 'islands-overview':
        this.showIslandsOverviewView();
        break;
      case 'map':
        // Zeige nur Karten-Ansicht (ohne Gebäude)
        this.showMapView();
        break;
      case 'forum':
        alert('Forum kommt bald!');
        break;
      case 'friends':
        alert('Freunde-Ansicht kommt bald!');
        break;
      case 'reports':
        alert('Berichte-Ansicht kommt bald!');
        break;
      case 'community':
        alert('Gemeinschafts-Ansicht kommt bald!');
        break;
      case 'leaderboard':
        this.showLeaderboardView();
        break;
      case 'settings':
        this.showSettingsView();
        break;
      case 'upgrades':
        this.showUpgradesView();
        break;
      default:
        break;
    }
  }

  async showIslandView() {
    // Zeige Gebäude-Ansicht
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const mapView = document.getElementById('island-map-view');
    const settingsView = document.getElementById('settings-view');
    const islandsOverviewView = document.getElementById('islands-overview-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    
    // Überschreibe Ansichten nur wenn nicht in Ausbauten-Ansicht
    if (this.currentMenu !== 'upgrades') {
      // Verstecke alle anderen Ansichten, inklusive Inselübersicht
      if (upgradesView) {
        upgradesView.classList.add('hidden');
      }
      if (mapView) {
        mapView.classList.add('hidden');
      }
      if (settingsView) {
        settingsView.classList.add('hidden');
      }
      if (leaderboardView) {
        leaderboardView.classList.add('hidden');
      }
      if (islandsOverviewView) {
        islandsOverviewView.classList.add('hidden');
      }
      if (buildingsView) {
        buildingsView.classList.remove('hidden');
      }
      this.currentMenu = 'island';
    }

    // Lade und aktualisiere Ressourcen für die aktuelle Insel
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (currentIslandId) {
        const { api } = await import('./api.js');
        const resources = await api.getResources(currentIslandId);
        const islandDetails = await api.getVillageDetails(currentIslandId);
        await this.updateResourcesDisplay(resources, islandDetails.village);
        
        // Stelle sicher, dass Figuren auch hier aktualisiert werden
        if (islandDetails && islandDetails.village) {
          await this.updateIslandPeople(islandDetails.village.population || 0);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ressourcen:', error);
    }

    // Initialisiere Gebäude-Manager
    setTimeout(() => {
      import('./buildings.js').then(module => {
        module.initBuildings();
      }).catch(err => {
        console.error('Fehler beim Laden des Buildings-Managers:', err);
      });
    }, 100);
    
    // Lade Bauschleife aus Backend
    await this.loadBuildQueueFromBackend();
    
    // Aktualisiere Bauschleife-Anzeige (zeigt nur aktuelle Insel)
    this.updateBuildQueueDisplay();
  }

  async showMapView() {
    // Zeige nur Karten-Ansicht (ohne Gebäude)
    const buildingsSection = document.getElementById('buildings-section');
    const mapView = document.getElementById('island-map-view');
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    
    if (buildingsSection) {
      buildingsSection.classList.add('hidden');
    }
    if (buildingsView) {
      buildingsView.classList.add('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.add('hidden');
    }
    if (leaderboardView) {
      leaderboardView.classList.add('hidden');
    }
    if (mapView) {
      mapView.classList.remove('hidden');
    }

    // Initialisiere Karten-Viewport (nur einmal)
    const { initMapView } = await import('./map-view.js');
    const mapViewInstance = initMapView();
    
    // Zentriere auf aktuelle Insel und setze Zoom auf 1
    if (mapViewInstance) {
      await mapViewInstance.centerOnCurrentVillage();
      mapViewInstance.setZoom(1);
      // Stelle sicher, dass die Karte sofort gerendert wird
      if (mapViewInstance.canvas && mapViewInstance.ctx) {
        mapViewInstance.updateView();
      }
    }
  }

  async showUpgradesView() {
    // Zeige Ausbauten-Ansicht
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const mapView = document.getElementById('island-map-view');
    const settingsView = document.getElementById('settings-view');
    const islandsOverviewView = document.getElementById('islands-overview-view');
    
    if (buildingsView) {
      buildingsView.classList.add('hidden');
    }
    if (mapView) {
      mapView.classList.add('hidden');
    }
    if (settingsView) {
      settingsView.classList.add('hidden');
    }
    if (islandsOverviewView) {
      islandsOverviewView.classList.add('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.remove('hidden');
    }
    
    // Setze currentMenu auf upgrades
    this.currentMenu = 'upgrades';
    
    // WICHTIG: Lade Bauschleife IMMER aus Backend (auch beim Neuladen)
    await this.loadBuildQueueFromBackend();
    
    // Stelle sicher, dass alle geladenen Items sichtbar sind
    const buildQueue = document.getElementById('build-queue');
    if (buildQueue) {
      const queueItems = buildQueue.querySelectorAll('.build-queue-item');
      queueItems.forEach(item => {
        item.style.display = '';
      });
      if (queueItems.length > 0) {
        const emptyMsg = buildQueue.querySelector('.build-queue-empty');
        if (emptyMsg) {
          emptyMsg.remove();
        }
      }
    }
    
    // Aktualisiere Bauschleife-Anzeige (zeigt nur aktuelle Insel)
    this.updateBuildQueueDisplay();
    
    // Aktualisiere Ausbauten-Liste mit Icons
    await this.updateUpgradesList();
  }

  showLeaderboardView() {
    // Zeige Rangliste-Ansicht
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const mapView = document.getElementById('island-map-view');
    const settingsView = document.getElementById('settings-view');
    const islandsOverviewView = document.getElementById('islands-overview-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    
    if (buildingsView) {
      buildingsView.classList.add('hidden');
    }
    if (mapView) {
      mapView.classList.add('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.add('hidden');
    }
    if (islandsOverviewView) {
      islandsOverviewView.classList.add('hidden');
    }
    if (settingsView) {
      settingsView.classList.add('hidden');
    }
    if (leaderboardView) {
      leaderboardView.classList.remove('hidden');
      // Lade Rangliste wenn Ansicht geöffnet wird
      this.loadLeaderboard();
    }
  }

  async loadLeaderboard(sortBy = 'points') {
    const loadingEl = document.getElementById('leaderboard-loading');
    const tableEl = document.getElementById('leaderboard-table');
    const tbodyEl = document.getElementById('leaderboard-tbody');
    const sortSelectEl = document.getElementById('leaderboard-sort-select');
    
    if (!loadingEl || !tableEl || !tbodyEl) return;

    try {
      // Zeige Loading
      loadingEl.classList.remove('hidden');
      tableEl.classList.add('hidden');
      
      // Setze Sortier-Option
      if (sortSelectEl) {
        sortSelectEl.value = sortBy;
      }

      // Lade Daten
      const { api } = await import('./api.js');
      const data = await api.getLeaderboard(sortBy);
      
      if (!data || !data.leaderboard || data.leaderboard.length === 0) {
        tbodyEl.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Keine Spieler gefunden</td></tr>';
        loadingEl.classList.add('hidden');
        tableEl.classList.remove('hidden');
        return;
      }

      // Erstelle Tabellenzeilen
      tbodyEl.innerHTML = data.leaderboard.map((player) => `
        <tr class="leaderboard-row">
          <td class="leaderboard-rank">
            <span class="rank-badge rank-${player.rank <= 3 ? player.rank : 'other'}">${player.rank}</span>
          </td>
          <td class="leaderboard-username">${player.username}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.points)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.population)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.wood)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.stone)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.water)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.food)}</td>
          <td class="leaderboard-stat">${this.formatNumber(player.luxury)}</td>
          <td class="leaderboard-stat">${player.islandCount}</td>
        </tr>
      `).join('');

      // Verstecke Loading, zeige Tabelle
      loadingEl.classList.add('hidden');
      tableEl.classList.remove('hidden');
    } catch (error) {
      console.error('Fehler beim Laden der Rangliste:', error);
      tbodyEl.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #ef4444;">Fehler beim Laden der Rangliste</td></tr>';
      loadingEl.classList.add('hidden');
      tableEl.classList.remove('hidden');
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  showBuildingImageModal(buildingType, buildingName, currentLevel) {
    // Erstelle oder finde Modal für Bild-Anzeige
    let modal = document.getElementById('building-image-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'building-image-modal';
      modal.className = 'building-image-modal hidden';
      modal.innerHTML = `
        <div class="building-image-backdrop"></div>
        <div class="building-image-content">
          <button class="building-image-close">×</button>
          <div class="building-image-container">
            <img id="building-image-display" src="" alt="${buildingName}" class="building-image-display">
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Event Listener für Schließen
      const closeBtn = modal.querySelector('.building-image-close');
      const backdrop = modal.querySelector('.building-image-backdrop');
      const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      };
      
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (backdrop) backdrop.addEventListener('click', closeModal);
      
      // ESC-Taste zum Schließen
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      });
    }
    
    // Bestimme Bild-Pfad basierend auf Gebäudetyp und Level
    const getBuildingImage = (type, level) => {
      if (type === 'lagerfeuer') {
        return `/assets/Gebäude/Lagerfeuer/Lagerfeuer${level || 1}.png`;
      }
      if (type === 'hafen') {
        // Hafen: Stufe 1 = hafen1.png, Stufe 2+ = hafen2.png
        return level === 1 
          ? `/assets/Gebäude/Hafen/hafen1.png`
          : `/assets/Gebäude/Hafen/hafen2.png`;
      }
      if (type === 'tafel') {
        return `/assets/Gebäude/Tafel/Tafel${level || 1}.png`;
      }
      // Fallback
      return '/assets/Gebäude/Lagerfeuer/Lagerfeuer1.png';
    };
    
    const imagePath = getBuildingImage(buildingType, currentLevel || 1);
    const imageEl = modal.querySelector('#building-image-display');
    
    if (imageEl) {
      imageEl.src = imagePath;
      imageEl.alt = buildingName;
      imageEl.onerror = function() {
        // Verstecke Bild bei Fehler, zeige nichts
        this.style.display = 'none';
      };
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  async showUpgradeModal(upgradeType) {
    console.log('showUpgradeModal aufgerufen mit:', upgradeType);
    const modal = document.getElementById('upgrade-modal');
    const image = document.getElementById('upgrade-image');
    const title = document.getElementById('upgrade-title');
    const timeEl = document.getElementById('upgrade-time');
    const pointsEl = document.getElementById('upgrade-points');
    const costEl = document.getElementById('upgrade-cost');
    const buildBtn = document.getElementById('upgrade-build-btn');
    
    if (!modal) {
      console.error('Upgrade-Modal nicht gefunden!');
      return;
    }
    
    if (!image) {
      console.error('Upgrade-Image Element nicht gefunden!');
      return;
    }

    try {
      // Hole aktuelles Level des Gebäudes
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Keine Insel ausgewählt');
        return;
      }

      const { api } = await import('./api.js');
      const details = await api.getVillageDetails(currentIslandId);
      const buildings = details?.buildings || [];
      
      // Finde aktuelles Level des Gebäudes
      const existingBuilding = buildings.find(b => b.building_type === upgradeType);
      const currentLevel = existingBuilding?.level || 0;
      const nextLevel = currentLevel + 1;

      // Prüfe ob Maximum erreicht
      if (nextLevel > 20) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.warning('Maximale Stufe (20) bereits erreicht!');
        return;
      }

      // Berechne Kosten und Zeit basierend auf Gebäudetyp
      let cost = { wood: 0, stone: 0 };
      let buildTime = 0;
      
      if (upgradeType === 'hafen') {
        // Hafen: Stufe 1: 100 Holz/10s, ab Stufe 2: verdoppelt + 100 Stein (verdoppelt)
        const baseWood = 100;
        cost.wood = baseWood * Math.pow(2, nextLevel - 1);
        const baseBuildTime = 10;
        buildTime = baseBuildTime * Math.pow(2, nextLevel - 1);
        
        if (nextLevel >= 2) {
          // Ab Stufe 2: zusätzlich Stein (100 * 2^(level-2))
          const baseStone = 100;
          cost.stone = baseStone * Math.pow(2, nextLevel - 2);
        }
      } else {
        // Standard: Lagerfeuer und andere Gebäude
        const baseCost = 10;
        cost.wood = baseCost * Math.pow(2, nextLevel - 1);
        const baseBuildTime = 15;
        buildTime = baseBuildTime * Math.pow(2, nextLevel - 1);
      }
      
      // Punkte pro Stufe: Lagerfeuer gibt 2 Punkte pro Stufe, andere Gebäude 10
      const points = upgradeType === 'lagerfeuer' ? 2 : 10;

      // Mapping für Ausbau-Bilder (basierend auf Level)
      const getUpgradeImage = (type, level) => {
        if (type === 'lagerfeuer') {
          return `/assets/Gebäude/Lagerfeuer/Lagerfeuer${level}.png`;
        }
        if (type === 'hafen') {
          // Hafen: Stufe 1 = hafen1.png, Stufe 2+ = hafen2.png
          return level === 1 
            ? `/assets/Gebäude/Hafen/hafen1.png`
            : `/assets/Gebäude/Hafen/hafen2.png`;
        }
        if (type === 'tafel') {
          // Tafel: Falls Bild vorhanden, sonst Fallback
          return `/assets/Gebäude/Tafel/Tafel${level || 1}.png`;
        }
        // Fallback für andere Gebäude
        return '/assets/Gebäude/Lagerfeuer/Lagerfeuer1.png';
      };

      const upgradeNames = {
        'lagerfeuer': 'Lagerfeuer',
        'hafen': 'Hafen',
        'tafel': 'Die Tafel',
        'lager': 'Lager',
        'unterschlupf': 'Unterschlupf',
        'wachposten': 'Wachposten',
        'werkbank': 'Werkbank',
        'kochstelle': 'Kochstelle',
        'versteck': 'Versteck'
      };

      const imagePath = getUpgradeImage(upgradeType, nextLevel);
      const name = upgradeNames[upgradeType] || upgradeType;
      
      // Setze Bild (verwende aktuelles Level für Anzeige)
      const displayImagePath = getUpgradeImage(upgradeType, currentLevel || 1);
      image.src = displayImagePath;
      image.alt = name;
      
      // Setze Titel
      if (title) {
        title.textContent = `${name} Stufe ${nextLevel}`;
      }
      
      // Setze Informationen
      if (timeEl) {
        timeEl.textContent = `${buildTime} Sekunden`;
      }
      if (pointsEl) {
        // Zeige Punkte für alle Gebäude (Lagerfeuer gibt 2 Punkte pro Stufe)
        pointsEl.textContent = `${points}`;
        const pointsContainer = pointsEl.closest('.upgrade-info-item');
        if (pointsContainer) {
          pointsContainer.style.display = '';
        }
      }
      if (costEl) {
        // Zeige Kosten (Holz und ggf. Stein)
        let costText = `${cost.wood} Holz`;
        if (cost.stone > 0) {
          costText += `, ${cost.stone} Stein`;
        }
        costEl.textContent = costText;
      }
      
      // Zeige Voraussetzungen
      const requirementsEl = document.getElementById('upgrade-requirements');
      const requirementsValueEl = document.getElementById('upgrade-requirements-value');
      if (requirementsEl && requirementsValueEl) {
        let requirements = [];
        
        // Prüfe Voraussetzungen für Hafen
        if (upgradeType === 'hafen' && nextLevel >= 3) {
          const lagerfeuer = buildings.find(b => b.building_type === 'lagerfeuer');
          const requiredLevel = 2;
          if (!lagerfeuer || lagerfeuer.level < requiredLevel) {
            requirements.push(`Lagerfeuer Stufe ${requiredLevel} (aktuell: ${lagerfeuer?.level || 0})`);
          } else {
            requirements.push(`Lagerfeuer Stufe ${requiredLevel} ✓`);
          }
        }
        
        if (requirements.length > 0) {
          requirementsValueEl.textContent = requirements.join(', ');
          requirementsEl.style.display = '';
        } else {
          requirementsEl.style.display = 'none';
        }
      }
      
      // Verstecke Meldung beim Öffnen
      this.hideUpgradeMessage();
      
      // Setze Build-Button Event Listener
      if (buildBtn) {
        // Entferne alte Event Listener
        const newBtn = buildBtn.cloneNode(true);
        buildBtn.parentNode.replaceChild(newBtn, buildBtn);
        
        newBtn.addEventListener('click', async () => {
          // Verstecke vorherige Meldungen
          this.hideUpgradeMessage();
          
          // Prüfe ob Gebäude bereits in Bauschleife ist
          const buildQueue = document.getElementById('build-queue');
          if (buildQueue) {
            const existingItems = buildQueue.querySelectorAll('.build-queue-item');
            // Mehrere Stufen gleichzeitig erlaubt - keine Prüfung mehr
          }
          
          await this.startUpgrade(upgradeType, {
            name: name,
            level: nextLevel,
            time: buildTime,
            points: points,
            cost: cost
          });
        });
      }
      
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('Modal sollte jetzt sichtbar sein');
    } catch (error) {
      console.error('Fehler beim Laden der Ausbau-Daten:', error);
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Fehler beim Laden der Ausbau-Daten');
    }
  }

  async startUpgrade(upgradeType, data) {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Keine Insel ausgewählt');
        return;
      }

      const { api } = await import('./api.js');
      
      // Starte Ausbau auf Backend (zieht Ressourcen ab und prüft Voraussetzungen)
      const result = await api.startUpgrade(currentIslandId, upgradeType, data.level);
      
      if (!result.success) {
        const { notificationManager } = await import('./notification.js');
        const errorMessage = result.error || 'Fehler beim Starten des Ausbaus';
        notificationManager.error(`Voraussetzungen nicht erfüllt: ${errorMessage}`);
        return;
      }

      // Erfolg: Zeige Erfolgsmeldung
      const { notificationManager } = await import('./notification.js');
      // Notification entfernt - kein Pop-up mehr beim Starten des Ausbaus
      
      // Füge zur Bauschleife hinzu
      const queueItemId = await this.addToBuildQueue(upgradeType, data, result.finishTime);
      
      // Aktualisiere Ressourcen-Anzeige
      await this.updateResourcesDisplay(await api.getResources(currentIslandId));
      
      // Aktualisiere Ausbauten-Liste
      await this.updateUpgradesList();
      
    } catch (error) {
      console.error('Fehler beim Starten des Ausbaus:', error);
      const { notificationManager } = await import('./notification.js');
      const errorMessage = error.message || 'Fehler beim Starten des Ausbaus';
      notificationManager.error(`Voraussetzungen nicht erfüllt: ${errorMessage}`);
    }
  }

  async addToBuildQueue(upgradeType, data, finishTimeISO) {
    const buildQueue = document.getElementById('build-queue');
    if (!buildQueue) return null;

    // Hole aktuelle Insel-ID
    const currentIslandId = await this.getCurrentIslandIdAsync();
    if (!currentIslandId) {
      console.error('Keine Insel ausgewählt für Bauschleife');
      return null;
    }

    // Prüfe maximale Bauschleife-Größe (5 Einträge)
    const allQueueItems = buildQueue.querySelectorAll('.build-queue-item');
    if (allQueueItems.length >= 5) {
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Bauschleife ist voll! Maximal 5 Ausbauten gleichzeitig möglich.');
      return null;
    }

    // Entferne "Keine Ausbauten" Meldung falls vorhanden
    const emptyMsg = buildQueue.querySelector('.build-queue-empty');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    // WICHTIG: Verwende IMMER die Finish-Zeit aus dem Backend
    // Das Backend berechnet die korrekte Finish-Zeit basierend auf der aktuellen Queue
    // und speichert sie in upgrade_finishes_at
    const calculatedFinishTime = new Date(finishTimeISO).getTime();
    
    console.log(`📅 Neues Gebäude ${upgradeType} Stufe ${data.level}: Finish-Zeit aus Backend = ${new Date(calculatedFinishTime).toLocaleString('de-DE')}`);

    // Erstelle Queue-Item
    const queueItem = document.createElement('div');
    const queueItemId = `build-queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    queueItem.id = queueItemId;
    queueItem.className = 'build-queue-item';
    queueItem.dataset.upgradeType = upgradeType;
    queueItem.dataset.level = data.level;
    queueItem.dataset.points = data.points;
    queueItem.dataset.islandId = currentIslandId.toString(); // Wichtig: Insel-ID speichern
    
    const upgradeIcons = {
      'lagerfeuer': '🔥',
      'hafen': '🛶',
      'lager': '🪵',
      'unterschlupf': '🏝️',
      'wachposten': '🌴',
      'werkbank': '🪨',
      'kochstelle': '🍖',
      'versteck': '🌿'
    };
    
    // Formatierte Uhrzeit für Anzeige
    const finishDate = new Date(calculatedFinishTime);
    const timeString = finishDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Ermittle Voraussetzungen für dieses Gebäude
    let requirementsText = '';
    if (upgradeType === 'hafen' && data.level >= 3) {
      // Hole aktuelle Gebäude-Daten für Voraussetzungen-Prüfung
      try {
        const { api } = await import('./api.js');
        const buildings = await api.getBuildings(currentIslandId);
        const lagerfeuer = buildings.find(b => b.building_type === 'lagerfeuer');
        const requiredLevel = 2;
        requirementsText = `Voraussetzungen: Lagerfeuer Stufe ${requiredLevel}`;
      } catch (error) {
        console.error('Fehler beim Laden der Gebäude für Voraussetzungen:', error);
      }
    }
    
    queueItem.innerHTML = `
      <div class="build-queue-item-icon">${upgradeIcons[upgradeType] || '🔨'}</div>
      <div class="build-queue-item-info">
        <div class="build-queue-item-name">${data.name} Stufe ${data.level}</div>
        <div class="build-queue-item-timer" data-finish-time="${calculatedFinishTime}">${data.time}s</div>
        ${requirementsText ? `<div class="build-queue-item-requirements">${requirementsText}</div>` : ''}
        <div class="build-queue-item-finish-time">Fertig um: ${timeString}</div>
      </div>
      <button class="build-queue-item-cancel" title="Ausbau abbrechen">✕</button>
    `;
    
    // Speichere Kosten für spätere Rückerstattung
    queueItem._cost = data.cost;
    queueItem._upgradeData = data;
    queueItem._upgradeType = upgradeType;
    
    // Event Listener für Abbrechen-Button
    const cancelBtn = queueItem.querySelector('.build-queue-item-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.showCancelUpgradeModal(queueItem, upgradeType, data);
      });
    }

    buildQueue.appendChild(queueItem);

    // Starte Timer
    this.startBuildTimer(queueItem, calculatedFinishTime, upgradeType, data);

    // Aktualisiere Bauschleife-Anzeige (zeigt nur aktuelle Insel)
    this.updateBuildQueueDisplay();

    return queueItemId;
  }

  async loadBuildQueueFromBackend() {
    try {
      // Prüfe ob Benutzer eingeloggt ist
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('⚠️ Kein Token vorhanden, überspringe Laden der Bauschleife');
        return;
      }

      const { api } = await import('./api.js');
      
      // Hole alle Inseln des Benutzers
      const villages = await api.getVillages();
      if (!villages || villages.length === 0) {
        console.log('⚠️ Keine Inseln gefunden, überspringe Laden der Bauschleife');
        return;
      }

      const buildQueue = document.getElementById('build-queue');
      if (!buildQueue) {
        console.log('⚠️ Build-Queue Element nicht gefunden');
        return;
      }
      
      console.log('📦 Lade Bauschleife aus Backend für', villages.length, 'Insel(n)...');

      // Entferne alle bestehenden Queue-Items
      const existingItems = buildQueue.querySelectorAll('.build-queue-item');
      console.log(`🗑️ Entferne ${existingItems.length} bestehende Queue-Items`);
      existingItems.forEach(item => item.remove());
      const emptyMsg = buildQueue.querySelector('.build-queue-empty');
      if (emptyMsg) {
        emptyMsg.remove();
      }

      // Lade für jede Insel die Gebäude mit upgrade_finishes_at
      let totalLoaded = 0;
      for (const village of villages) {
        try {
          const details = await api.getVillageDetails(village.id);
          const buildings = details?.buildings || [];
          
          console.log(`📋 Insel ${village.id}: ${buildings.length} Gebäude insgesamt gefunden`);
          
          // Filtere Gebäude mit upgrade_finishes_at
          const buildingsInQueue = buildings.filter(b => {
            const hasUpgrade = !!b.upgrade_finishes_at;
            if (hasUpgrade) {
              console.log(`  ✅ ${b.building_type} Stufe ${b.level}: upgrade_finishes_at = ${b.upgrade_finishes_at} (Typ: ${typeof b.upgrade_finishes_at})`);
            }
            return hasUpgrade;
          });
          
          console.log(`📦 Insel ${village.id}: ${buildingsInQueue.length} Gebäude in der Bauschleife gefunden`);
          
          if (buildingsInQueue.length === 0) {
            continue;
          }
          
          // Sortiere nach upgrade_finishes_at (aufsteigend)
          buildingsInQueue.sort((a, b) => {
            const timeA = new Date(a.upgrade_finishes_at).getTime();
            const timeB = new Date(b.upgrade_finishes_at).getTime();
            return timeA - timeB;
          });

          // Erstelle Queue-Items für jedes Gebäude
          // WICHTIG: Sortiere nach upgrade_finishes_at, damit die Reihenfolge korrekt ist
          for (const building of buildingsInQueue) {
            const upgradeType = building.building_type;
            const level = building.level + 1; // Nächstes Level (das gebaut wird)
            
            // Konvertiere upgrade_finishes_at zu einem Timestamp
            let finishTimeFromDB;
            try {
              if (typeof building.upgrade_finishes_at === 'string') {
                finishTimeFromDB = new Date(building.upgrade_finishes_at).getTime();
              } else if (building.upgrade_finishes_at instanceof Date) {
                finishTimeFromDB = building.upgrade_finishes_at.getTime();
              } else {
                finishTimeFromDB = parseInt(building.upgrade_finishes_at) || Date.now();
              }
            } catch (error) {
              console.error(`❌ Fehler beim Konvertieren der Finish-Zeit für ${upgradeType}:`, error, building.upgrade_finishes_at);
              continue;
            }
            
            const now = Date.now();
            
            console.log(`  🔍 Prüfe ${upgradeType} Stufe ${level}: Finish=${new Date(finishTimeFromDB).toLocaleString('de-DE')}, Jetzt=${new Date(now).toLocaleString('de-DE')}, Verbleibend=${Math.floor((finishTimeFromDB - now) / 1000)}s`);
            
            // Prüfe ob die Finish-Zeit bereits erreicht wurde
            if (finishTimeFromDB <= now) {
              // Gebäude ist fertig - rufe completeUpgrade auf
              console.log(`⏰ Gebäude ${upgradeType} Stufe ${level} ist fertig, schließe ab...`);
              
              // Berechne Punkte
              const points = upgradeType === 'lagerfeuer' ? level * 2 : 10;
              
              try {
                const { api } = await import('./api.js');
                await api.completeUpgrade(village.id, upgradeType, level, points);
                
                // Aktualisiere die Bauschleife nach dem Abschließen
                await this.loadBuildQueueFromBackend();
                continue; // Überspringe dieses Gebäude, da es bereits fertig ist
              } catch (error) {
                console.error(`Fehler beim Abschließen von ${upgradeType} Stufe ${level}:`, error);
                // Weiter mit dem Laden, auch wenn das Abschließen fehlgeschlagen ist
              }
            }
            
            // Berechne Kosten und Zeit basierend auf Gebäudetyp und Level
            let cost = { wood: 0, stone: 0 };
            let buildTime = 0;
            
            if (upgradeType === 'hafen') {
              const baseWood = 100;
              cost.wood = baseWood * Math.pow(2, level - 1);
              const baseBuildTime = 10;
              buildTime = baseBuildTime * Math.pow(2, level - 1);
              
              if (level >= 2) {
                const baseStone = 100;
                cost.stone = baseStone * Math.pow(2, level - 2);
              }
            } else {
              const baseCost = 10;
              cost.wood = baseCost * Math.pow(2, level - 1);
              const baseBuildTime = 15;
              buildTime = baseBuildTime * Math.pow(2, level - 1);
            }

            // Berechne Punkte (2 Punkte pro Stufe für Lagerfeuer, sonst 10)
            const points = upgradeType === 'lagerfeuer' ? level * 2 : 10;

            // Gebäudenamen
            const upgradeNames = {
              'lagerfeuer': 'Lagerfeuer',
              'hafen': 'Hafen',
              'lager': 'Lager',
              'unterschlupf': 'Unterschlupf',
              'wachposten': 'Wachposten',
              'werkbank': 'Werkbank',
              'kochstelle': 'Kochstelle',
              'versteck': 'Versteck'
            };
            const name = upgradeNames[upgradeType] || upgradeType;

            // Erstelle Queue-Item
            const data = {
              name,
              level,
              time: buildTime,
              points,
              cost
            };

            // Verwende die tatsächliche Finish-Zeit aus dem Backend
            console.log(`  ➕ Füge ${upgradeType} Stufe ${level} zur Queue hinzu...`);
            const queueItemId = await this.addToBuildQueueFromBackend(upgradeType, data, building.upgrade_finishes_at, village.id);
            if (queueItemId) {
              totalLoaded++;
              console.log(`  ✅ Erfolgreich hinzugefügt: ${queueItemId}`);
            } else {
              console.log(`  ⚠️ Konnte nicht hinzugefügt werden (bereits fertig?)`);
            }
          }
        } catch (error) {
          console.error(`Fehler beim Laden der Bauschleife für Insel ${village.id}:`, error);
        }
      }

      console.log(`✅ Bauschleife geladen: ${totalLoaded} Gebäude in der Queue`);
      
      // Prüfe ob Timer gestartet wurden
      const queueItemsAfterLoad = buildQueue.querySelectorAll('.build-queue-item');
      console.log(`📊 Nach dem Laden: ${queueItemsAfterLoad.length} Items in der Queue`);
      queueItemsAfterLoad.forEach((item, index) => {
        const timerEl = item.querySelector('.build-queue-item-timer');
        const finishTime = item._finishTime || parseInt(timerEl?.dataset.finishTime || '0');
        console.log(`  Item ${index + 1}: ${item.dataset.upgradeType} Stufe ${item.dataset.level}, Insel: ${item.dataset.islandId}, Finish: ${new Date(finishTime).toLocaleString('de-DE')}, Timer-Text: "${timerEl?.textContent}"`);
      });
      
      // WICHTIG: Stelle sicher, dass alle geladenen Items sichtbar sind
      // Auch wenn die Insel-ID noch nicht gesetzt ist (beim Neuladen)
      queueItemsAfterLoad.forEach(item => {
        item.style.display = '';
      });
      
      // Entferne "Keine Ausbauten" Meldung wenn Items vorhanden sind
      if (queueItemsAfterLoad.length > 0) {
        const emptyMsg = buildQueue.querySelector('.build-queue-empty');
        if (emptyMsg) {
          emptyMsg.remove();
        }
      }
      
      // Aktualisiere Anzeige (filtert nach aktueller Insel, wenn gesetzt)
      this.updateBuildQueueDisplay();
    } catch (error) {
      console.error('Fehler beim Laden der Bauschleife aus dem Backend:', error);
    }
  }

  async addToBuildQueueFromBackend(upgradeType, data, finishTimeISO, islandId) {
    const buildQueue = document.getElementById('build-queue');
    if (!buildQueue) return null;

    // Entferne "Keine Ausbauten" Meldung falls vorhanden
    const emptyMsg = buildQueue.querySelector('.build-queue-empty');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    // WICHTIG: Verwende IMMER die tatsächliche Finish-Zeit aus dem Backend
    // Die Finish-Zeit wird im Backend gespeichert und muss hier verwendet werden
    // Konvertiere die ISO-Zeit korrekt (kann String oder Date sein)
    let calculatedFinishTime;
    if (typeof finishTimeISO === 'string') {
      calculatedFinishTime = new Date(finishTimeISO).getTime();
    } else if (finishTimeISO instanceof Date) {
      calculatedFinishTime = finishTimeISO.getTime();
    } else {
      calculatedFinishTime = parseInt(finishTimeISO) || Date.now();
    }
    
    // Prüfe ob die Finish-Zeit bereits erreicht wurde
    const now = Date.now();
    if (calculatedFinishTime <= now) {
      console.log(`⚠️ Gebäude ${upgradeType} Stufe ${data.level} ist bereits fertig (Finish: ${new Date(calculatedFinishTime).toLocaleString('de-DE')}, Jetzt: ${new Date(now).toLocaleString('de-DE')})`);
      // Gebäude ist bereits fertig - sollte nicht in die Queue aufgenommen werden
      // Das wird bereits in loadBuildQueueFromBackend geprüft
      return null;
    }
    
    // Debug: Logge die Finish-Zeit
    console.log(`📅 Lade Gebäude ${upgradeType} Stufe ${data.level}: Finish-Zeit = ${new Date(calculatedFinishTime).toLocaleString('de-DE')}, Jetzt = ${new Date(now).toLocaleString('de-DE')}, Verbleibend = ${Math.floor((calculatedFinishTime - now) / 1000)}s`);

    // Erstelle Queue-Item
    const queueItem = document.createElement('div');
    const queueItemId = `build-queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    queueItem.id = queueItemId;
    queueItem.className = 'build-queue-item';
    queueItem.dataset.upgradeType = upgradeType;
    queueItem.dataset.level = data.level;
    queueItem.dataset.points = data.points;
    queueItem.dataset.islandId = islandId.toString();
    
    const upgradeIcons = {
      'lagerfeuer': '🔥',
      'hafen': '🛶',
      'lager': '🪵',
      'unterschlupf': '🏝️',
      'wachposten': '🌴',
      'werkbank': '🪨',
      'kochstelle': '🍖',
      'versteck': '🌿'
    };
    
    // Formatierte Uhrzeit für Anzeige
    const finishDate = new Date(calculatedFinishTime);
    const timeString = finishDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Berechne verbleibende Zeit für die Anzeige
    const remainingSeconds = Math.max(0, Math.floor((calculatedFinishTime - now) / 1000));
    const displayTime = remainingSeconds > 0 ? `${remainingSeconds}s` : '0s';
    
    // Ermittle Voraussetzungen für dieses Gebäude
    let requirementsText = '';
    if (upgradeType === 'hafen' && data.level >= 3) {
      try {
        const { api } = await import('./api.js');
        const buildings = await api.getBuildings(islandId);
        const lagerfeuer = buildings.find(b => b.building_type === 'lagerfeuer');
        const requiredLevel = 2;
        requirementsText = `Voraussetzungen: Lagerfeuer Stufe ${requiredLevel}`;
      } catch (error) {
        console.error('Fehler beim Laden der Gebäude für Voraussetzungen:', error);
      }
    }
    
    queueItem.innerHTML = `
      <div class="build-queue-item-icon">${upgradeIcons[upgradeType] || '🔨'}</div>
      <div class="build-queue-item-info">
        <div class="build-queue-item-name">${data.name} Stufe ${data.level}</div>
        <div class="build-queue-item-timer" data-finish-time="${calculatedFinishTime}">${displayTime}</div>
        ${requirementsText ? `<div class="build-queue-item-requirements">${requirementsText}</div>` : ''}
        <div class="build-queue-item-finish-time">Fertig um: ${timeString}</div>
      </div>
      <button class="build-queue-item-cancel" title="Ausbau abbrechen">✕</button>
    `;
    
    // Speichere Kosten für spätere Rückerstattung
    queueItem._cost = data.cost;
    queueItem._upgradeData = data;
    queueItem._upgradeType = upgradeType;
    
    // Event Listener für Abbrechen-Button
    const cancelBtn = queueItem.querySelector('.build-queue-item-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.showCancelUpgradeModal(queueItem, upgradeType, data);
      });
    }

    buildQueue.appendChild(queueItem);

    // Starte Timer
    console.log(`  ⏱️ Starte Timer für ${upgradeType} Stufe ${data.level} mit Finish-Zeit ${new Date(calculatedFinishTime).toLocaleString('de-DE')}`);
    this.startBuildTimer(queueItem, calculatedFinishTime, upgradeType, data);

    return queueItemId;
  }

  updateBuildQueueDisplay() {
    const buildQueue = document.getElementById('build-queue');
    if (!buildQueue) return;

    // Hole aktuelle Insel-ID
    this.getCurrentIslandIdAsync().then(currentIslandId => {
      // Wenn keine Insel-ID gesetzt ist, zeige ALLE Items (beim Neuladen)
      // Die Items haben ihre eigene islandId im dataset, also können wir sie alle zeigen
      if (!currentIslandId) {
        const allItems = Array.from(buildQueue.querySelectorAll('.build-queue-item'));
        if (allItems.length > 0) {
          // Zeige alle Items, wenn keine Insel ausgewählt ist (beim Neuladen)
          allItems.forEach(item => {
            item.style.display = '';
          });
          // Entferne "Keine Ausbauten" Meldung wenn Items vorhanden sind
          const emptyMsg = buildQueue.querySelector('.build-queue-empty');
          if (emptyMsg) {
            emptyMsg.remove();
          }
        } else {
          // Zeige "Keine Ausbauten" nur wenn wirklich keine Items vorhanden sind
          const emptyMsg = buildQueue.querySelector('.build-queue-empty');
          if (!emptyMsg) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'build-queue-empty';
            emptyDiv.textContent = 'Keine Ausbauten in der Warteschlange';
            buildQueue.appendChild(emptyDiv);
          }
        }
        return;
      }

      // Zeige nur Items der aktuellen Insel und sortiere sie nach finishTime
      let visibleCount = 0;
      const allItems = Array.from(buildQueue.querySelectorAll('.build-queue-item'));
      
      // Filtere Items der aktuellen Insel
      const currentIslandItems = allItems.filter(item => {
        const itemIslandId = item.dataset.islandId;
        return itemIslandId === currentIslandId.toString();
      });
      
      // Sortiere nach finishTime (aufsteigend - frühere Zeiten zuerst)
      currentIslandItems.sort((a, b) => {
        const timeA = a._finishTime || parseInt(a.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
        const timeB = b._finishTime || parseInt(b.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
        return timeA - timeB;
      });
      
      // Entferne alle Items temporär und füge sie in sortierter Reihenfolge wieder hinzu
      currentIslandItems.forEach(item => {
        item.remove();
      });
      
      // Füge Items in sortierter Reihenfolge wieder hinzu
      currentIslandItems.forEach(item => {
        buildQueue.appendChild(item);
        item.style.display = '';
        visibleCount++;
      });
      
      // Verstecke Items anderer Inseln
      allItems.forEach(item => {
        const itemIslandId = item.dataset.islandId;
        if (itemIslandId !== currentIslandId.toString()) {
          item.style.display = 'none';
        }
      });

      // Zeige "Keine Ausbauten" wenn keine Items sichtbar sind
      const emptyMsg = buildQueue.querySelector('.build-queue-empty');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'build-queue-empty';
          emptyDiv.textContent = 'Keine Ausbauten in der Warteschlange';
          buildQueue.appendChild(emptyDiv);
        }
      } else {
        // Entferne "Keine Ausbauten" Meldung nur wenn Items sichtbar sind
        if (emptyMsg) {
          emptyMsg.remove();
        }
      }
    }).catch(error => {
      console.error('Fehler beim Aktualisieren der Bauschleife:', error);
    });
  }

  startBuildTimer(queueItem, finishTime, upgradeType, data) {
    const timerEl = queueItem.querySelector('.build-queue-item-timer');
    const finishTimeEl = queueItem.querySelector('.build-queue-item-finish-time');
    if (!timerEl) {
      console.error('❌ Timer-Element nicht gefunden für', upgradeType);
      return;
    }

    // Speichere Daten im queueItem für späteren Zugriff
    queueItem._upgradeData = data;
    queueItem._finishTime = finishTime;
    queueItem._upgradeType = upgradeType;

    console.log(`  ⏱️ Timer gestartet für ${upgradeType} Stufe ${data.level}, Finish-Zeit: ${new Date(finishTime).toLocaleString('de-DE')}`);

    const updateTimer = async () => {
      // Prüfe ob Item noch im DOM existiert
      if (!queueItem.parentNode) {
        console.log(`⚠️ Queue-Item ${upgradeType} Stufe ${data.level} wurde entfernt, Timer gestoppt`);
        return;
      }
      
      // Debug: Logge Timer-Update
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((finishTime - now) / 1000));
      if (remaining % 10 === 0 || remaining < 5) { // Logge alle 10 Sekunden oder wenn weniger als 5 Sekunden verbleiben
        console.log(`⏱️ Timer-Update für ${upgradeType} Stufe ${data.level}: ${remaining}s verbleibend`);
      }

      // Dynamisch prüfen ob dieses Gebäude das erste in der Queue ist
      const buildQueue = document.getElementById('build-queue');
      const currentIslandId = queueItem.dataset.islandId;
      const allItems = Array.from(buildQueue?.querySelectorAll('.build-queue-item') || [])
        .filter(item => item.dataset.islandId === currentIslandId && item.style.display !== 'none')
        .sort((a, b) => {
          const timeA = a._finishTime || parseInt(a.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
          const timeB = b._finishTime || parseInt(b.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
          return timeA - timeB;
        });
      
      const currentIndex = allItems.indexOf(queueItem);
      const isFirstInQueue = currentIndex === 0;
      
      // Wenn nicht das erste Gebäude, prüfe ob das vorherige fertig ist
      if (!isFirstInQueue && currentIndex > 0) {
        const previousItem = allItems[currentIndex - 1];
        const previousFinishTime = previousItem._finishTime || parseInt(previousItem.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
        if (previousFinishTime > now) {
          // Vorheriges Gebäude ist noch nicht fertig - zeige "Wartet..."
          if (timerEl && timerEl.parentNode) {
            timerEl.textContent = 'Wartet...';
          }
          if (finishTimeEl && finishTimeEl.parentNode) {
            const finishDate = new Date(finishTime);
            const timeString = finishDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            finishTimeEl.textContent = `Fertig um: ${timeString}`;
          }
          setTimeout(updateTimer, 1000);
          return;
        }
      }

      if (remaining > 0) {
        // Aktualisiere Timer-Anzeige nur wenn Item sichtbar ist
        if (timerEl && timerEl.parentNode) {
          timerEl.textContent = `${remaining}s`;
        }
        if (finishTimeEl && finishTimeEl.parentNode) {
          const finishDate = new Date(finishTime);
          const timeString = finishDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          finishTimeEl.textContent = `Fertig um: ${timeString}`;
        }
        setTimeout(updateTimer, 1000);
      } else {
        // Ausbau fertig
        if (timerEl && timerEl.parentNode) {
          timerEl.textContent = 'Fertig!';
        }
        if (finishTimeEl && finishTimeEl.parentNode) {
          finishTimeEl.textContent = 'Fertig!';
        }
        // Verwende gespeicherte Daten oder hole aus dataset
        const upgradeData = queueItem._upgradeData || {
          name: upgradeType,
          level: parseInt(queueItem.dataset.level) || 1,
          points: parseInt(queueItem.dataset.points) || 10,
          time: 0
        };
        console.log('⏰ Timer abgelaufen, rufe completeUpgrade auf:', upgradeData);
        await this.completeUpgrade(queueItem, upgradeType, upgradeData);
      }
    };

    updateTimer();
  }

  async completeUpgrade(queueItem, upgradeType, data) {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        console.error('Keine Insel ausgewählt');
        // Entferne Item trotzdem aus Bauschleife
        if (queueItem && queueItem.parentNode) {
          queueItem.remove();
        }
        return;
      }

      // Stelle sicher, dass data.points vorhanden ist
      const points = data?.points || parseInt(queueItem?.dataset?.points) || 10;
      const level = data?.level || parseInt(queueItem?.dataset?.level) || 1;
      
      console.log('🔨 Schließe Ausbau ab:', {
        villageId: currentIslandId,
        upgradeType,
        level: level,
        points: points,
        data: data
      });
      
      if (!points || points === 0) {
        console.error('⚠️ Keine Punkte gefunden! data:', data, 'dataset:', queueItem?.dataset);
      }

      const { api } = await import('./api.js');
      
      // Schließe Ausbau auf Backend ab (fügt Punkte hinzu)
      const result = await api.completeUpgrade(currentIslandId, upgradeType, level, points);
      
      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abschließen des Ausbaus');
      }
      
      console.log('✅ Backend-Antwort:', result);

      // Entferne aus Bauschleife (wichtig: sofort nach erfolgreichem Backend-Call)
      if (queueItem && queueItem.parentNode) {
        queueItem.remove();
        console.log('✅ Bauschleife-Item entfernt:', upgradeType, 'Stufe', data.level);
      }
      
      // Aktualisiere Bauschleife-Anzeige (zeigt nur aktuelle Insel)
      this.updateBuildQueueDisplay();

      // Aktualisiere Ressourcen und Punkte
      const details = await api.getVillageDetails(currentIslandId);
      if (details) {
        console.log('✅ Ausbau abgeschlossen - Aktualisiere Anzeige:', {
          upgradeType,
          level: data.level,
          points: data.points,
          villagePoints: details.village?.points
        });
        
        await this.updateResourcesDisplay(details.resources, details.village);
        
        // Aktualisiere Lagerfeuer-Stufe im Icon
        if (upgradeType === 'lagerfeuer') {
          await this.updateLagerfeuerLevel();
        }
        
        // Aktualisiere Hafen-Stufe im Icon und zeige Icon wenn Stufe 1 erreicht
        if (upgradeType === 'hafen') {
          await this.updateHafenLevel();
        }
        
        // Aktualisiere Upgrade-Card Bild falls vorhanden (zeige neue Stufe nach Abschluss)
        const newLevel = parseInt(queueItem?.dataset?.level || data.level);
        
        // Mapping für Ausbau-Bilder (basierend auf Level)
        const getUpgradeImage = (type, level) => {
          if (type === 'lagerfeuer') {
            return `/assets/Gebäude/Lagerfeuer/Lagerfeuer${level}.png`;
          }
          if (type === 'hafen') {
            // Hafen: Stufe 1 = hafen1.png, Stufe 2+ = hafen2.png
            return level === 1 
              ? `/assets/Gebäude/Hafen/hafen1.png`
              : `/assets/Gebäude/Hafen/hafen2.png`;
          }
          return null;
        };
        
        const newImagePath = getUpgradeImage(upgradeType, newLevel);
        if (newImagePath) {
          const upgradeCard = document.querySelector(`[data-upgrade="${upgradeType}"]`);
          if (upgradeCard) {
            const cardImage = upgradeCard.querySelector('img');
            if (cardImage) {
              cardImage.src = newImagePath;
            }
          }
        }
        
        // Aktualisiere Kartenansicht falls geöffnet (für Punkte-Anzeige)
        try {
          if (window.mapViewInstance && window.mapViewInstance.loadPlayerIslands) {
            await window.mapViewInstance.loadPlayerIslands();
            // Aktualisiere auch das Info-Panel falls es geöffnet ist
            if (window.mapViewInstance.selectedIsland) {
              const selectedVillageId = window.mapViewInstance.selectedIsland.villageId || window.mapViewInstance.selectedIsland.id;
              const updatedIsland = window.mapViewInstance.playerIslands.find(
                island => (island.villageId || island.id) === selectedVillageId
              );
              if (updatedIsland) {
                const panel = document.getElementById('island-info-panel');
                if (panel && !panel.classList.contains('hidden')) {
                  const pointsEl = document.getElementById('island-info-points');
                  if (pointsEl) {
                    const points = updatedIsland.points !== undefined ? updatedIsland.points : 0;
                    pointsEl.textContent = `⭐ Punkte: ${points}`;
                  }
                }
              }
            }
          }
        } catch (error) {
          // Ignoriere Fehler wenn Kartenansicht nicht geladen ist
          console.log('Kartenansicht nicht verfügbar für Update:', error);
        }
      }

      const { notificationManager } = await import('./notification.js');
      const pointsText = data.points > 0 ? ` +${data.points} Punkte` : '';
      // Notification entfernt - kein Pop-up mehr beim Beenden des Ausbaus
    } catch (error) {
      console.error('Fehler beim Abschließen des Ausbaus:', error);
      
      // Entferne Item auch bei Fehler aus der Bauschleife, um Inkonsistenzen zu vermeiden
      if (queueItem && queueItem.parentNode) {
        queueItem.remove();
        console.log('⚠️ Bauschleife-Item entfernt (nach Fehler):', upgradeType);
      }
      
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Fehler beim Abschließen des Ausbaus');
    }
  }

  hideUpgradeModal() {
    const modal = document.getElementById('upgrade-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
    // Verstecke Meldung beim Schließen
    this.hideUpgradeMessage();
  }

  showUpgradeMessage(message, type = 'error') {
    const messageEl = document.getElementById('upgrade-message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `upgrade-message ${type}`;
      messageEl.classList.remove('hidden');
    }
  }

  hideUpgradeMessage() {
    const messageEl = document.getElementById('upgrade-message');
    if (messageEl) {
      messageEl.classList.add('hidden');
      messageEl.textContent = '';
    }
  }

  async showCancelUpgradeModal(queueItem, upgradeType, data) {
    // Prüfe ob es noch spätere Aufträge für denselben Gebäudetyp gibt
    const buildQueue = document.getElementById('build-queue');
    const currentIslandId = await this.getCurrentIslandIdAsync();
    const allQueueItems = buildQueue ? Array.from(buildQueue.querySelectorAll('.build-queue-item')) : [];
    
    // Filtere Items derselben Insel und desselben Gebäudetyps
    const sameTypeItems = allQueueItems.filter(item => {
      const itemType = item.dataset.upgradeType;
      const itemIslandId = item.dataset.islandId;
      return itemType === upgradeType && itemIslandId === currentIslandId?.toString();
    });
    
    // Sortiere nach Finish-Zeit (späteste zuerst = absteigend)
    sameTypeItems.sort((a, b) => {
      const timeA = a._finishTime || parseInt(a.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
      const timeB = b._finishTime || parseInt(b.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
      return timeB - timeA; // Späteste zuerst (absteigend)
    });
    
    // Prüfe ob das aktuelle Item das letzte (späteste) ist
    // Das letzte Item ist das mit der spätesten Finish-Zeit, also das erste nach Sortierung
    const isLastItem = sameTypeItems.length > 0 && sameTypeItems[0] === queueItem;
    
    if (!isLastItem) {
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Nur der letzte Auftrag eines Gebäudetyps kann abgebrochen werden. Bitte breche zuerst die späteren Aufträge ab.');
      return;
    }

    // Erstelle Modal falls nicht vorhanden
    let modal = document.getElementById('cancel-upgrade-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cancel-upgrade-modal';
      modal.className = 'cancel-upgrade-modal hidden';
      modal.innerHTML = `
        <div class="cancel-upgrade-backdrop"></div>
        <div class="cancel-upgrade-content">
          <h2 class="cancel-upgrade-title">Ausbau abbrechen?</h2>
          <div class="cancel-upgrade-body">
            <p class="cancel-upgrade-warning">Möchtest du diesen Ausbau wirklich abbrechen?</p>
            <p class="cancel-upgrade-refund">Du erhältst <strong>100%</strong> der Rohstoffe zurückerstattet:</p>
            <div class="cancel-upgrade-refund-list" id="cancel-refund-list"></div>
          </div>
          <div class="cancel-upgrade-buttons">
            <button class="cancel-upgrade-btn cancel-upgrade-btn-confirm" id="cancel-confirm-btn">Abbrechen</button>
            <button class="cancel-upgrade-btn cancel-upgrade-btn-cancel" id="cancel-cancel-btn">Zurück</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Event Listeners
      document.getElementById('cancel-cancel-btn')?.addEventListener('click', () => {
        this.hideCancelUpgradeModal();
      });
      document.getElementById('cancel-confirm-btn')?.addEventListener('click', () => {
        this.cancelUpgrade(queueItem);
      });
      
      // Schließen bei Klick außerhalb
      modal.querySelector('.cancel-upgrade-backdrop')?.addEventListener('click', () => {
        this.hideCancelUpgradeModal();
      });
    }

    // Berechne Rückerstattung (100% der Kosten - vollständige Rückerstattung)
    const cost = queueItem._cost || data.cost || { wood: 0, stone: 0 };
    const refund = {
      wood: cost.wood || 0,
      stone: cost.stone || 0
    };

    // Zeige Rückerstattung
    const refundList = document.getElementById('cancel-refund-list');
    if (refundList) {
      let refundText = '';
      if (refund.wood > 0) {
        refundText += `<div class="cancel-refund-item">🪵 ${refund.wood} Holz</div>`;
      }
      if (refund.stone > 0) {
        refundText += `<div class="cancel-refund-item">🪨 ${refund.stone} Stein</div>`;
      }
      refundList.innerHTML = refundText || '<div class="cancel-refund-item">Keine Rückerstattung</div>';
    }

    // Speichere Queue-Item im Modal für späteren Zugriff
    modal._queueItem = queueItem;
    modal._refund = refund;

    // Zeige Modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hideCancelUpgradeModal() {
    const modal = document.getElementById('cancel-upgrade-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  async cancelUpgrade(queueItem) {
    try {
      const modal = document.getElementById('cancel-upgrade-modal');
      if (!modal || !modal._queueItem) {
        console.error('Modal-Daten nicht gefunden');
        return;
      }

      const refund = modal._refund;
      const upgradeType = queueItem._upgradeType || queueItem.dataset.upgradeType;
      const level = parseInt(queueItem.dataset.level) || 1;
      const finishTime = queueItem._finishTime || parseInt(queueItem.querySelector('.build-queue-item-timer')?.dataset.finishTime || '0');
      const currentIslandId = await this.getCurrentIslandIdAsync();

      if (!currentIslandId) {
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Keine Insel ausgewählt');
        return;
      }

      const { api } = await import('./api.js');

      // Rufe Backend auf, um Ausbau abzubrechen
      // Sende auch die Finish-Zeit, damit das Backend den richtigen Auftrag identifizieren kann
      const result = await api.cancelUpgrade(currentIslandId, upgradeType, level, refund, finishTime);

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abbrechen des Ausbaus');
      }

      // Entferne aus Queue
      if (queueItem && queueItem.parentNode) {
        queueItem.remove();
      }

      // Schließe Modal
      this.hideCancelUpgradeModal();

      // Aktualisiere Ressourcen-Anzeige
      await this.updateResourcesDisplay(await api.getResources(currentIslandId));

      // Aktualisiere Bauschleife
      this.updateBuildQueueDisplay();

      // Zeige Erfolgsmeldung
      const { notificationManager } = await import('./notification.js');
      notificationManager.success(`Ausbau abgebrochen. ${refund.wood > 0 ? `${refund.wood} Holz` : ''} ${refund.stone > 0 ? `${refund.stone} Stein` : ''} zurückerstattet.`);

    } catch (error) {
      console.error('Fehler beim Abbrechen des Ausbaus:', error);
      const { notificationManager } = await import('./notification.js');
      notificationManager.error(error.message || 'Fehler beim Abbrechen des Ausbaus');
    }
  }

  showSettingsView() {
    // Zeige Einstellungen-Ansicht
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const mapView = document.getElementById('island-map-view');
    const settingsView = document.getElementById('settings-view');
    const islandsOverviewView = document.getElementById('islands-overview-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    
    if (buildingsView) {
      buildingsView.classList.add('hidden');
    }
    if (mapView) {
      mapView.classList.add('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.add('hidden');
    }
    if (islandsOverviewView) {
      islandsOverviewView.classList.add('hidden');
    }
    if (leaderboardView) {
      leaderboardView.classList.add('hidden');
    }
    if (settingsView) {
      settingsView.classList.remove('hidden');
    }
  }

  showIslandsOverviewView() {
    // Zeige Inseln-Übersicht
    const buildingsView = document.getElementById('buildings-view');
    const upgradesView = document.getElementById('upgrades-view');
    const mapView = document.getElementById('island-map-view');
    const settingsView = document.getElementById('settings-view');
    const islandsOverviewView = document.getElementById('islands-overview-view');
    const leaderboardView = document.getElementById('leaderboard-view');
    
    if (buildingsView) {
      buildingsView.classList.add('hidden');
    }
    if (mapView) {
      mapView.classList.add('hidden');
    }
    if (upgradesView) {
      upgradesView.classList.add('hidden');
    }
    if (settingsView) {
      settingsView.classList.add('hidden');
    }
    if (leaderboardView) {
      leaderboardView.classList.add('hidden');
    }
    if (islandsOverviewView) {
      islandsOverviewView.classList.remove('hidden');
      // Lade Inseln wenn Ansicht geöffnet wird
      this.loadIslandsOverview();
    }
  }

  async loadIslandsOverview() {
    const islandsList = document.getElementById('islands-list');
    if (!islandsList) return;

    try {
      const { api } = await import('./api.js');
      const islands = await api.getVillages();
      
      if (islands.length === 0) {
        islandsList.innerHTML = '<div class="islands-empty">Du hast noch keine Inseln. Erobere deine erste Insel auf der Karte!</div>';
        return;
      }

      const currentIslandId = await this.getCurrentIslandIdAsync();
      
      islandsList.innerHTML = islands.map(island => `
        <div class="island-card ${island.id === currentIslandId ? 'island-card-active' : ''}" data-island-id="${island.id}">
          <div class="island-card-header">
            <div class="island-name-container">
              <input type="text" class="island-name-input" value="${island.name}" data-island-id="${island.id}" maxlength="50">
            </div>
            ${island.id === currentIslandId ? '<span class="island-badge-active">Aktuell</span>' : ''}
          </div>
          <div class="island-card-info">
            <div class="island-info-item">
              <span class="island-info-label">Feldnummer:</span>
              <span class="island-info-value">${(island.y * 100) + island.x + 1}</span>
            </div>
            <div class="island-info-item">
              <span class="island-info-label">Bevölkerung:</span>
              <span class="island-info-value">${island.population}</span>
            </div>
            <div class="island-info-item">
              <span class="island-info-label">⭐ Punkte:</span>
              <span class="island-info-value">${island.points !== undefined ? island.points : 0}</span>
            </div>
          </div>
          <div class="island-resources-preview" id="island-resources-${island.id}">
            <div class="island-resources-loading">Lade Ressourcen...</div>
          </div>
          <button class="btn btn-primary island-switch-btn" data-island-id="${island.id}">
            ${island.id === currentIslandId ? 'Aktuelle Insel' : 'Zu dieser Insel wechseln'}
          </button>
        </div>
      `).join('');

      // Lade Ressourcen für jede Insel
      for (const island of islands) {
        try {
          const resources = await api.getResources(island.id);
          const resourcesContainer = document.getElementById(`island-resources-${island.id}`);
          if (resourcesContainer && resources) {
            resourcesContainer.innerHTML = `
              <div class="island-resources-grid">
                <div class="island-resource-item">
                  <span class="island-resource-icon">🪵</span>
                  <span class="island-resource-value">${Math.floor(resources.wood || 0)}</span>
                </div>
                <div class="island-resource-item">
                  <span class="island-resource-icon">🪨</span>
                  <span class="island-resource-value">${Math.floor(resources.stone || 0)}</span>
                </div>
                <div class="island-resource-item">
                  <span class="island-resource-icon">💧</span>
                  <span class="island-resource-value">${Math.floor(resources.water || 0)}</span>
                </div>
                <div class="island-resource-item">
                  <span class="island-resource-icon">🍖</span>
                  <span class="island-resource-value">${Math.floor(resources.food || 0)}</span>
                </div>
                <div class="island-resource-item">
                  <span class="island-resource-icon">💎</span>
                  <span class="island-resource-value">${Math.floor(resources.luxury || 0)}</span>
                </div>
              </div>
            `;
          }
        } catch (error) {
          console.error(`Fehler beim Laden der Ressourcen für Insel ${island.id}:`, error);
          const resourcesContainer = document.getElementById(`island-resources-${island.id}`);
          if (resourcesContainer) {
            resourcesContainer.innerHTML = '<div class="island-resources-error">Fehler beim Laden</div>';
          }
        }
      }

      // Event Listener für Wechsel-Buttons
      islandsList.querySelectorAll('.island-switch-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const islandId = parseInt(e.target.dataset.islandId);
          await this.switchToIsland(islandId);
        });
      });

      // Event Listener für automatisches Speichern beim Verlassen des Eingabefelds oder Enter-Taste
      islandsList.querySelectorAll('.island-name-input').forEach(input => {
        // Setze defaultValue für Vergleich
        input.defaultValue = input.value;
        
        // Speichere automatisch beim Verlassen des Eingabefelds (blur)
        input.addEventListener('blur', async (e) => {
          const islandId = parseInt(e.target.dataset.islandId);
          const newName = e.target.value.trim();
          const oldName = e.target.defaultValue.trim();
          
          // Nur speichern wenn Name geändert wurde und nicht leer ist
          if (newName && newName !== oldName) {
            await this.updateIslandName(islandId, newName);
          } else if (!newName) {
            // Wenn leer, setze zurück auf alten Namen
            e.target.value = oldName;
          }
        });

        // Speichere auch bei Enter-Taste
        input.addEventListener('keypress', async (e) => {
          if (e.key === 'Enter') {
            e.target.blur(); // Trigger blur event, der dann speichert
          }
        });
      });
    } catch (error) {
      console.error('Fehler beim Laden der Inseln:', error);
      islandsList.innerHTML = '<div class="islands-error">Fehler beim Laden der Inseln. Bitte versuche es erneut.</div>';
    }
  }

  async switchToIsland(islandId) {
    try {
      // Speichere aktuelle Insel-ID
      localStorage.setItem('currentIslandId', islandId.toString());
      
      // Lade Insel-Daten neu
      const { api } = await import('./api.js');
      
      // Prüfe ob Insel existiert
      const islands = await api.getVillages();
      const islandExists = islands.some(island => island.id === islandId);
      if (!islandExists) {
        throw new Error(`Insel ${islandId} existiert nicht`);
      }
      
      const resources = await api.getResources(islandId);
      const islandDetails = await api.getVillageDetails(islandId);
      
      // Update Ressourcen-Anzeige (beide Methoden)
      await this.updateResourcesDisplay(resources, islandDetails.village);
      
      // Aktualisiere Lagerfeuer-Stufe
      await this.updateLagerfeuerLevel();
      
      // Aktualisiere Hafen-Icon (anzeigen/verstecken basierend auf Stufe)
      await this.updateHafenLevel();
      
      // Aktualisiere animierte Figuren basierend auf Bevölkerung
      if (islandDetails && islandDetails.village) {
        await this.updateIslandPeople(islandDetails.village.population || 0);
      }
      
      // Update auch GameApp Ressourcen falls vorhanden
      const gameApp = window.gameApp;
      if (gameApp && gameApp.updateResourceDisplay) {
        gameApp.updateResourceDisplay(resources);
      }
      
      // Update Insel-Titel
      if (islandDetails && islandDetails.village) {
        await this.updateIslandTitle(islandDetails.village.name);
      }
      
      // Aktualisiere Karte: Zentriere auf neue Insel und setze Zoom auf 1
      // Mache das optional, damit es nicht fehlschlägt wenn Karte nicht geladen ist
      try {
        const mapView = window.mapView;
        if (mapView && typeof mapView.loadPlayerIslands === 'function') {
          await mapView.loadPlayerIslands();
          if (typeof mapView.centerOnCurrentVillage === 'function') {
            await mapView.centerOnCurrentVillage();
          }
          if (typeof mapView.setZoom === 'function') {
            mapView.setZoom(1);
          }
          // Stelle sicher, dass die Karte sofort gerendert wird
          if (mapView.canvas && mapView.ctx && typeof mapView.updateView === 'function') {
            mapView.updateView();
          }
        }
      } catch (mapError) {
        // Ignoriere Karten-Fehler, da die Karte optional ist
        console.warn('Karte konnte nicht aktualisiert werden:', mapError);
      }
      
      // Lade Bauschleife aus Backend (falls noch nicht geladen)
      await this.loadBuildQueueFromBackend();
      
      // Aktualisiere Bauschleife-Anzeige (zeigt nur aktuelle Insel)
      this.updateBuildQueueDisplay();
      
      // Aktualisiere Ausbauten-Liste falls Ausbauten-Ansicht geöffnet ist
      if (this.currentMenu === 'upgrades') {
        await this.updateUpgradesList();
      }
      
      // Wechsle zurück zur Insel-Ansicht (nur wenn nicht bereits auf Insel-Ansicht oder Ausbauten)
      if (this.currentMenu !== 'island' && this.currentMenu !== 'upgrades') {
        this.showIslandView();
        this.switchMenu('island');
      }
      
      // Lade Gebäude neu
      setTimeout(() => {
        import('./buildings.js').then(module => {
          module.initBuildings();
        }).catch(err => {
          console.error('Fehler beim Laden der Gebäude:', err);
        });
      }, 100);
      
      // Aktualisiere die Insel-Übersicht falls geöffnet
      if (this.currentMenu === 'islands-overview') {
        await this.loadIslandsOverview();
      }
      
      // Aktualisiere Navigations-Pfeile
      await this.updateNavigationArrows();
      
      console.log(`✅ Zu Insel ${islandId} gewechselt`);
    } catch (error) {
      console.error('Fehler beim Wechseln zur Insel:', error);
      console.error('Fehler-Details:', {
        message: error.message,
        stack: error.stack,
        islandId: islandId
      });
      // Zeige Fehler-Meldung als schönes Pop-Up
      const { notificationManager } = await import('./notification.js');
      notificationManager.error(`Fehler beim Wechseln zur Insel: ${error.message || 'Unbekannter Fehler'}`);
    }
  }

  getCurrentIslandId() {
    // Hole aktuelle Insel-ID aus localStorage
    const storedId = localStorage.getItem('currentIslandId');
    return storedId ? parseInt(storedId) : null;
  }

  async getCurrentIslandIdAsync() {
    try {
      const { api } = await import('./api.js');
      const islands = await api.getVillages();
      if (islands && Array.isArray(islands) && islands.length > 0) {
        // Wenn Spieler nur eine Insel hat, wähle diese automatisch aus
        if (islands.length === 1) {
          const singleIslandId = islands[0].id;
          localStorage.setItem('currentIslandId', singleIslandId.toString());
          return singleIslandId;
        }
        
        // Wenn mehrere Inseln vorhanden sind, prüfe gespeicherte ID
        const storedId = this.getCurrentIslandId();
        if (storedId) {
          // Prüfe ob die gespeicherte ID noch existiert
          const islandExists = islands.some(island => island.id === storedId);
          if (islandExists) {
            return storedId;
          }
        }
        
        // Fallback: Erste Insel auswählen
        const firstIslandId = islands[0].id;
        localStorage.setItem('currentIslandId', firstIslandId.toString());
        return firstIslandId;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Inseln:', error);
    }
    return null;
  }

  async updateResourcesDisplay(resources, villageData = null) {
    // Aktualisiere Lagerfeuer-Stufe
    await this.updateLagerfeuerLevel();
    
    // Aktualisiere Punkte (aus villageData)
    const pointsEl = document.getElementById('resource-points');
    if (pointsEl) {
      if (villageData && villageData.points !== undefined) {
        pointsEl.textContent = villageData.points || 0;
      } else {
        // Versuche Punkte aus aktueller Insel zu holen
        try {
          const currentIslandId = await this.getCurrentIslandIdAsync();
          if (currentIslandId) {
            const { api } = await import('./api.js');
            const details = await api.getVillageDetails(currentIslandId);
            if (details && details.village) {
              pointsEl.textContent = details.village.points || 0;
            }
          }
        } catch (error) {
          console.error('Fehler beim Laden der Punkte:', error);
        }
      }
    }

    if (resources) {
      // Aktualisiere Ressourcen auf der Startseite
      const woodEl = document.getElementById('resource-wood');
      const stoneEl = document.getElementById('resource-stone');
      const waterEl = document.getElementById('resource-water');
      const foodEl = document.getElementById('resource-food');
      const luxuryEl = document.getElementById('resource-luxury');
      const populationEl = document.getElementById('resource-population');
      
      if (woodEl) woodEl.textContent = Math.floor(resources.wood || 0);
      if (stoneEl) stoneEl.textContent = Math.floor(resources.stone || 0);
      if (waterEl) waterEl.textContent = Math.floor(resources.water || 0);
      if (foodEl) foodEl.textContent = Math.floor(resources.food || 0);
      if (luxuryEl) luxuryEl.textContent = Math.floor(resources.luxury || 0);
      
      // Produktionsrate anzeigen (vorerst immer 0)
      const productionRate = 0; // TODO: Später aus resources.productionRate oder ähnlich holen
      const woodRateEl = document.getElementById('resource-wood-rate');
      const stoneRateEl = document.getElementById('resource-stone-rate');
      const waterRateEl = document.getElementById('resource-water-rate');
      const foodRateEl = document.getElementById('resource-food-rate');
      const luxuryRateEl = document.getElementById('resource-luxury-rate');
      
      if (woodRateEl) woodRateEl.textContent = `+${productionRate}`;
      if (stoneRateEl) stoneRateEl.textContent = `+${productionRate}`;
      if (waterRateEl) waterRateEl.textContent = `+${productionRate}`;
      if (foodRateEl) foodRateEl.textContent = `+${productionRate}`;
      if (luxuryRateEl) luxuryRateEl.textContent = `+${productionRate}`;
      
      // Aktualisiere Bevölkerung (aus villageData)
      if (populationEl) {
        if (villageData && villageData.population !== undefined) {
          populationEl.textContent = villageData.population;
        } else {
          // Versuche Bevölkerung aus aktueller Insel zu holen
          try {
            const currentIslandId = await this.getCurrentIslandIdAsync();
            if (currentIslandId) {
              const { api } = await import('./api.js');
              const details = await api.getVillageDetails(currentIslandId);
              if (details && details.village) {
                populationEl.textContent = details.village.population || 0;
              }
            }
          } catch (error) {
            console.error('Fehler beim Laden der Bevölkerung:', error);
          }
        }
      }
    }
    
    // Aktualisiere Pfeile-Status
    await this.updateNavigationArrows();
  }

  async updateNavigationArrows() {
    const leftArrow = document.getElementById('island-nav-left');
    const rightArrow = document.getElementById('island-nav-right');
    
    try {
      const { api } = await import('./api.js');
      const islands = await api.getVillages();
      const currentIslandId = await this.getCurrentIslandIdAsync();
      
      if (islands.length <= 1) {
        // Nur eine oder keine Insel - Pfeile deaktivieren
        if (leftArrow) leftArrow.disabled = true;
        if (rightArrow) rightArrow.disabled = true;
        return;
      }
      
      // Finde Index der aktuellen Insel
      const currentIndex = islands.findIndex(island => island.id === currentIslandId);
      
      // Pfeile aktivieren/deaktivieren basierend auf Position
      if (leftArrow) {
        leftArrow.disabled = currentIndex <= 0;
      }
      if (rightArrow) {
        rightArrow.disabled = currentIndex >= islands.length - 1;
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Navigations-Pfeile:', error);
      if (leftArrow) leftArrow.disabled = true;
      if (rightArrow) rightArrow.disabled = true;
    }
  }

  async updateIslandPeople(population) {
    const container = document.getElementById('island-people-container');
    if (!container) {
      console.warn('island-people-container nicht gefunden!');
      return;
    }
    
    console.log('updateIslandPeople aufgerufen mit Bevölkerung:', population);
    console.log('Container gefunden:', container);
    console.log('Container Position:', window.getComputedStyle(container).position);
    console.log('Container z-index:', window.getComputedStyle(container).zIndex);
    
    // Entferne alle vorhandenen Figuren
    container.innerHTML = '';
    
    // Erstelle Figuren basierend auf Bevölkerung
    const peopleCount = Math.min(Math.max(population, 0), 20); // Maximal 20 Figuren
    
    if (peopleCount === 0) {
      console.log('Keine Bevölkerung, keine Figuren erstellt');
      return;
    }
    
    console.log('Erstelle', peopleCount, 'Figuren');
    
    for (let i = 0; i < peopleCount; i++) {
      const person = document.createElement('div');
      person.className = 'island-person';
      
      // Animation-Delay: 5 Sekunden Versetzung pro Figur
      const delay = i * 5; // 5 Sekunden Versetzung
      
      // Alle Animationen dauern 20 Sekunden
      const animationDuration = 20;
      
      // Startposition: x1300, y444
      person.style.left = '1300px';
      person.style.top = '444px';
      person.style.animation = `walk-island-resident ${animationDuration}s infinite`;
      person.style.animationDelay = `${delay}s`;
      
      // Bild für Mensch verwenden
      const img = document.createElement('img');
      img.src = '/assets/Mensch1.png';
      img.className = 'island-person-image';
      img.alt = 'Inselbewohner';
      img.style.width = '17px';
      img.style.height = '17px';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      
      // Fehlerbehandlung für Bild
      img.onerror = function() {
        console.warn('Mensch1.png konnte nicht geladen werden, verwende Fallback');
        this.style.display = 'none';
      };
      
      person.appendChild(img);
      container.appendChild(person);
      console.log(`Figur ${i + 1} erstellt:`, { delay, left: person.style.left, top: person.style.top });
    }
    
    console.log('Figuren erstellt:', container.children.length);
    console.log('Container HTML:', container.innerHTML.substring(0, 200));
  }

  async updateUpgradesList() {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (!currentIslandId) {
        console.warn('Keine Insel-ID gefunden');
        return;
      }

      const { api } = await import('./api.js');
      const details = await api.getVillageDetails(currentIslandId);
      if (!details || !details.buildings) {
        console.warn('Keine Gebäude-Daten gefunden');
        return;
      }

      const buildings = details.buildings;
      const resources = await api.getResources(currentIslandId);
      const upgradesGrid = document.querySelector('.upgrades-grid');
      if (!upgradesGrid) {
        console.warn('Upgrades-Grid nicht gefunden');
        return;
      }

      // Leere das Grid
      upgradesGrid.innerHTML = '';

      // Definiere alle möglichen Ausbauten
      const upgrades = [
        { type: 'lagerfeuer', name: 'Lagerfeuer', description: 'Wärme und Licht für deine Insel', icon: '🔥' },
        { type: 'hafen', name: 'Hafen', description: 'Ermöglicht Handel und Schifffahrt', icon: '🛶' },
        { type: 'tafel', name: 'Die Tafel', description: 'Zeigt tägliche Aufgaben und Herausforderungen', icon: '📋' },
        { type: 'lager', name: 'Lager', description: 'Erhöht die Lagerkapazität', icon: '🪵' },
        { type: 'unterschlupf', name: 'Unterschlupf', description: 'Schutz vor den Elementen', icon: '🏝️' },
        { type: 'wachposten', name: 'Wachposten', description: 'Erhöht die Sicherheit', icon: '🌴' },
        { type: 'werkbank', name: 'Werkbank', description: 'Crafting und Reparaturen', icon: '🪨' },
        { type: 'kochstelle', name: 'Kochstelle', description: 'Nahrungszubereitung', icon: '🍖' },
        { type: 'versteck', name: 'Versteck', description: 'Verstecke Ressourcen', icon: '🌿' }
      ];

      // Zähle wie viele Stufen jedes Gebäude bereits in der Bauschleife ist
      const buildQueue = document.getElementById('build-queue');
      const existingQueueItems = buildQueue ? buildQueue.querySelectorAll('.build-queue-item') : [];
      const queuedLevels = new Map(); // Map von Gebäudetyp -> Anzahl der Stufen in Bauschleife
      for (const item of existingQueueItems) {
        const itemType = item.dataset.upgradeType;
        const itemIslandId = item.dataset.islandId;
        if (itemType && itemIslandId === currentIslandId?.toString()) {
          const currentCount = queuedLevels.get(itemType) || 0;
          queuedLevels.set(itemType, currentCount + 1);
        }
      }

      // Prüfe Gesamtanzahl der Einträge in der Bauschleife
      const totalQueueItems = existingQueueItems.length;
      const maxQueueSize = 5;
      const queueFull = totalQueueItems >= maxQueueSize;

      // Erstelle Karten für jeden Ausbau
      for (const upgrade of upgrades) {
        const building = buildings.find(b => b.building_type === upgrade.type);
        const baseLevel = building?.level || 0;
        // Addiere die Anzahl der Stufen, die bereits in der Bauschleife sind
        const queuedCount = queuedLevels.get(upgrade.type) || 0;
        const currentLevel = baseLevel + queuedCount; // Zeige die nächste Stufe, die ausgebaut werden kann
        const nextLevel = currentLevel + 1;
        const isMaxLevel = nextLevel > 20;

        // Berechne Kosten und Zeit basierend auf Gebäudetyp
        let cost = { wood: 0, stone: 0 };
        let buildTime = 0;
        
        if (upgrade.type === 'hafen') {
          const baseWood = 100;
          cost.wood = baseWood * Math.pow(2, nextLevel - 1);
          const baseBuildTime = 10;
          buildTime = baseBuildTime * Math.pow(2, nextLevel - 1);
          
          if (nextLevel >= 2) {
            const baseStone = 100;
            cost.stone = baseStone * Math.pow(2, nextLevel - 2);
          }
        } else {
          const baseCost = 10;
          cost.wood = baseCost * Math.pow(2, nextLevel - 1);
          const baseBuildTime = 15;
          buildTime = baseBuildTime * Math.pow(2, nextLevel - 1);
        }

        // Prüfe Voraussetzungen
        let requirements = [];
        if (upgrade.type === 'hafen' && nextLevel >= 3) {
          const lagerfeuer = buildings.find(b => b.building_type === 'lagerfeuer');
          const requiredLevel = 2;
          if (!lagerfeuer || lagerfeuer.level < requiredLevel) {
            requirements.push(`Lagerfeuer Stufe ${requiredLevel} (aktuell: ${lagerfeuer?.level || 0})`);
          } else {
            requirements.push(`Lagerfeuer Stufe ${requiredLevel} ✓`);
          }
        }

        // Prüfe ob Ressourcen ausreichen und ob Bauschleife voll ist
        const canAfford = !isMaxLevel && !queueFull &&
          (resources.wood || 0) >= cost.wood && 
          (resources.stone || 0) >= cost.stone;
        const requirementsMet = requirements.length === 0 || 
          requirements.every(req => req.includes('✓'));

        // Bestimme Icon basierend auf Stufe
        let iconPath = '';
        let hasIcon = false;
        
        if (upgrade.type === 'lagerfeuer') {
          iconPath = '/assets/Lagerfeuer_icon.png';
          hasIcon = true;
        } else if (upgrade.type === 'hafen') {
          hasIcon = true;
          if (currentLevel === 0) {
            iconPath = '/assets/Gebäude/Hafen/Hafen_icon1.png';
          } else if (currentLevel >= 1 && currentLevel <= 2) {
            iconPath = '/assets/Gebäude/Hafen/Hafen_icon1.png';
          } else if (currentLevel >= 3) {
            iconPath = '/assets/Gebäude/Hafen/Hafen_icon2.png';
          }
        }

        // Erstelle Karte
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.upgrade = upgrade.type;
        
        // Pop-up entfernt - kein Klick-Handler mehr
        
        // Name oben mittig und groß mit Stufe integriert (über der gesamten Karte)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'upgrade-name';
        nameDiv.textContent = `${upgrade.name} Stufe ${currentLevel}`;
        card.appendChild(nameDiv);
        
        // Rohstoffe mittig unterhalb des Namens
        if (!isMaxLevel) {
          const resourcesDiv = document.createElement('div');
          resourcesDiv.className = 'upgrade-resources';
          
          if (cost.wood > 0) {
            const woodDiv = document.createElement('div');
            const hasEnoughWood = (resources.wood || 0) >= cost.wood;
            woodDiv.className = `upgrade-resource-item ${hasEnoughWood ? 'sufficient' : 'insufficient'}`;
            woodDiv.textContent = `Holz ${cost.wood}`;
            resourcesDiv.appendChild(woodDiv);
          }
          
          if (cost.stone > 0) {
            const stoneDiv = document.createElement('div');
            const hasEnoughStone = (resources.stone || 0) >= cost.stone;
            stoneDiv.className = `upgrade-resource-item ${hasEnoughStone ? 'sufficient' : 'insufficient'}`;
            stoneDiv.textContent = `Stein ${cost.stone}`;
            resourcesDiv.appendChild(stoneDiv);
          }
          
          card.appendChild(resourcesDiv);
        }
        
        // Links: Bild/Icon Container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'upgrade-icon-container';
        iconContainer.style.cursor = 'pointer';
        
        if (hasIcon && iconPath) {
          const iconImg = document.createElement('img');
          iconImg.src = iconPath;
          iconImg.alt = upgrade.name;
          iconImg.className = 'upgrade-icon-image';
          iconImg.onerror = function() {
            this.style.display = 'none';
            const fallback = iconContainer.querySelector('.upgrade-icon-fallback');
            if (fallback) fallback.style.display = 'block';
          };
          
          const iconFallback = document.createElement('div');
          iconFallback.className = 'upgrade-icon-fallback';
          iconFallback.style.display = 'none';
          iconFallback.textContent = upgrade.icon || '🏗️';
          
          iconContainer.appendChild(iconImg);
          iconContainer.appendChild(iconFallback);
        } else {
          const iconFallback = document.createElement('div');
          iconFallback.className = 'upgrade-icon-fallback';
          iconFallback.style.display = 'block';
          iconFallback.textContent = upgrade.icon || '🏗️';
          iconFallback.style.fontSize = '4rem';
          iconContainer.appendChild(iconFallback);
        }
        
        // Mitte: Info-Bereich
        const infoDiv = document.createElement('div');
        infoDiv.className = 'upgrade-info';
        
        if (isMaxLevel) {
          const maxLevelDiv = document.createElement('div');
          maxLevelDiv.className = 'upgrade-max-level';
          maxLevelDiv.textContent = '✅ Maximale Stufe erreicht';
          infoDiv.appendChild(maxLevelDiv);
        }
        
        // Voraussetzungen mittig unten im Balken
        if (!isMaxLevel && requirements.length > 0) {
          const requirementsDiv = document.createElement('div');
          requirementsDiv.className = 'upgrade-requirements-bottom';
          
          const requirementsText = requirements.map(req => {
            if (req.includes('✓')) {
              return req.replace(' ✓', '');
            }
            return req;
          }).join(', ');
          
          requirementsDiv.textContent = requirementsText;
          card.appendChild(requirementsDiv);
        }
        
        // Rechts: Button-Container mit Button und Dauer
        if (!isMaxLevel) {
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'upgrade-button-container';
          
          const upgradeBtn = document.createElement('button');
          upgradeBtn.className = 'upgrade-card-btn';
          upgradeBtn.disabled = !canAfford || !requirementsMet || queueFull;
          
          if (queueFull) {
            upgradeBtn.textContent = '❌ Bauschleife voll (max. 5)';
          } else if (!canAfford) {
            upgradeBtn.textContent = '❌ Nicht genug Ressourcen';
          } else if (!requirementsMet) {
            upgradeBtn.textContent = '❌ Voraussetzungen nicht erfüllt';
          } else {
            upgradeBtn.textContent = `🔨 Ausbauen auf Stufe ${nextLevel}`;
          }
          
          // Event Listener für Ausbau-Button
          upgradeBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (upgradeBtn.disabled) return;
            
            const points = upgrade.type === 'lagerfeuer' ? 2 : 10;
            await this.startUpgrade(upgrade.type, {
              name: upgrade.name,
              level: nextLevel,
              time: buildTime,
              points: points,
              cost: cost
            });
            
            // Aktualisiere Liste nach kurzer Verzögerung
            setTimeout(() => {
              this.updateUpgradesList();
            }, 1000);
          });
          
          // Dauer unter dem Button - Formatierung in Stunden, Minuten, Sekunden
          const hours = Math.floor(buildTime / 3600);
          const minutes = Math.floor((buildTime % 3600) / 60);
          const seconds = buildTime % 60;
          
          let timeString = '';
          if (hours > 0) {
            timeString = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            timeString = `${minutes}m ${seconds}s`;
          } else {
            timeString = `${seconds}s`;
          }
          
          const timeDiv = document.createElement('div');
          timeDiv.className = 'upgrade-build-time';
          timeDiv.textContent = `⏱️ ${timeString}`;
          
          // Endzeit berechnen und anzeigen
          const endTime = new Date(Date.now() + buildTime * 1000);
          const endTimeHours = endTime.getHours().toString().padStart(2, '0');
          const endTimeMinutes = endTime.getMinutes().toString().padStart(2, '0');
          const endTimeSeconds = endTime.getSeconds().toString().padStart(2, '0');
          
          const endTimeDiv = document.createElement('div');
          endTimeDiv.className = 'upgrade-end-time';
          endTimeDiv.textContent = `Fertig: ${endTimeHours}:${endTimeMinutes}:${endTimeSeconds}`;
          
          buttonContainer.appendChild(upgradeBtn);
          buttonContainer.appendChild(timeDiv);
          buttonContainer.appendChild(endTimeDiv);
          
          card.appendChild(iconContainer);
          card.appendChild(infoDiv);
          card.appendChild(buttonContainer);
        } else {
          card.appendChild(iconContainer);
          card.appendChild(infoDiv);
        }
        
        upgradesGrid.appendChild(card);
      }

    } catch (error) {
      console.error('Fehler beim Aktualisieren der Ausbauten-Liste:', error);
    }
  }

  async navigateToIsland(direction) {
    try {
      const { api } = await import('./api.js');
      const islands = await api.getVillages();
      const currentIslandId = await this.getCurrentIslandIdAsync();
      
      if (islands.length <= 1) {
        return; // Keine Navigation möglich
      }
      
      // Finde Index der aktuellen Insel
      const currentIndex = islands.findIndex(island => island.id === currentIslandId);
      if (currentIndex === -1) {
        return; // Aktuelle Insel nicht gefunden
      }
      
      // Berechne neuen Index
      const newIndex = currentIndex + direction;
      if (newIndex < 0 || newIndex >= islands.length) {
        return; // Index außerhalb des Bereichs
      }
      
      // Wechsle zur neuen Insel
      const newIsland = islands[newIndex];
      await this.switchToIsland(newIsland.id);
    } catch (error) {
      console.error('Fehler beim Navigieren zur Insel:', error);
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Fehler beim Wechseln zur Insel.');
    }
  }

  async updateIslandName(islandId, newName) {
    if (!newName || newName.length === 0) {
      // Zeige Warnung als schönes Pop-Up
      const { notificationManager } = await import('./notification.js');
      notificationManager.warning('Der Inselname darf nicht leer sein!');
      return;
    }

    try {
      const { api } = await import('./api.js');
      const updatedIsland = await api.updateVillageName(islandId, newName);
      
      console.log('✅ Inselname aktualisiert:', updatedIsland);
      
      // Update in der Insel-Übersicht Liste
      const input = document.querySelector(`.island-name-input[data-island-id="${islandId}"]`);
      if (input) {
        input.value = updatedIsland.name;
      }

      // Wenn es die aktuelle Insel ist, update den Titel überall
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (islandId === currentIslandId) {
        await this.updateIslandTitle(updatedIsland.name);
        
        // Update auch in game.js falls vorhanden
        const gameScene = window.gameScene;
        if (gameScene && gameScene.villageData) {
          gameScene.villageData.name = updatedIsland.name;
          const villageNameEl = document.getElementById('village-name');
          if (villageNameEl) {
            villageNameEl.textContent = updatedIsland.name;
          }
        }
      }

      // Aktualisiere die Karte, damit der neue Name auch dort angezeigt wird
      const mapView = window.mapView;
      if (mapView && typeof mapView.loadPlayerIslands === 'function') {
        console.log('🗺️ Aktualisiere Karte mit neuem Inselnamen...');
        await mapView.loadPlayerIslands();
        // Aktualisiere die Karten-Ansicht
        if (mapView.canvas && mapView.ctx && typeof mapView.updateView === 'function') {
          mapView.updateView();
        }
      }

      // Update defaultValue des Input-Felds, damit zukünftige Vergleiche korrekt sind
      if (input) {
        input.defaultValue = updatedIsland.name;
      }
      
      console.log('✅ Inselname überall aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Inselnamens:', error);
        // Zeige Fehler-Meldung als schönes Pop-Up
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Fehler beim Aktualisieren des Inselnamens. Bitte versuche es erneut.');
    }
  }

  async updateIslandTitle(islandName) {
    // Update Insel-Titel in der Hauptansicht
    const titleEl = document.getElementById('island-title');
    if (titleEl) {
      titleEl.textContent = islandName;
    }
    
    // Update auch in game.js falls vorhanden
    const gameScene = window.gameScene;
    if (gameScene && gameScene.villageData) {
      gameScene.villageData.name = islandName;
      const villageNameEl = document.getElementById('village-name');
      if (villageNameEl) {
        villageNameEl.textContent = islandName;
      }
    }
    
    // Update auch im Info-Panel der Karte falls geöffnet
    const islandInfoNameEl = document.getElementById('island-info-name');
    if (islandInfoNameEl) {
      // Prüfe ob es die aktuelle Insel ist
      const mapView = window.mapView;
      if (mapView && mapView.selectedIsland) {
        const currentIslandId = mapView.selectedIsland.villageId || mapView.selectedIsland.id;
        const currentIslandIdFromStorage = await this.getCurrentIslandIdAsync();
        if (currentIslandId === currentIslandIdFromStorage) {
          islandInfoNameEl.textContent = islandName;
        }
      }
    }
  }

  initIslandZoom() {
    let zoomLevel = 1.0; // Start-Zoom: 100%
    const minZoom = 1.0; // Minimale Zoom-Stufe (100%)
    const maxZoom = 3.0; // Maximale Zoom-Stufe (300%)
    const zoomStep = 0.1; // Zoom-Schritt pro Mausrad-Bewegung
    let mouseX = 0;
    let mouseY = 0;
    let backgroundX = 50; // Prozent-Position X (center)
    let backgroundY = 50; // Prozent-Position Y (center)

    // Speichere Zoom-Level im localStorage
    const savedZoom = localStorage.getItem('island-zoom-level');
    if (savedZoom) {
      zoomLevel = parseFloat(savedZoom);
      zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
    }

    // Speichere Position im localStorage
    const savedPosition = localStorage.getItem('island-zoom-position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        backgroundX = pos.x || 50;
        backgroundY = pos.y || 50;
      } catch (e) {
        console.warn('Fehler beim Laden der Zoom-Position:', e);
      }
    }

    // Funktion zum Aktualisieren des Hintergrunds
    const updateBackground = () => {
      const body = document.body;
      if (body.classList.contains('game-active')) {
        const beforeElement = window.getComputedStyle(body, '::before');
        // Verwende CSS-Variablen für dynamische Werte
        body.style.setProperty('--island-zoom', zoomLevel);
        body.style.setProperty('--island-bg-x', `${backgroundX}%`);
        body.style.setProperty('--island-bg-y', `${backgroundY}%`);
        
        // Aktualisiere direkt das ::before Element über einen Style-Tag
        let styleTag = document.getElementById('island-zoom-style');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'island-zoom-style';
          document.head.appendChild(styleTag);
        }
        
        const zoomPercent = zoomLevel * 100;
        styleTag.textContent = `
          body.game-active::before {
            background-size: ${zoomPercent}% ${zoomPercent}% !important;
            background-position: ${backgroundX}% ${backgroundY}% !important;
          }
        `;
      }
    };

    // Initialisiere Zoom
    updateBackground();

    // Mausrad-Event für Zoom
    document.addEventListener('wheel', (e) => {
      // Nur wenn game-active und auf der Insel-Ansicht
      const body = document.body;
      const buildingsView = document.getElementById('buildings-view');
      const mapView = document.getElementById('island-map-view');
      const isIslandView = buildingsView && !buildingsView.classList.contains('hidden');
      const isMapView = mapView && !mapView.classList.contains('hidden');
      
      // Nicht zoomen wenn Karte geöffnet ist
      if (isMapView) {
        return;
      }
      
      if (!body.classList.contains('game-active') || !isIslandView) {
        return;
      }

      // Prüfe ob Maus über einem scrollbaren Element ist
      const target = e.target;
      const isScrollable = target.closest('.build-queue, .upgrades-grid, .dashboard-content, .dashboard-sidebar, .modal, .building-popup-modal, .map-view-container');
      
      // Nur zoomen wenn nicht über scrollbaren Elementen
      if (!isScrollable) {
        e.preventDefault();
        
        // Zoom-In (nach oben scrollen = reinzoomen) oder Zoom-Out (nach unten scrollen = rauszoomen)
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
        
        // Speichere Zoom-Level
        localStorage.setItem('island-zoom-level', zoomLevel.toString());
        
        updateBackground();
      }
    }, { passive: false });

    // Mausbewegung für Panning (Verschieben des Bildes)
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let startBgX = 0;
    let startBgY = 0;

    document.addEventListener('mousedown', (e) => {
      const body = document.body;
      const buildingsView = document.getElementById('buildings-view');
      const isIslandView = buildingsView && !buildingsView.classList.contains('hidden');
      
      if (body.classList.contains('game-active') && isIslandView && e.button === 0) {
        // Linke Maustaste + Shift für Panning (Verschieben)
        const target = e.target;
        const isScrollable = target.closest('.build-queue, .upgrades-grid, .dashboard-content, .dashboard-sidebar, .modal, .building-popup-modal');
        
        if (e.shiftKey && !isScrollable) {
          isPanning = true;
          startX = e.clientX;
          startY = e.clientY;
          startBgX = backgroundX;
          startBgY = backgroundY;
          e.preventDefault();
        }
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isPanning) {
        const deltaX = (e.clientX - startX) / window.innerWidth * 100;
        const deltaY = (e.clientY - startY) / window.innerHeight * 100;
        
        // Berechne neue Position basierend auf Zoom-Level
        const zoomFactor = zoomLevel;
        backgroundX = Math.max(0, Math.min(100, startBgX - deltaX * zoomFactor));
        backgroundY = Math.max(0, Math.min(100, startBgY - deltaY * zoomFactor));
        
        // Speichere Position
        localStorage.setItem('island-zoom-position', JSON.stringify({ x: backgroundX, y: backgroundY }));
        
        updateBackground();
      }
    });

    document.addEventListener('mouseup', () => {
      isPanning = false;
    });

    // Reset-Zoom mit Doppelklick
    document.addEventListener('dblclick', (e) => {
      const body = document.body;
      const buildingsView = document.getElementById('buildings-view');
      const isIslandView = buildingsView && !buildingsView.classList.contains('hidden');
      
      if (body.classList.contains('game-active') && isIslandView) {
        zoomLevel = 1.0;
        backgroundX = 50;
        backgroundY = 50;
        localStorage.setItem('island-zoom-level', '1.0');
        localStorage.setItem('island-zoom-position', JSON.stringify({ x: 50, y: 50 }));
        updateBackground();
      }
    });
  }

  async refreshIslandTitle() {
    try {
      const currentIslandId = await this.getCurrentIslandIdAsync();
      if (currentIslandId) {
        const { api } = await import('./api.js');
        const island = await api.getVillageDetails(currentIslandId);
        if (island && island.village) {
          await this.updateIslandTitle(island.village.name);
          
      // Aktualisiere auch Ressourcen und Pfeile
      const resources = await api.getResources(currentIslandId);
      await this.updateResourcesDisplay(resources, island.village);
      
      // Aktualisiere Lagerfeuer-Stufe
      await this.updateLagerfeuerLevel();
      
      // Aktualisiere Hafen-Icon
      await this.updateHafenLevel();
      
      // Aktualisiere animierte Figuren basierend auf Bevölkerung
      if (island && island.village) {
        await this.updateIslandPeople(island.village.population || 0);
      }
        }
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Insel-Titels:', error);
    }
  }
}

// Initialisiere Menü-Manager wenn Game-Container sichtbar ist
let menuManager = null;

function initMenu() {
  if (!menuManager && document.getElementById('game-container') && !document.getElementById('game-container').classList.contains('hidden')) {
    menuManager = new MenuManager();
    // Setze global für Zugriff von anderen Modulen
    window.menuManager = menuManager;
    window.menuManagerInstance = menuManager;
    // Setze "Insel" als aktives Menü (beide Varianten)
    document.querySelectorAll('[data-menu="island"]').forEach(item => {
      item.classList.add('active');
    });
    // Zeige Insel-Ansicht standardmäßig (dies lädt auch die Bauschleife)
    menuManager.showIslandView();
  }
}

// Stelle sicher, dass MenuManager global verfügbar ist
if (typeof window !== 'undefined') {
  window.MenuManager = MenuManager;
}

// Beobachte Game-Container
const menuObserver = new MutationObserver(() => {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer && !gameContainer.classList.contains('hidden')) {
    if (!menuManager) {
      initMenu();
    }
  }
});

// Starte Observer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      menuObserver.observe(gameContainer, { attributes: true, attributeFilter: ['class'] });
    }
  });
} else {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    menuObserver.observe(gameContainer, { attributes: true, attributeFilter: ['class'] });
  }
}

export { MenuManager, initMenu };
