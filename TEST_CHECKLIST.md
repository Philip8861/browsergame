# ✅ Checkliste: Spiel im Browser testen

## Vorbereitung

- [ ] Node.js installiert (v18+)
- [ ] PostgreSQL installiert und läuft
- [ ] Dependencies installiert (`npm install` ✅)

## Setup-Schritte

### 1. Datenbank einrichten
- [ ] PostgreSQL-Datenbank erstellt: `browsergame_db`
- [ ] Schema erstellt (SQL-Script oder Migrationen)
- [ ] Datenbank-Verbindung getestet

**Befehle:**
```bash
# Datenbank erstellen
createdb -U postgres browsergame_db

# Schema erstellen (einfachste Methode)
psql -U postgres -d browsergame_db -f src/server/database/setup.sql
```

### 2. Umgebungsvariablen
- [ ] `.env` Datei erstellt (basierend auf `env.example`)
- [ ] PostgreSQL-Credentials eingetragen
- [ ] JWT_SECRET gesetzt

**Minimale .env:**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein_passwort
JWT_SECRET=test-secret-12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Server starten
- [ ] Backend-Server läuft (Port 5000)
- [ ] Frontend-Server läuft (Port 3000)
- [ ] Keine Fehler in der Konsole

**Befehl:**
```bash
npm run dev
```

### 4. Browser-Test
- [ ] Browser öffnet http://localhost:3000
- [ ] Login/Registrierung-Modal wird angezeigt
- [ ] Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Spiel-Ansicht wird nach Login angezeigt
- [ ] Ressourcen werden angezeigt
- [ ] Gebäude sind sichtbar
- [ ] Gebäude-Upgrade funktioniert

## Troubleshooting

### Backend startet nicht
- [ ] PostgreSQL läuft?
- [ ] `.env` Datei vorhanden?
- [ ] Datenbank existiert?
- [ ] Port 5000 frei?

### Frontend lädt nicht
- [ ] Backend läuft?
- [ ] Port 3000 frei?
- [ ] Browser-Konsole prüfen (F12)

### Datenbankfehler
- [ ] PostgreSQL läuft?
- [ ] Credentials in `.env` korrekt?
- [ ] Datenbank existiert?
- [ ] Schema erstellt?

## Erfolgreich getestet? 🎉

Wenn alles funktioniert:
- ✅ Registrierung erstellt neuen Benutzer
- ✅ Login funktioniert mit JWT
- ✅ Dorf wird erstellt
- ✅ Ressourcen werden angezeigt
- ✅ Gebäude sind interaktiv
- ✅ Upgrade-System funktioniert

## Nächste Schritte

- [ ] Spiel erweitern
- [ ] Mehr Gebäude-Typen hinzufügen
- [ ] Ressourcen-Produktion implementieren
- [ ] Karten-System entwickeln
- [ ] Multiplayer-Features




