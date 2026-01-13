/**
 * Backup-Manager für Projekt-Backups
 */

class BackupManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Warte bis DOM geladen ist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.createBackup());
      console.log('✅ Backup-Button Handler gesetzt');
    } else {
      console.warn('⚠️ Backup-Button nicht gefunden');
    }
  }

  async createBackup() {
    const backupBtn = document.getElementById('backup-btn');
    const statusDiv = document.getElementById('backup-status');

    if (!backupBtn || !statusDiv) {
      console.error('❌ Backup-Button oder Status-Div nicht gefunden');
      return;
    }

    // Button deaktivieren und Status anzeigen
    backupBtn.disabled = true;
    backupBtn.textContent = '⏳ Backup wird erstellt...';
    statusDiv.textContent = 'Backup wird erstellt, bitte warten...';
    statusDiv.style.color = '#4a90e2';

    try {
      console.log('📦 Starte Backup-Erstellung...');
      
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backup-Fehler');
      }

      // Erfolg
      console.log('✅ Backup erfolgreich erstellt:', data);
      statusDiv.textContent = `✅ Backup erfolgreich erstellt! Datei: ${data.fileName} (${data.size})`;
      statusDiv.style.color = '#28a745';
      
      backupBtn.textContent = '💾 Projekt-Backup erstellen';
      backupBtn.disabled = false;

      // Nach 5 Sekunden Status zurücksetzen
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 5000);

    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Backups:', error);
      statusDiv.textContent = `❌ Fehler: ${error.message}`;
      statusDiv.style.color = '#dc3545';
      
      backupBtn.textContent = '💾 Projekt-Backup erstellen';
      backupBtn.disabled = false;
    }
  }
}

// Initialisiere Backup-Manager
const backupManager = new BackupManager();
