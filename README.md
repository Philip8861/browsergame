# Browserbasiertes Strategiespiel

Ein vollständiges Projekt-Gerüst für ein browserbasiertes Strategiespiel ähnlich "Stämme"/Travian, entwickelt mit modernen Web-Technologien.

## 🎮 Features

- **Frontend**: HTML5 + CSS + JavaScript mit Phaser 3 Game Framework
- **Backend**: Node.js + Express mit TypeScript
- **Authentifizierung**: JWT-basierte Login/Registrierung
- **Datenbank**: PostgreSQL mit Migrationen
- **REST API**: Vollständige API für Ressourcen, Gebäude und Timer
- **WebSocket**: Vorbereitet für Echtzeit-Updates
- **Tests**: Jest Unit-Tests
- **Code Quality**: ESLint + Prettier

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- PostgreSQL (v12 oder höher)
- npm oder yarn

## 🚀 Installation & Setup

### 1. Repository klonen und Dependencies installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

Erstelle eine `.env` Datei im Root-Verzeichnis basierend auf `.env.example`:

```bash
cp .env.example .env
```

Bearbeite die `.env` Datei und setze deine Werte:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein_passwort

JWT_SECRET=dein-super-geheimer-jwt-key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

### 3. PostgreSQL Datenbank erstellen

```bash
createdb browsergame_db
```

Oder über psql:

```sql
CREATE DATABASE browsergame_db;
```

### 4. Datenbank-Migrationen ausführen

```bash
npm run db:migrate
```

### 5. (Optional) Test-Daten einfügen

```bash
npm run db:seed
```

Dies erstellt einen Test-Benutzer:
- E-Mail: `test@example.com`
- Passwort: `test123`

## 🎯 Entwicklung

### Entwicklungsserver starten

Startet sowohl Backend- als auch Frontend-Server:

```bash
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Einzelne Server starten

```bash
# Nur Backend
npm run dev:server

# Nur Frontend
npm run dev:client
```

### Build für Produktion

```bash
npm run build
```

### Tests ausführen

```bash
# Alle Tests
npm test

# Tests im Watch-Mode
npm run test:watch
```

### Code Quality

```bash
# Linting
npm run lint

# Linting mit Auto-Fix
npm run lint:fix

# Code Formatting
npm run format
```

## 📁 Projektstruktur

```
.
├── src/
│   ├── client/              # Frontend
│   │   ├── index.html
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── js/
│   │       ├── api.js       # API Client
│   │       ├── auth.js      # Authentifizierung
│   │       ├── game.js      # Phaser 3 Game
│   │       └── main.js      # Haupt-Logik
│   └── server/              # Backend
│       ├── index.ts         # Server Entry Point
│       ├── controllers/     # Request Handler
│       ├── models/          # Datenbank-Models
│       ├── routes/          # API Routes
│       ├── middleware/      # Express Middleware
│       ├── utils/           # Utilities
│       ├── websocket/       # WebSocket Handler
│       └── database/        # DB Migrationen & Seeds
├── dist/                    # Build Output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔌 API Dokumentation

### Authentifizierung

#### POST `/api/auth/register`
Registriere einen neuen Benutzer.

**Request Body:**
```json
{
  "username": "spieler123",
  "email": "spieler@example.com",
  "password": "passwort123"
}
```

**Response:**
```json
{
  "message": "Registrierung erfolgreich",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "spieler123",
    "email": "spieler@example.com"
  }
}
```

#### POST `/api/auth/login`
Login eines bestehenden Benutzers.

**Request Body:**
```json
{
  "email": "spieler@example.com",
  "password": "passwort123"
}
```

#### GET `/api/auth/me`
Hole aktuellen Benutzer (benötigt Auth Token).

**Headers:**
```
Authorization: Bearer <token>
```

### Dörfer

#### GET `/api/villages`
Hole alle Dörfer des aktuellen Benutzers.

#### GET `/api/villages/:id`
Hole Details eines spezifischen Dorfes (inkl. Ressourcen & Gebäude).

#### GET `/api/villages/:id/resources`
Hole Ressourcen eines Dorfes.

#### POST `/api/villages/:id/buildings/upgrade`
Starte ein Gebäude-Upgrade.

**Request Body:**
```json
{
  "buildingType": "main_building",
  "position": 0
}
```

## 🗄️ Datenbank-Schema

### Tabellen

- **users**: Benutzer-Accounts
- **villages**: Dörfer der Spieler
- **resources**: Ressourcen pro Dorf (Holz, Lehm, Eisen, Getreide)
- **buildings**: Gebäude in den Dörfern

## 🚢 Deployment

### Frontend (Vercel)

1. Installiere Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Konfiguriere Umgebungsvariablen in Vercel Dashboard

### Backend (Render)

1. Verbinde dein Repository mit Render
2. Wähle "Web Service"
3. Setze Build Command: `npm install && npm run build:server`
4. Setze Start Command: `npm start`
5. Konfiguriere Umgebungsvariablen in Render Dashboard
6. Erstelle PostgreSQL Datenbank in Render

### Alternativ: Heroku

```bash
# Heroku CLI installieren und einloggen
heroku login

# App erstellen
heroku create deine-app-name

# PostgreSQL Add-on hinzufügen
heroku addons:create heroku-postgresql:hobby-dev

# Environment Variables setzen
heroku config:set JWT_SECRET=dein-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## 🧪 Testing

Das Projekt enthält Beispiel-Unit-Tests für:
- User Model (`src/server/__tests__/auth.test.ts`)
- API Routes (`src/server/__tests__/api.test.ts`)

Erweitere die Tests nach Bedarf für deine spezifischen Anforderungen.

## 📝 Entwicklungshinweise

### Ressourcen-Updates

Ressourcen werden aktuell alle 5 Sekunden aktualisiert. Für Produktion sollte ein serverseitiger Timer implementiert werden, der Ressourcen basierend auf Gebäude-Leveln automatisch erhöht.

### Gebäude-Upgrades

Upgrade-Zeiten sind vereinfacht implementiert. Erweitere die Logik in `VillageModel.calculateUpgradeTime()` für realistischere Zeiten.

### WebSocket

WebSocket-Server ist vorbereitet, aber noch nicht vollständig implementiert. Erweitere `src/server/websocket/index.ts` für Echtzeit-Updates.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🎓 Nächste Schritte

- [ ] Ressourcen-Produktion basierend auf Gebäude-Leveln implementieren
- [ ] Erweiterte Gebäude-Typen hinzufügen
- [ ] Karten-System für mehrere Dörfer
- [ ] Kämpfe und Einheiten
- [ ] Allianzen und Diplomatie
- [ ] Mobile Responsive Design verbessern

---

Viel Erfolg beim Entwickeln! 🚀




