# 🚀 Schnellstart - Spiel im Browser testen

## Voraussetzungen prüfen

1. **Node.js installiert?**
   ```bash
   node --version  # Sollte v18+ sein
   ```

2. **PostgreSQL installiert und läuft?**
   ```bash
   psql --version  # Sollte installiert sein
   ```

## Schnellstart (5 Minuten)

### Schritt 1: Dependencies installieren
```bash
npm install
```

### Schritt 2: Datenbank erstellen
```bash
# Windows PowerShell:
createdb -U postgres browsergame_db

# Oder mit psql:
psql -U postgres
CREATE DATABASE browsergame_db;
\q
```

### Schritt 3: Schema erstellen
```bash
# Einfachste Methode - SQL-Script:
psql -U postgres -d browsergame_db -f src/server/database/setup.sql

# Oder mit Migrationen (falls node-pg-migrate funktioniert):
npm run db:migrate
```

### Schritt 4: .env Datei erstellen
Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein_passwort_hier
JWT_SECRET=test-secret-key-12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**WICHTIG:** Ersetze `dein_passwort_hier` mit deinem PostgreSQL-Passwort!

### Schritt 5: Server starten
```bash
npm run dev
```

Du solltest sehen:
```
🚀 Server läuft auf Port 5000
📡 WebSocket Server bereit auf Port 5001
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### Schritt 6: Browser öffnen
Öffne http://localhost:3000

### Schritt 7: Testen
1. **Registrierung testen:**
   - Klicke auf "Registrierung"
   - Fülle das Formular aus
   - Klicke "Registrieren"
   - Du solltest automatisch eingeloggt werden

2. **Spiel-Ansicht:**
   - Nach dem Login siehst du dein Dorf
   - Ressourcen werden oben angezeigt
   - Gebäude-Plätze sind im Hauptbereich sichtbar
   - Klicke auf ein Gebäude zum Upgrade

## Test-Benutzer erstellen (optional)

Falls du einen Test-Benutzer erstellen möchtest:

```bash
npm run db:seed
```

Dann kannst du dich einloggen mit:
- E-Mail: `test@example.com`
- Passwort: `test123`

## Häufige Probleme

### ❌ "Cannot connect to database"
- Prüfe ob PostgreSQL läuft
- Prüfe `.env` Datei (DB_HOST, DB_USER, DB_PASSWORD)
- Prüfe ob Datenbank existiert: `psql -U postgres -l`

### ❌ "Port 5000 already in use"
- Ändere PORT in `.env` zu einem anderen Port (z.B. 5001)
- Ändere auch CORS_ORIGIN entsprechend

### ❌ "Module not found"
```bash
npm install
```

### ❌ Frontend lädt nicht
- Prüfe ob beide Server laufen (Backend + Frontend)
- Öffne Browser-Konsole (F12) für Fehlerdetails
- Prüfe ob http://localhost:5000/health funktioniert

## Nächste Schritte

- ✅ Spiel funktioniert? Perfekt!
- 📝 Siehe README.md für API-Dokumentation
- 🎮 Erweitere das Spiel nach deinen Wünschen
- 🐛 Melde Bugs oder Verbesserungsvorschläge

Viel Spaß beim Testen! 🎉




