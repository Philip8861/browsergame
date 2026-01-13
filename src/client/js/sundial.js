/**
 * Sonnenuhr Manager - Verwaltet die Sonnenuhr-Anzeige und Uhr
 */
class SundialManager {
  constructor() {
    this.clockInterval = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateClock(); // Sofort aktualisieren
  }

  setupEventListeners() {
    // Sonnenuhr-Menü-Item Klick
    const sundialMenuItem = document.getElementById('sundial-menu-item');
    if (sundialMenuItem) {
      sundialMenuItem.addEventListener('click', () => {
        this.showSundial();
      });
    }

    // Schließen Button
    const closeBtn = document.getElementById('sundial-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideSundial();
      });
    }

    // Backdrop Klick zum Schließen
    const modal = document.getElementById('sundial-modal');
    const backdrop = modal?.querySelector('.sundial-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.hideSundial();
      });
    }

    // Escape-Taste zum Schließen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('sundial-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.hideSundial();
        }
      }
    });
  }

  showSundial() {
    const modal = document.getElementById('sundial-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Starte Uhr-Update
    this.startClock();
  }

  hideSundial() {
    const modal = document.getElementById('sundial-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Stoppe Uhr-Update
    this.stopClock();
  }

  startClock() {
    // Stoppe vorherigen Interval falls vorhanden
    this.stopClock();

    // Aktualisiere sofort
    this.updateClock();

    // Aktualisiere jede Sekunde
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  /**
   * Aktualisiert die Uhr mit Berliner Zeit (Europe/Berlin)
   * Berlin verwendet UTC+1 (CET) im Winter und UTC+2 (CEST) im Sommer
   */
  updateClock() {
    const clockElement = document.getElementById('clock-time');
    if (!clockElement) return;

    try {
      // Hole aktuelle Berliner Zeit
      const now = new Date();
      
      // Verwende Intl.DateTimeFormat für korrekte Zeitzone
      const formatter = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(now);
      const hours = parts.find(part => part.type === 'hour').value;
      const minutes = parts.find(part => part.type === 'minute').value;
      
      const timeString = `${hours}:${minutes}`;
      clockElement.textContent = timeString;
      
      // Setze data-time Attribut für Pseudo-Element
      const clockContainer = document.getElementById('sundial-clock');
      if (clockContainer) {
        clockContainer.setAttribute('data-time', timeString);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Uhr:', error);
      // Fallback: Verwende toLocaleString
      try {
        const now = new Date();
        const berlinTime = now.toLocaleString('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        clockElement.textContent = berlinTime;
      } catch (fallbackError) {
        clockElement.textContent = '--:--';
      }
    }
  }
}

// Initialisiere Sonnenuhr-Manager
let sundialManager = null;

function initSundial() {
  if (!sundialManager) {
    sundialManager = new SundialManager();
  }
}

// Initialisiere wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSundial();
  });
} else {
  initSundial();
}

export { SundialManager, initSundial };
