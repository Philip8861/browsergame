/**
 * Muschel-Cursor für Island Escape Login
 */
class ShellCursor {
  constructor() {
    this.cursor = null;
    this.init();
  }

  init() {
    // Erstelle Muschel-Cursor Element
    this.cursor = document.createElement('div');
    this.cursor.className = 'shell-cursor';
    document.body.appendChild(this.cursor);

    // Verstecke Standard-Cursor
    document.body.style.cursor = 'none';

    // Bewege Cursor mit Maus
    document.addEventListener('mousemove', (e) => {
      this.updatePosition(e.clientX, e.clientY);
    });

    // Verstecke Cursor außerhalb des Fensters
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
    });
  }

  updatePosition(x, y) {
    if (this.cursor) {
      this.cursor.style.left = x + 'px';
      this.cursor.style.top = y + 'px';
    }
  }

  destroy() {
    if (this.cursor) {
      this.cursor.remove();
      document.body.style.cursor = '';
    }
  }
}

// Initialisiere Cursor wenn Login-Modal sichtbar ist
let shellCursor = null;

function initShellCursor() {
  if (!shellCursor) {
    shellCursor = new ShellCursor();
  }
}

function destroyShellCursor() {
  if (shellCursor) {
    shellCursor.destroy();
    shellCursor = null;
  }
}

// Beobachte Auth-Modal
const observer = new MutationObserver((mutations) => {
  const authModal = document.getElementById('auth-modal');
  if (authModal && !authModal.classList.contains('hidden')) {
    initShellCursor();
  } else {
    destroyShellCursor();
  }
});

// Starte Observer wenn DOM geladen
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      observer.observe(authModal, { attributes: true, attributeFilter: ['class'] });
    }
  });
} else {
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    observer.observe(authModal, { attributes: true, attributeFilter: ['class'] });
  }
}

export { initShellCursor, destroyShellCursor };




