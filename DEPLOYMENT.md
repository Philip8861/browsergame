# 🚀 Deployment Guide - Browsergame Production Setup

Dieser Guide hilft dir dabei, das Spiel für Production vorzubereiten und zu deployen.

## 📋 Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Lokale Production-Vorbereitung](#lokale-production-vorbereitung)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Mobile App Integration](#mobile-app-integration)
6. [Monitoring & Wartung](#monitoring--wartung)

## ✅ Voraussetzungen

- Node.js 18+ installiert
- PostgreSQL 15+ installiert (oder Docker)
- Git installiert
- Domain und SSL-Zertifikat (für Production)

## 🏗️ Lokale Production-Vorbereitung

### Schritt 1: Environment-Variablen konfigurieren

```bash
# Kopiere .env.example zu .env
cp .env.example .env

# Bearbeite .env und setze Production-Werte:
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein-sicheres-passwort
JWT_SECRET=dein-super-geheimer-jwt-secret-key-min-32-zeichen
CORS_ORIGIN=https://deine-domain.com
```

### Schritt 2: Datenbank einrichten

```bash
# Erstelle Datenbank
createdb -U postgres browsergame_db

# Führe Migrationen aus
npm run db:migrate

# Optional: Seed-Daten einfügen
npm run db:seed
```

### Schritt 3: Build erstellen

```bash
# Installiere Dependencies
npm install

# Build Server und Client
npm run build

# Teste Production Build lokal
npm start
```

## 🐳 Docker Deployment

### Schnellstart mit Docker Compose

```bash
# 1. Erstelle .env Datei mit Production-Werten
cp .env.example .env
# Bearbeite .env und setze DB_PASSWORD und JWT_SECRET

# 2. Starte alle Services
docker-compose up -d

# 3. Führe Migrationen aus
docker-compose exec api npm run db:migrate

# 4. Prüfe Logs
docker-compose logs -f
```

### Einzelne Services starten

```bash
# Nur Datenbank
docker-compose up -d postgres

# Nur API
docker-compose up -d api

# Mit Nginx Reverse Proxy
docker-compose up -d
```

### Docker Image bauen

```bash
# Build Image
docker build -t browsergame:latest .

# Run Container
docker run -d \
  --name browsergame-api \
  -p 5000:5000 \
  --env-file .env \
  browsergame:latest
```

## ☁️ Cloud Deployment

### Option 1: Heroku

```bash
# 1. Installiere Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Erstelle App
heroku create deine-app-name

# 4. Füge PostgreSQL Add-on hinzu
heroku addons:create heroku-postgresql:hobby-dev

# 5. Setze Environment Variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=dein-secret-key
heroku config:set CORS_ORIGIN=https://deine-app-name.herokuapp.com

# 6. Deploy
git push heroku main

# 7. Führe Migrationen aus
heroku run npm run db:migrate
```

### Option 2: DigitalOcean / AWS / Azure

1. **Server erstellen** (Ubuntu 22.04 LTS)
2. **Docker installieren**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
3. **Docker Compose installieren**
4. **Code deployen** (Git Clone oder CI/CD)
5. **Environment-Variablen setzen**
6. **Docker Compose starten**

### Option 3: Vercel / Netlify (Frontend) + Railway / Render (Backend)

**Backend auf Railway:**
1. Verbinde GitHub Repository
2. Setze Environment Variables
3. Railway führt automatisch `npm run build` und `npm start` aus
4. PostgreSQL Add-on hinzufügen

**Frontend auf Vercel:**
1. Verbinde GitHub Repository
2. Build Command: `npm run build:client`
3. Output Directory: `dist/client`
4. Environment Variables für API-URL setzen

## 📱 Mobile App Integration

### API-Endpunkte für Mobile Apps

Die API ist bereits RESTful und kann von Mobile Apps verwendet werden:

**Base URL:** `https://deine-api-domain.com/api`

**Authentifizierung:**
```javascript
// Login
POST /api/auth/login
Body: { email, password }
Response: { token, user }

// Register
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }

// Authentifizierte Requests
Header: Authorization: Bearer <token>
```

**Wichtige Endpunkte:**
- `GET /api/villages` - Alle Dörfer des Users
- `GET /api/villages/:id/resources` - Ressourcen
- `PUT /api/villages/:id/resources` - Ressourcen aktualisieren
- `GET /api/villages/:id/buildings` - Gebäude
- `POST /api/villages/:id/buildings/upgrade` - Gebäude upgraden

### CORS für Mobile Apps

In `.env` setzen:
```env
# Für Mobile Apps (React Native, Flutter, etc.)
CORS_ORIGIN=https://app.deine-domain.com,https://deine-api-domain.com
```

### API Versionierung

Für zukünftige Mobile Apps:
```javascript
// Aktuelle Version: v1
GET /api/v1/villages

// Zukünftige Versionen
GET /api/v2/villages
```

## 📊 Monitoring & Wartung

### Health Checks

```bash
# API Health Check
curl http://localhost:5000/health

# Erwartete Antwort:
# { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

### Logs

```bash
# Docker Logs
docker-compose logs -f api

# Lokale Logs
tail -f logs/app.log
```

### Datenbank-Backup

```bash
# PostgreSQL Backup
pg_dump -U postgres browsergame_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres browsergame_db < backup_20240101.sql
```

### Updates deployen

```bash
# 1. Code aktualisieren
git pull origin main

# 2. Dependencies aktualisieren
npm install

# 3. Build
npm run build

# 4. Migrationen ausführen (falls nötig)
npm run db:migrate

# 5. Server neu starten
# Docker:
docker-compose restart api

# Oder lokal:
npm start
```

## 🔒 Sicherheit

### Production Checklist

- [ ] Starke `JWT_SECRET` gesetzt (min. 32 Zeichen)
- [ ] Sichere Datenbank-Passwörter
- [ ] HTTPS aktiviert (SSL/TLS)
- [ ] CORS richtig konfiguriert
- [ ] Rate Limiting aktiviert
- [ ] Environment Variables nicht in Git committed
- [ ] Datenbank-Backups eingerichtet
- [ ] Monitoring aktiviert

### SSL/TLS Setup

```bash
# Mit Let's Encrypt (Certbot)
sudo certbot --nginx -d deine-domain.com

# Oder manuell SSL-Zertifikate in nginx.conf einbinden
```

## 🐛 Troubleshooting

### Datenbank-Verbindungsfehler

```bash
# Prüfe ob PostgreSQL läuft
psql -U postgres -c "SELECT version();"

# Prüfe Connection String
echo $DATABASE_URL
```

### Port bereits belegt

```bash
# Finde Prozess auf Port 5000
lsof -i :5000

# Oder ändere PORT in .env
```

### Build-Fehler

```bash
# Lösche node_modules und dist
rm -rf node_modules dist

# Neu installieren
npm install

# Neu builden
npm run build
```

## 📚 Weitere Ressourcen

- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)
- [Docker Dokumentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🆘 Support

Bei Problemen:
1. Prüfe Logs (`docker-compose logs` oder `logs/app.log`)
2. Prüfe Health Check Endpoint
3. Prüfe Datenbank-Verbindung
4. Öffne Issue auf GitHub

---

**Viel Erfolg beim Deployment! 🚀**

