# 🚂 Railway Datenbank Setup

Diese Anleitung zeigt dir, wie du die Railway PostgreSQL-Datenbank mit diesem Projekt verbindest.

## 📋 Schritt 1: Railway-Datenbank erstellen

1. Gehe zu [Railway.app](https://railway.app) und logge dich ein
2. Erstelle ein neues Projekt oder öffne ein bestehendes
3. Klicke auf **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Warte, bis die Datenbank erstellt wurde

## 📋 Schritt 2: DATABASE_URL kopieren

1. Klicke auf deine PostgreSQL-Datenbank in Railway
2. Gehe zum Tab **"Variables"** oder **"Connect"**
3. Kopiere die **`DATABASE_URL`** (sieht aus wie: `postgresql://postgres:password@host.railway.app:5432/railway`)

## 📋 Schritt 3: Lokale .env Datei erstellen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
# Kopiere die Beispiel-Datei
cp env.example .env
```

Bearbeite die `.env` Datei und füge deine Railway DATABASE_URL ein:

```env
# Railway PostgreSQL Datenbank
DATABASE_URL=postgresql://postgres:dein-passwort@host.railway.app:5432/railway

# Oder alternativ einzelne Variablen (falls Railway sie bereitstellt):
# DB_HOST=host.railway.app
# DB_PORT=5432
# DB_NAME=railway
# DB_USER=postgres
# DB_PASSWORD=dein-passwort

# Wichtig: Setze DB_TYPE auf postgresql (nicht mock!)
DB_TYPE=postgresql

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 📋 Schritt 4: Datenbank-Migrationen ausführen

Nachdem die `.env` Datei konfiguriert ist, führe die Migrationen aus:

```bash
npm run db:migrate
```

Dies erstellt alle benötigten Tabellen in deiner Railway-Datenbank.

## 📋 Schritt 5: (Optional) Test-Daten einfügen

```bash
npm run db:seed
```

Dies erstellt einen Test-Benutzer:
- E-Mail: `test@example.com`
- Passwort: `test123`

## 📋 Schritt 6: Server starten

```bash
npm run dev
```

Der Server sollte sich jetzt mit deiner Railway-Datenbank verbinden!

## ✅ Verbindung testen

Der Server testet automatisch die Datenbankverbindung beim Start. Du solltest folgende Meldung sehen:

```
✅ Neue Datenbankverbindung etabliert
```

## 🚀 Railway Deployment

Wenn du den Server auch auf Railway deployen möchtest:

1. **Neues Service erstellen**: Klicke auf **"New"** → **"GitHub Repo"** → Wähle dein Repository
2. **Environment Variables setzen**:
   - `DATABASE_URL` - Wird automatisch von Railway gesetzt, wenn du die Datenbank als Service hinzufügst
   - `JWT_SECRET` - Setze einen sicheren Secret-Key
   - `NODE_ENV=production`
   - `CORS_ORIGIN` - Deine Frontend-URL
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Migrationen ausführen**: Railway Console → `npm run db:migrate`

## 🔍 Troubleshooting

### Verbindungsfehler

Wenn du einen Verbindungsfehler siehst:

1. **Prüfe DATABASE_URL**: Stelle sicher, dass die URL korrekt kopiert wurde
2. **SSL aktiviert**: Railway benötigt SSL-Verbindungen. Die Konfiguration sollte automatisch SSL aktivieren
3. **Firewall**: Railway-Datenbanken sollten von überall erreichbar sein

### Migration-Fehler

Wenn Migrationen fehlschlagen:

```bash
# Prüfe die Verbindung
npm run db:migrate

# Falls Tabellen bereits existieren, kannst du sie zurücksetzen:
# ACHTUNG: Löscht alle Daten!
```

### Lokale Entwicklung mit Railway-DB

Für lokale Entwicklung kannst du auch weiterhin die Mock-Datenbank verwenden:

```env
DB_TYPE=mock
```

Oder eine lokale PostgreSQL-Instanz:

```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## 📚 Weitere Informationen

- [Railway PostgreSQL Dokumentation](https://docs.railway.app/databases/postgresql)
- [Node.js pg (node-postgres) Dokumentation](https://node-postgres.com/)

---

**Viel Erfolg! 🚀**
