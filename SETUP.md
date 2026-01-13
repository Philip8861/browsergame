# Schnellstart-Anleitung

## Schritt-für-Schritt Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. PostgreSQL Datenbank erstellen

**Windows (PowerShell):**
```powershell
# Falls PostgreSQL installiert ist:
createdb -U postgres browsergame_db
```

**Alternative - SQL direkt:**
```bash
psql -U postgres
```

Dann in psql:
```sql
CREATE DATABASE browsergame_db;
\q
```

### 3. Datenbank-Schema erstellen

**Option A: Mit SQL-Script (empfohlen für schnelles Testen):**
```bash
psql -U postgres -d browsergame_db -f src/server/database/setup.sql
```

**Option B: Mit Migrationen:**
```bash
npm run db:migrate
```

### 4. Umgebungsvariablen konfigurieren

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=browsergame_db
DB_USER=postgres
DB_PASSWORD=dein_postgres_passwort

JWT_SECRET=mein-super-geheimer-schluessel-12345
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

**WICHTIG:** Ersetze `dein_postgres_passwort` mit deinem tatsächlichen PostgreSQL-Passwort!

### 5. (Optional) Test-Daten einfügen

```bash
npm run db:seed
```

Dies erstellt einen Test-Benutzer:
- E-Mail: `test@example.com`
- Passwort: `test123`

### 6. Server starten

```bash
npm run dev
```

Das startet:
- **Backend** auf http://localhost:5000
- **Frontend** auf http://localhost:3000

### 7. Im Browser öffnen

Öffne http://localhost:3000 in deinem Browser.

## Troubleshooting

### Problem: "Cannot find module"
```bash
npm install
```

### Problem: Datenbankverbindung fehlgeschlagen
- Prüfe ob PostgreSQL läuft
- Prüfe die `.env` Datei (DB_HOST, DB_USER, DB_PASSWORD)
- Prüfe ob die Datenbank existiert: `psql -U postgres -l`

### Problem: Port bereits belegt
- Ändere PORT in `.env` (z.B. 5001)
- Ändere CORS_ORIGIN entsprechend

### Problem: Migrationen schlagen fehl
- Verwende stattdessen das SQL-Script: `psql -U postgres -d browsergame_db -f src/server/database/setup.sql`

## Schnelltest ohne PostgreSQL

Falls du PostgreSQL nicht installiert hast, kannst du:
1. Docker verwenden: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`
2. Oder eine Cloud-Datenbank verwenden (z.B. ElephantSQL, Supabase)




