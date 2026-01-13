/**
 * Island Escape - Karten-Ansicht mit Raster und Scroll-Funktionalität
 */

class IslandMap {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 10; // 10mm pro Feld
    this.totalFields = 1000; // 1000 × 1000 Felder
    this.mapSize = this.totalFields * this.gridSize; // 10000px
    this.visibleFields = 25; // Maximal 25 Felder gleichzeitig sichtbar
    
    this.scale = 1.0;
    this.minScale = 0.5;
    this.maxScale = 3.0;
    
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartOffsetX = 0;
    this.dragStartOffsetY = 0;
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.drawGrid();
    this.updateCoordinates();
  }

  createCanvas() {
    const container = document.getElementById('map-grid-container');
    if (!container) return;

    // Erstelle Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'map-grid-canvas';
    this.canvas.width = this.mapSize;
    this.canvas.height = this.mapSize;
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    
    // Setze initiale Position (zentriert auf 25×25 sichtbare Felder)
    const visibleSize = this.visibleFields * this.gridSize; // 25 × 10mm = 250px
    this.offsetX = (this.mapSize - visibleSize) / 2;
    this.offsetY = (this.mapSize - visibleSize) / 2;
    this.updateTransform();
  }

  setupEventListeners() {
    const container = document.getElementById('map-grid-container');
    if (!container) return;

    // Maus-Drag
    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragStartOffsetX = this.offsetX;
      this.dragStartOffsetY = this.offsetY;
      container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        this.offsetX = this.dragStartOffsetX - deltaX;
        this.offsetY = this.dragStartOffsetY - deltaY;
        
        // Begrenze Scroll-Bereich
        const container = document.getElementById('map-grid-container');
        if (container) {
          const visibleSize = this.visibleFields * this.gridSize; // 250px
          const maxX = this.mapSize - visibleSize;
          const maxY = this.mapSize - visibleSize;
          
          this.offsetX = Math.max(0, Math.min(maxX, this.offsetX));
          this.offsetY = Math.max(0, Math.min(maxY, this.offsetY));
        }
        
        this.updateTransform();
        this.updateCoordinates();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        const container = document.getElementById('map-grid-container');
        if (container) {
          container.style.cursor = 'grab';
        }
      }
    });

    // Touch-Unterstützung
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartOffsetX = 0;
    let touchStartOffsetY = 0;

    container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartOffsetX = this.offsetX;
      touchStartOffsetY = this.offsetY;
    });

    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      this.offsetX = touchStartOffsetX - deltaX;
      this.offsetY = touchStartOffsetY - deltaY;
      
      const visibleSize = this.visibleFields * this.gridSize; // 250px
      const maxX = this.mapSize - visibleSize;
      const maxY = this.mapSize - visibleSize;
      
      this.offsetX = Math.max(0, Math.min(maxX, this.offsetX));
      this.offsetY = Math.max(0, Math.min(maxY, this.offsetY));
      
      this.updateTransform();
      this.updateCoordinates();
    });

    // Zoom-Controls
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.zoom(1.2);
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.zoom(0.8);
      });
    }

    // Mausrad-Zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom(delta, e.clientX, e.clientY);
    });
  }

  updateTransform() {
    if (!this.canvas) return;
    
    const container = document.getElementById('map-grid-container');
    if (!container) return;

    // Transform für Canvas
    this.canvas.style.transform = `translate(${-this.offsetX}px, ${-this.offsetY}px) scale(${this.scale})`;
    this.canvas.style.transformOrigin = '0 0';

    // Transform für Background
    const background = document.getElementById('map-background');
    if (background) {
      background.style.transform = `translate(${-this.offsetX}px, ${-this.offsetY}px) scale(${this.scale})`;
      background.style.transformOrigin = '0 0';
    }
  }

  drawGrid() {
    if (!this.ctx) return;

    const gridSize = this.gridSize;
    const totalFields = this.totalFields;
    
    // Clear Canvas
    this.ctx.clearRect(0, 0, this.mapSize, this.mapSize);

    // Setze Stil
    this.ctx.strokeStyle = 'rgba(139, 111, 71, 0.3)';
    this.ctx.lineWidth = 1;

    // Zeichne Raster-Linien
    this.ctx.beginPath();
    
    // Vertikale Linien
    for (let x = 0; x <= totalFields; x++) {
      const px = x * gridSize;
      this.ctx.moveTo(px, 0);
      this.ctx.lineTo(px, this.mapSize);
    }
    
    // Horizontale Linien
    for (let y = 0; y <= totalFields; y++) {
      const py = y * gridSize;
      this.ctx.moveTo(0, py);
      this.ctx.lineTo(this.mapSize, py);
    }
    
    this.ctx.stroke();

    // Zeichne Feld-Nummern (nur sichtbare Bereiche für Performance)
    this.ctx.fillStyle = 'rgba(107, 84, 53, 0.5)';
    this.ctx.font = '10px Kalam';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Zeichne nur Nummern für sichtbare Felder (Performance-Optimierung)
    const container = document.getElementById('map-grid-container');
    if (container) {
      const visibleSize = this.visibleFields * gridSize; // 25 × 10mm = 250px
      const visibleStartX = Math.max(0, Math.floor(this.offsetX / gridSize) - 2);
      const visibleEndX = Math.min(totalFields, Math.ceil((this.offsetX + visibleSize) / gridSize) + 2);
      const visibleStartY = Math.max(0, Math.floor(this.offsetY / gridSize) - 2);
      const visibleEndY = Math.min(totalFields, Math.ceil((this.offsetY + visibleSize) / gridSize) + 2);

      for (let x = visibleStartX; x < visibleEndX; x++) {
        for (let y = visibleStartY; y < visibleEndY; y++) {
          const fieldNum = y * totalFields + x + 1;
          const px = x * gridSize + gridSize / 2;
          const py = y * gridSize + gridSize / 2;
          
          // Zeichne nur bei bestimmten Feldern (z.B. jede 10.)
          if (fieldNum % 10 === 0 || x === 0 || y === 0) {
            this.ctx.fillText(fieldNum.toString(), px, py);
          }
        }
      }
    }
  }

  zoom(factor, centerX = null, centerY = null) {
    const oldScale = this.scale;
    this.scale *= factor;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale));

    // Zoom zum Mauszeiger
    if (centerX !== null && centerY !== null) {
      const container = document.getElementById('map-grid-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const relativeX = centerX - rect.left;
        const relativeY = centerY - rect.top;
        
        const worldX = (relativeX + this.offsetX) / oldScale;
        const worldY = (relativeY + this.offsetY) / oldScale;
        
        this.offsetX = worldX * this.scale - relativeX;
        this.offsetY = worldY * this.scale - relativeY;
      }
    }

    this.updateTransform();
    this.drawGrid(); // Neu zeichnen bei Zoom
  }

  updateCoordinates() {
    const coordsEl = document.getElementById('map-coordinates');
    if (!coordsEl) return;

    const container = document.getElementById('map-grid-container');
    if (!container) return;

    // Berechne sichtbaren Bereich (25 Felder)
    const startX = Math.floor(this.offsetX / this.gridSize);
    const startY = Math.floor(this.offsetY / this.gridSize);
    const visibleSize = this.visibleFields * this.gridSize;
    const endX = Math.ceil((this.offsetX + visibleSize) / this.gridSize);
    const endY = Math.ceil((this.offsetY + visibleSize) / this.gridSize);

    coordsEl.textContent = `Feld: ${startX + 1}-${endX} / ${startY + 1}-${endY} | Zoom: ${(this.scale * 100).toFixed(0)}%`;
  }

  resize() {
    // Neu zeichnen bei Resize
    this.drawGrid();
    this.updateCoordinates();
  }
}

// Exportiere Singleton
let islandMap = null;

export function initIslandMap() {
  if (!islandMap) {
    islandMap = new IslandMap();
    
    // Resize-Handler
    window.addEventListener('resize', () => {
      if (islandMap) {
        islandMap.resize();
      }
    });
  }
  return islandMap;
}

export default IslandMap;

