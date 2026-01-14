import { api } from './api.js';

/**
 * Authentifizierungs-Logik
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Setze initial Login-Hintergrund
    document.body.classList.add('login-active');
    
    // Prüfe ob bereits eingeloggt
    this.checkAuth();
    
    // Event Listeners für Auth-Forms - warte auf DOM falls nötig
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
      });
    } else {
      // DOM bereits geladen
      setTimeout(() => {
        this.setupEventListeners();
      }, 100);
    }
  }

  async checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.showAuthModal();
      return;
    }

    try {
      const user = await api.getCurrentUser();
      this.currentUser = user;
      this.hideAuthModal();
      this.showGameContainer();
      this.updateUserDisplay();
    } catch (error) {
      console.error('Auth-Check fehlgeschlagen:', error);
      this.logout();
    }
  }

  setupEventListeners() {
    console.log('setupEventListeners() aufgerufen');
    
    // Tab-Wechsel (moderne Tabs)
    document.querySelectorAll('.tab-button-modern').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Switch to Register Button
    const switchToRegisterBtn = document.getElementById('switch-to-register-btn');
    if (switchToRegisterBtn) {
      switchToRegisterBtn.addEventListener('click', () => {
        this.switchTab('register');
      });
    } else {
      console.warn('⚠ switch-to-register-btn nicht gefunden');
    }

    // Switch to Login Button
    const switchToLoginBtn = document.getElementById('switch-to-login-btn');
    if (switchToLoginBtn) {
      switchToLoginBtn.addEventListener('click', () => {
        this.switchTab('login');
      });
    } else {
      console.warn('⚠ switch-to-login-btn nicht gefunden');
    }

    // Login Form mit Event-Delegation
    document.addEventListener('submit', async (e) => {
      if (e.target && e.target.id === 'login-form') {
        e.preventDefault();
        e.stopPropagation();
        console.log('✓ Login-Form submitted');
        await this.handleLogin();
        return;
      }
    });

    // Register Form mit Event-Delegation
    document.addEventListener('submit', async (e) => {
      if (e.target && e.target.id === 'register-form') {
        e.preventDefault();
        e.stopPropagation();
        console.log('✓ Register-Form submitted');
        await this.handleRegister();
        return;
      }
    });

    // Logout Button
    // Logout-Button im Topbar (falls noch vorhanden)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Logout-Button in Einstellungen
    const logoutBtnSettings = document.getElementById('logout-btn-settings');
    if (logoutBtnSettings) {
      logoutBtnSettings.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  switchTab(tab) {
    // Tab-Buttons aktualisieren (moderne Tabs)
    document.querySelectorAll('.tab-button-modern').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Forms aktualisieren
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('register-form').classList.toggle('active', tab === 'register');

    // Fehler zurücksetzen
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
  }

  async handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
      const data = await api.login(username, password);
      this.currentUser = data.user;
      api.setToken(data.token);
      this.hideAuthModal();
      
      // Zeige direkt das Spiel
      this.showGameContainer();
      
      this.updateUserDisplay();
      
      // Form zurücksetzen
      document.getElementById('login-form').reset();
    } catch (error) {
      // Zeige detaillierte Fehlermeldung
      let errorText = error.message || 'Login fehlgeschlagen';
      if (error.details && error.details !== error.message) {
        errorText = `${errorText}\n${error.details}`;
      }
      errorEl.textContent = errorText;
      errorEl.style.display = 'block';
      console.error('Login-Fehler Details:', {
        message: error.message,
        details: error.details,
        stack: error.stack
      });
    }
  }

  async handleRegister() {
    console.log('handleRegister() aufgerufen');
    
    const usernameEl = document.getElementById('register-username');
    const emailEl = document.getElementById('register-email');
    const passwordEl = document.getElementById('register-password');
    const errorEl = document.getElementById('register-error');

    if (!usernameEl || !emailEl || !passwordEl || !errorEl) {
      console.error('❌ Register-Form-Elemente nicht gefunden:', {
        usernameEl: !!usernameEl,
        emailEl: !!emailEl,
        passwordEl: !!passwordEl,
        errorEl: !!errorEl
      });
      const { notificationManager } = await import('./notification.js');
      notificationManager.error('Fehler: Registrierungsformular nicht gefunden. Bitte Seite neu laden.');
      return;
    }

    const username = usernameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    console.log('Registrierungsdaten:', { username, email, passwordLength: password.length });

    if (!username || !email || !password) {
      errorEl.textContent = 'Bitte fülle alle Felder aus!';
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Passwort muss mindestens 6 Zeichen lang sein!';
      return;
    }

    try {
      console.log('Starte Registrierung...');
      const data = await api.register(username, email, password);
      console.log('Registrierung erfolgreich:', data);
      
      this.currentUser = data.user;
      if (data.token) {
        api.setToken(data.token);
        console.log('Token gesetzt');
      } else {
        console.error('Kein Token in Registrierungs-Response erhalten!');
        errorEl.textContent = 'Registrierung erfolgreich, aber Token fehlt. Bitte melde dich an.';
        return;
      }
      
      // Setze erste Insel als aktuelle falls vorhanden
      if (data.village) {
        localStorage.setItem('currentIslandId', data.village.id.toString());
        console.log('Aktuelle Insel gesetzt:', data.village.id);
      }
      
      this.hideAuthModal();
      
      // Zeige direkt das Spiel, da bereits ein Dorf erstellt wurde
      this.showGameContainer();
      
      this.updateUserDisplay();
      
      // Form zurücksetzen
      document.getElementById('register-form').reset();
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      const errorMessage = error?.message || error?.error || 'Registrierung fehlgeschlagen';
      errorEl.textContent = errorMessage;
    }
  }

  logout() {
    this.currentUser = null;
    api.setToken(null);
    this.showAuthModal();
    this.hideGameContainer();
  }

  showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.body.classList.add('login-background');
  }

  hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.body.classList.remove('login-background');
  }

  hideGameContainer() {
    document.getElementById('game-container').classList.add('hidden');
    document.body.classList.remove('game-active');
    document.body.classList.add('login-active');
  }

  showGameContainer() {
    document.getElementById('game-container').classList.remove('hidden');
    document.body.classList.add('game-active');
    document.body.classList.remove('login-active');
    // Initialisiere Menü nach kurzer Verzögerung
    setTimeout(() => {
      import('./menu.js').then(module => {
        module.initMenu();
      });
    }, 100);
  }

  updateUserDisplay() {
    if (this.currentUser) {
      const username = this.currentUser.username || 'Spieler';
      const email = this.currentUser.email || '-';
      
      // Update in Einstellungen
      const settingsUsernameEl = document.getElementById('settings-username');
      if (settingsUsernameEl) {
        settingsUsernameEl.textContent = username;
      }
      
      const settingsEmailEl = document.getElementById('settings-email');
      if (settingsEmailEl) {
        settingsEmailEl.textContent = email;
      }

      // Insel-Titel wird separat geladen (zeigt aktuellen Inselnamen)
      setTimeout(async () => {
        try {
          const { MenuManager } = await import('./menu.js');
          // Wenn MenuManager bereits existiert, lade Titel
          const menuManager = window.menuManagerInstance;
          if (menuManager && menuManager.refreshIslandTitle) {
            await menuManager.refreshIslandTitle();
          }
        } catch (error) {
          console.error('Fehler beim Laden des Insel-Titels:', error);
        }
      }, 500);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Exportiere Singleton-Instanz
export const authManager = new AuthManager();

