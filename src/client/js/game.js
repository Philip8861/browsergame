import { api } from './api.js';

/**
 * Phaser 3 Game Scene für die Dorf-Ansicht
 */
class VillageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VillageScene' });
    this.villageData = null;
    this.resources = null;
    this.buildings = [];
  }

  async create() {
    // Lade Dorf-Daten
    await this.loadVillageData();

    // Hintergrund
    this.add.rectangle(400, 300, 800, 600, 0x2a4a3a);

    // Zeichne Gebäude-Plätze
    this.drawBuildingSlots();

    // Zeichne vorhandene Gebäude
    this.drawBuildings();

    // Event Listener für Gebäude-Klicks
    this.setupBuildingInteractions();
  }

  async loadVillageData() {
    try {
      const villages = await api.getVillages();
      if (villages.length > 0) {
        const villageId = villages[0].id;
        const details = await api.getVillageDetails(villageId);
        this.villageData = details.village;
        this.resources = details.resources;
        this.buildings = details.buildings;

        // Update UI
        this.updateResourceDisplay();
        this.updateBuildingsList();
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dorf-Daten:', error);
    }
  }

  drawBuildingSlots() {
    // Zeichne 9 Gebäude-Plätze in einem 3x3 Grid
    const startX = 200;
    const startY = 150;
    const spacing = 200;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const position = row * 3 + col;

        // Platz-Hintergrund
        const slot = this.add.rectangle(x, y, 150, 150, 0x3a5a4a, 0.5);
        slot.setStrokeStyle(2, 0x5a7a6a);
        slot.setInteractive({ useHandCursor: true });
        slot.positionIndex = position;

        // Position-Label
        this.add.text(x, y, `Platz ${position + 1}`, {
          fontSize: '14px',
          color: '#ffffff',
        }).setOrigin(0.5);
      }
    }
  }

  drawBuildings() {
    this.buildings.forEach((building) => {
      const row = Math.floor(building.position / 3);
      const col = building.position % 3;
      const x = 200 + col * 200;
      const y = 150 + row * 200;

      // Gebäude-Sprite (vereinfacht als Rechteck)
      const color = this.getBuildingColor(building.building_type);
      const buildingSprite = this.add.rectangle(x, y, 140, 140, color);
      buildingSprite.setInteractive({ useHandCursor: true });
      buildingSprite.buildingData = building;

      // Level-Anzeige
      this.add.text(x, y - 60, `${this.getBuildingName(building.building_type)}`, {
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);

      this.add.text(x, y, `Level ${building.level}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Upgrade-Timer falls aktiv
      if (building.upgrade_finishes_at) {
        const finishTime = new Date(building.upgrade_finishes_at);
        const now = new Date();
        if (finishTime > now) {
          this.add.text(x, y + 60, '⏳ Upgrade...', {
            fontSize: '12px',
            color: '#f39c12',
          }).setOrigin(0.5);
        }
      }
    });
  }

  getBuildingColor(type) {
    const colors = {
      main_building: 0x8b4513,
      barracks: 0x654321,
      farm: 0x90ee90,
      warehouse: 0x708090,
      wall: 0x696969,
    };
    return colors[type] || 0x808080;
  }

  getBuildingName(type) {
    const names = {
      main_building: 'Hauptgebäude',
      barracks: 'Kaserne',
      farm: 'Bauernhof',
      warehouse: 'Lager',
      wall: 'Mauer',
    };
    return names[type] || type;
  }

  setupBuildingInteractions() {
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (gameObject.buildingData) {
        // Gebäude wurde geklickt
        this.showBuildingUpgradeModal(gameObject.buildingData);
      } else if (gameObject.positionIndex !== undefined) {
        // Leerer Platz wurde geklickt
        this.showNewBuildingModal(gameObject.positionIndex);
      }
    });
  }

  showBuildingUpgradeModal(building) {
    // Öffne Modal für Gebäude-Upgrade
    const modal = document.getElementById('building-modal');
    const title = document.getElementById('building-modal-title');
    const info = document.getElementById('building-modal-info');

    title.textContent = `${this.getBuildingName(building.building_type)} - Level ${building.level}`;
    info.innerHTML = `
      <p>Aktuelles Level: ${building.level}</p>
      <p>Nächstes Level: ${building.level + 1}</p>
      <p>Kosten: 100 Holz, 100 Lehm, 100 Eisen</p>
    `;

    modal.classList.remove('hidden');

    // Event Listener für Upgrade-Button
    const confirmBtn = document.getElementById('upgrade-confirm-btn');
    const cancelBtn = document.getElementById('upgrade-cancel-btn');

    const handleUpgrade = async () => {
      try {
        await api.upgradeBuilding(
          this.villageData.id,
          building.building_type,
          building.position
        );
        modal.classList.add('hidden');
        // Lade Daten neu
        await this.loadVillageData();
        this.scene.restart();
      } catch (error) {
        console.error('Upgrade-Fehler:', error);
        const { notificationManager } = await import('./notification.js');
        notificationManager.error('Upgrade fehlgeschlagen: ' + error.message);
      }
      confirmBtn.removeEventListener('click', handleUpgrade);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    const handleCancel = () => {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleUpgrade);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleUpgrade);
    cancelBtn.addEventListener('click', handleCancel);
  }

  showNewBuildingModal(position) {
    // Zeige Modal für neues Gebäude
    alert(`Neues Gebäude auf Platz ${position + 1} bauen (noch nicht implementiert)`);
  }

  updateResourceDisplay() {
    if (this.resources) {
      document.getElementById('resource-wood').textContent = Math.floor(this.resources.wood);
      const stoneEl = document.getElementById('resource-stone');
      const waterEl = document.getElementById('resource-water');
      const foodEl = document.getElementById('resource-food');
      const luxuryEl = document.getElementById('resource-luxury');
      
      if (stoneEl) stoneEl.textContent = Math.floor(this.resources.stone || 0);
      if (waterEl) waterEl.textContent = Math.floor(this.resources.water || 0);
      if (foodEl) foodEl.textContent = Math.floor(this.resources.food || 0);
      if (luxuryEl) luxuryEl.textContent = Math.floor(this.resources.luxury || 0);
      
      // Produktionsrate anzeigen (vorerst immer 0)
      const productionRate = 0; // TODO: Später aus this.resources.productionRate oder ähnlich holen
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
    }
  }

  updateBuildingsList() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';

    if (this.villageData) {
      document.getElementById('village-name').textContent = this.villageData.name;
      document.getElementById('village-population').textContent = this.villageData.population;
    }

    this.buildings.forEach((building) => {
      const item = document.createElement('div');
      item.className = 'building-item';
      if (building.upgrade_finishes_at) {
        const finishTime = new Date(building.upgrade_finishes_at);
        const now = new Date();
        if (finishTime > now) {
          item.classList.add('upgrading');
        }
      }

      const header = document.createElement('div');
      header.className = 'building-header';
      header.innerHTML = `
        <span class="building-name">${this.getBuildingName(building.building_type)}</span>
        <span class="building-level">Level ${building.level}</span>
      `;

      item.appendChild(header);

      if (building.upgrade_finishes_at) {
        const finishTime = new Date(building.upgrade_finishes_at);
        const now = new Date();
        if (finishTime > now) {
          const timer = document.createElement('div');
          timer.className = 'building-timer';
          const secondsLeft = Math.floor((finishTime - now) / 1000);
          timer.textContent = `Upgrade läuft: ${this.formatTime(secondsLeft)}`;
          item.appendChild(timer);
        }
      }

      container.appendChild(item);
    });
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Phaser Game Konfiguration
 */
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#2a4a3a',
  scene: VillageScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Exportiere Game-Instanz
export let game = null;

export function initGame() {
  if (!game) {
    game = new Phaser.Game(config);
  }
  return game;
}




