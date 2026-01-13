/**
 * Notification/Pop-Up System für schöne Meldungen
 */
class NotificationManager {
  constructor() {
    this.modal = null;
    this.titleEl = null;
    this.messageEl = null;
    this.iconEl = null;
    this.okBtn = null;
    this.init();
  }

  init() {
    this.modal = document.getElementById('notification-modal');
    this.titleEl = document.getElementById('notification-title');
    this.messageEl = document.getElementById('notification-message');
    this.iconEl = document.getElementById('notification-icon');
    this.okBtn = document.getElementById('notification-ok-btn');

    if (this.okBtn) {
      this.okBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Schließe bei Klick außerhalb
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hide();
        }
      });
    }

    // Schließe bei ESC-Taste
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  show(message, type = 'info', title = null) {
    if (!this.modal || !this.messageEl) return;

    // Setze Nachricht
    this.messageEl.textContent = message;

    // Setze Titel (falls angegeben)
    if (this.titleEl) {
      if (title) {
        this.titleEl.textContent = title;
        this.titleEl.style.display = 'block';
      } else {
        this.titleEl.style.display = 'none';
      }
    }

    // Setze Icon basierend auf Typ
    if (this.iconEl) {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        conquest: '⚔️',
      };
      this.iconEl.textContent = icons[type] || icons.info;
    }

    // Setze CSS-Klasse für Typ
    this.modal.className = `notification-modal notification-${type}`;
    this.modal.classList.remove('hidden');

    // Fokus auf OK-Button
    if (this.okBtn) {
      setTimeout(() => {
        this.okBtn.focus();
      }, 100);
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  // Convenience-Methoden
  success(message, title = null) {
    this.show(message, 'success', title);
  }

  error(message, title = null) {
    this.show(message, 'error', title);
  }

  warning(message, title = null) {
    this.show(message, 'warning', title);
  }

  info(message, title = null) {
    this.show(message, 'info', title);
  }
}

// Erstelle globale Instanz
const notificationManager = new NotificationManager();

// Ersetze window.alert() mit unserem Notification-System
window.originalAlert = window.alert;
window.alert = function(message) {
  // Versuche Typ aus Nachricht zu erkennen
  let type = 'info';
  if (message.includes('✅') || message.includes('erfolgreich') || message.includes('erstellt')) {
    type = 'success';
  } else if (message.includes('❌') || message.includes('Fehler') || message.includes('fehlgeschlagen')) {
    type = 'error';
  } else if (message.includes('⚠️') || message.includes('Warnung')) {
    type = 'warning';
  } else if (message.includes('⚔️') || message.includes('erobert')) {
    type = 'conquest';
  }
  
  notificationManager.show(message, type);
};

// Exportiere für direkten Zugriff
export { notificationManager };
export default notificationManager;
