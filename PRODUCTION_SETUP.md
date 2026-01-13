# 🚀 Production Setup - Umstellung auf echte Datenbank

Dieses Dokument beschreibt die Umstellung von Mock-Datenbank auf PostgreSQL für Production.

## ✅ Was wurde vorbereitet

### 1. Datenbank-Konfiguration
- ✅ PostgreSQL Connection Pool mit optimierten Einstellungen
- ✅ Environment-Variablen für verschiedene Umgebungen
- ✅ Fehlerbehandlung und Logging verbessert
- ✅ SSL-Unterstützung für Cloud-Datenbanken

### 2. Docker & Deployment
- ✅ Dockerfile für Production-Builds
- ✅ Docker Compose für einfaches Deployment
- ✅ Nginx Reverse Proxy Konfiguration
- ✅ Health Checks und Monitoring

### 3. Mobile App Vorbereitung
- ✅ CORS für Mobile Apps konfiguriert
- ✅ API-Struktur für REST-API vorbereitet
- ✅ JWT-Authentifizierung für Mobile Apps

### 4. Scripts & Tools
- ✅ Production Setup Scripts (Bash & PowerShell)
- ✅ Datenbank-Migrationen
- ✅ Deployment-Dokumentation

## 🔄 Umstellungsschritte

### Schritt 1: PostgreSQL installieren

**Windows:**
1. Lade PostgreSQL von https://www.postgresql.org/download/windows/
2. Installiere mit Standard-Einstellungen
3. Merke dir das Passwort für den `postgres` User

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
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

### Schritt 3: .env Datei konfigurieren

```bash
# Kopiere .env.example zu .env
cp .env.example .env
```

Bearbeite `.env` und setze:

```env
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein-postgres-passwort
JWT_SECRET=dein-super-geheimer-jwt-secret-key-min-32-zeichen
CORS_ORIGIN=http://localhost:3000
```

### Schritt 4: Migrationen ausführen

```bash
# Installiere Dependencies
npm install

# Führe Migrationen aus
npm run db:migrate
```

### Schritt 5: Testen

```bash
# Starte Server
npm run dev

# Prüfe Health Check
curl http://localhost:5000/health
```

## 🐳 Docker Deployment (Empfohlen)

### Schnellstart

```bash
# 1. Erstelle .env Datei
cp .env.example .env
# Bearbeite .env und setze DB_PASSWORD und JWT_SECRET

# 2. Starte alle Services
docker-compose up -d

# 3. Führe Migrationen aus
docker-compose exec api npm run db:migrate

# 4. Prüfe Logs
docker-compose logs -f
```

### Einzelne Services

```bash
# Nur Datenbank starten
docker-compose up -d postgres

# API mit lokaler Datenbank
# Setze DB_HOST=localhost in .env
npm run dev
```

## 📱 Mobile App Integration

Die API ist bereits für Mobile Apps vorbereitet:

### CORS für Mobile Apps

In `.env`:
```env
# Für React Native, Flutter, etc.
MOBILE_APP_ORIGINS=https://app.deine-domain.com
```

### API-Endpunkte

**Base URL:** `https://deine-api-domain.com/api`

**Authentifizierung:**
```javascript
POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/register
Body: { username, email, password }
Response: { token, user }
```

**Authentifizierte Requests:**
```
Header: Authorization: Bearer <token>
```

## 🔒 Sicherheit

### Production Checklist

- [ ] Starke `JWT_SECRET` gesetzt (min. 32 Zeichen, zufällig)
- [ ] Sichere Datenbank-Passwörter
- [ ] HTTPS aktiviert (SSL/TLS)
- [ ] CORS richtig konfiguriert
- [ ] `.env` nicht in Git committed (bereits in `.gitignore`)
- [ ] Datenbank-Backups eingerichtet
- [ ] Rate Limiting aktiviert (in nginx.conf)

### Datenbank-Backup

```bash
# Backup erstellen
pg_dump -U postgres browsergame_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres browsergame_db < backup_20240101.sql
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

### Logs

```bash
# Docker
docker-compose logs -f api

# Lokal
tail -f logs/app.log
```

## 🆘 Troubleshooting

### Datenbank-Verbindungsfehler

```bash
# Prüfe ob PostgreSQL läuft
psql -U postgres -c "SELECT version();"

# Prüfe Connection String in .env
echo $DB_HOST
echo $DB_USER
echo $DB_NAME
```

### Migration-Fehler

```bash
# Prüfe Migration-Status
npm run db:migrate

# Rollback falls nötig
npm run db:migrate:down
```

### Port bereits belegt

```bash
# Finde Prozess auf Port 5000
# Windows:
netstat -ano | findstr :5000

# Linux/Mac:
lsof -i :5000
```

## 📚 Weitere Dokumentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detaillierte Deployment-Anleitung
- [QUICKSTART.md](./QUICKSTART.md) - Schnellstart für Development
- [README.md](./README.md) - Projekt-Übersicht

## ✅ Nächste Schritte

1. ✅ PostgreSQL installieren und Datenbank erstellen
2. ✅ `.env` Datei konfigurieren
3. ✅ Migrationen ausführen
4. ✅ Server testen
5. ✅ Für Production deployen (siehe DEPLOYMENT.md)

---

**Viel Erfolg! 🚀**

