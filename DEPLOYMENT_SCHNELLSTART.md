# 🚀 Schnellstart: Spiel Online bringen

## ✅ Was bereits vorbereitet ist

- ✅ Railway-Datenbank ist bereits konfiguriert
- ✅ Server liefert Frontend automatisch aus (Production-Mode)
- ✅ Build-Commands sind konfiguriert
- ✅ Statische Dateien werden serviert

## 📝 Schritt-für-Schritt Anleitung

### Schritt 1: GitHub Repository vorbereiten

**WICHTIG:** Dein Code muss auf GitHub sein, damit Railway ihn deployen kann!

#### Option A: Du hast noch KEIN GitHub Repository

**1.1 GitHub Account erstellen (falls noch nicht vorhanden):**

1. Gehe zu **[github.com](https://github.com)**
2. Klicke oben rechts auf **"Sign up"** oder **"Sign in"** (falls du schon einen Account hast)
3. Folge den Anweisungen zum Erstellen eines Accounts

**1.2 Neues Repository auf GitHub erstellen:**

1. Nach dem Login, klicke oben rechts auf dein **Profilbild** → **"Your repositories"**
2. Oder gehe direkt zu: **[github.com/new](https://github.com/new)**
3. Du siehst die Seite **"Create a new repository"**

**1.3 Repository-Informationen ausfüllen:**

- **Repository name:** z.B. `browsergame` oder `mein-spiel`
- **Description:** (Optional) z.B. "Browserbasiertes Strategiespiel"
- **Visibility:** 
  - ✅ **Public** (empfohlen für kostenlose Nutzung)
  - Oder **Private** (nur du siehst es)
- **Lass alle Checkboxen LEER:**
  - ❌ Kein README hinzufügen (du hast schon Code)
  - ❌ Kein .gitignore (du hast schon eins)
  - ❌ Keine License (optional)

**1.4 Repository erstellen:**

1. Klicke auf den grünen Button **"Create repository"**
2. GitHub zeigt dir eine Seite mit Anweisungen

**1.5 Code auf GitHub hochladen:**

**Methode 1: Über Git (Empfohlen)**

Öffne PowerShell oder Terminal in deinem Projekt-Ordner (`c:\Users\info\Desktop\Browsergame`):

```bash
# Prüfe ob Git installiert ist
git --version

# Falls Git nicht installiert ist, installiere es von: https://git-scm.com/download/win
```

Dann führe aus:

```bash
# 1. Initialisiere Git (falls noch nicht geschehen)
git init

# 2. Füge alle Dateien hinzu
git add .

# 3. Erstelle ersten Commit
git commit -m "Initial commit - Vorbereitung für Railway Deployment"

# 4. Verbinde mit GitHub Repository
# ERSETZE 'dein-username' und 'dein-repo-name' mit deinen Werten!
git remote add origin https://github.com/dein-username/dein-repo-name.git

# 5. Pushe Code zu GitHub
git branch -M main
git push -u origin main
```

**Methode 2: Über GitHub Desktop (Einfacher für Anfänger)**

1. Lade **GitHub Desktop** herunter: [desktop.github.com](https://desktop.github.com)
2. Installiere und öffne GitHub Desktop
3. Klicke auf **"File"** → **"Add Local Repository"**
4. Wähle deinen Projekt-Ordner: `c:\Users\info\Desktop\Browsergame`
5. Klicke auf **"Publish repository"**
6. Wähle dein GitHub Repository aus
7. Klicke auf **"Publish repository"**

**Methode 3: Über GitHub Website (Drag & Drop)**

1. Gehe zu deinem neuen Repository auf GitHub
2. Klicke auf **"uploading an existing file"** (wenn das Repository leer ist)
3. Oder klicke auf **"Add file"** → **"Upload files"**
4. Ziehe deinen gesamten Projekt-Ordner in den Browser
5. Scrolle nach unten und klicke auf **"Commit changes"**

#### Option B: Du hast BEREITS ein GitHub Repository

**1.1 Prüfe ob dein Code aktuell ist:**

Öffne PowerShell oder Terminal in deinem Projekt-Ordner:

```bash
# Wechsle in dein Projekt-Verzeichnis
cd c:\Users\info\Desktop\Browsergame

# Prüfe Status
git status

# Falls es Änderungen gibt, füge sie hinzu:
git add .

# Erstelle Commit
git commit -m "Vorbereitung für Railway Deployment"

# Pushe zu GitHub
git push origin main
```

**1.2 Prüfe auf GitHub:**

1. Gehe zu deinem Repository auf GitHub: `https://github.com/dein-username/dein-repo-name`
2. Stelle sicher, dass alle Dateien dort sind
3. Prüfe ob die neuesten Änderungen hochgeladen wurden

#### ✅ Wie prüfe ich, ob Schritt 1 erfolgreich war?

1. Gehe zu deinem GitHub Repository
2. Du solltest alle deine Projekt-Dateien sehen:
   - `package.json`
   - `src/` Ordner
   - `railway.json`
   - etc.
3. Wenn du die Dateien siehst → ✅ Schritt 1 erfolgreich!

#### 🐛 Häufige Probleme bei Schritt 1

**Problem: "git: command not found"**

**Lösung:**
- Git ist nicht installiert
- Lade es herunter: [git-scm.com/download/win](https://git-scm.com/download/win)
- Installiere es und starte Terminal neu

**Problem: "remote origin already exists"**

**Lösung:**
```bash
# Entferne alte Verbindung
git remote remove origin

# Füge neue Verbindung hinzu
git remote add origin https://github.com/dein-username/dein-repo-name.git
```

**Problem: "Authentication failed"**

**Lösung:**
- GitHub verwendet jetzt Personal Access Tokens statt Passwörtern
- Erstelle ein Token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- Verwende das Token als Passwort beim Push

**Problem: "Repository not found"**

**Lösung:**
- Prüfe ob der Repository-Name korrekt ist
- Prüfe ob du Zugriff auf das Repository hast
- Prüfe ob die URL korrekt ist: `https://github.com/dein-username/dein-repo-name.git`

### Schritt 2: Railway Account erstellen

1. Gehe zu **[railway.app](https://railway.app)**
2. Klicke auf **"Start a New Project"** oder **"Login"**
3. Logge dich mit **GitHub** ein (empfohlen)

### Schritt 3: Neues Projekt erstellen

1. Klicke auf **"+ New Project"** (oben rechts)
2. Wähle **"Deploy from GitHub repo"**
3. Wähle dein Repository aus der Liste
4. Railway erstellt automatisch ein neues Projekt

### Schritt 4: PostgreSQL Datenbank hinzufügen

**Wo finde ich das?**

Nachdem du dein Projekt erstellt hast, siehst du das Railway-Dashboard mit deinem Service.

**Detaillierte Schritte:**

1. **Suche nach dem "+ New" Button:**
   - Oben links im Railway-Dashboard siehst du einen großen **"+ New"** Button
   - Oder: Links in der Seitenleiste findest du auch **"+ New"**
   - Klicke darauf

2. **Wähle "Database":**
   - Es öffnet sich ein Menü mit verschiedenen Optionen
   - Suche nach **"Database"** oder **"PostgreSQL"**
   - Klicke darauf

3. **Wähle PostgreSQL:**
   - Du siehst verschiedene Datenbank-Optionen
   - Klicke auf **"Add PostgreSQL"** oder **"PostgreSQL"**
   - Railway beginnt automatisch mit der Erstellung

4. **Warte auf die Erstellung:**
   - Du siehst einen Ladebalken oder "Provisioning..." Nachricht
   - Warte 30-60 Sekunden
   - Die Datenbank erscheint als neuer Service in deinem Projekt

5. **Verbindung prüfen:**
   - Railway verbindet automatisch die Datenbank mit deinem Service
   - Die `DATABASE_URL` wird automatisch gesetzt
   - Du musst nichts weiter tun!

**Alternative: Falls du "+ New" nicht findest:**

- Gehe zu deinem **Service** (der Haupt-Service, nicht die Datenbank)
- Klicke auf **"Settings"** Tab
- Scrolle zu **"Connected Services"** oder **"Dependencies"**
- Dort findest du eine Option, eine Datenbank hinzuzufügen

**Wie erkenne ich, dass es funktioniert hat?**

- Du siehst einen neuen Service namens **"PostgreSQL"** in deinem Projekt
- Dieser Service hat einen grünen Punkt (läuft)
- In deinem Haupt-Service unter **"Variables"** siehst du automatisch `DATABASE_URL` (wird von Railway gesetzt)

### Schritt 5: Environment Variables setzen

1. Klicke auf deinen **Service** (nicht die Datenbank!)
2. Gehe zum Tab **"Variables"**
3. Klicke auf **"+ New Variable"** und füge hinzu:

**Variable 1:**
- **Name:** `NODE_ENV`
- **Value:** `production`

**Variable 2:**
- **Name:** `DB_TYPE`
- **Value:** `postgresql`

**Variable 3:**
- **Name:** `JWT_SECRET`
- **Value:** `DEIN-SUPER-GEHEIMER-SECRET-KEY-MIN-32-ZEICHEN-LANG-123456789`
  - ⚠️ **WICHTIG:** Ersetze dies mit einem sicheren Secret! (mindestens 32 Zeichen)
  - Tipp: Nutze einen Passwort-Generator oder: `openssl rand -base64 32`

**Variable 4:**
- **Name:** `PORT`
- **Value:** `5000`
  - Railway setzt dies automatisch, aber zur Sicherheit setzen wir es auch

**Variable 5:**
- **Name:** `CORS_ORIGIN`
- **Value:** `https://dein-service.up.railway.app`
  - ⚠️ **WICHTIG:** Diese URL bekommst du erst nach dem ersten Deployment!
  - Setze sie zunächst auf einen Platzhalter, wir aktualisieren sie später

### Schritt 6: Build & Start Commands konfigurieren

1. Klicke auf deinen **Service** → **"Settings"** Tab
2. Scrolle zu **"Deploy"** Sektion
3. Setze folgende Werte:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Root Directory:** (leer lassen)

4. Klicke auf **"Save"**

### Schritt 7: Erste Deployment starten

1. Railway startet automatisch das Deployment, wenn du die Commands gesetzt hast
2. Oder klicke manuell auf **"Deploy"** → **"Deploy Latest"**
3. Warte 2-5 Minuten, bis der Build abgeschlossen ist
4. Du siehst den Fortschritt im **"Deployments"** Tab

### Schritt 8: Domain-URL finden und CORS aktualisieren

1. Nach erfolgreichem Deployment, gehe zu **"Settings"** → **"Domains"**
2. Railway zeigt dir eine URL wie: `https://browsergame-production.up.railway.app`
3. **Kopiere diese URL!**
4. Gehe zurück zu **"Variables"**
5. Finde `CORS_ORIGIN` und aktualisiere den Wert mit deiner Railway-URL:
   ```
   https://browsergame-production.up.railway.app
   ```
6. Klicke auf **"Save"**
7. Railway startet automatisch ein neues Deployment

### Schritt 9: Datenbank-Migrationen ausführen

**Option A: Über Railway Console (Empfohlen)**

1. Klicke auf deinen Service → **"View Logs"**
2. Klicke auf **"Open Console"** (oben rechts)
3. Führe aus:
   ```bash
   npm run db:migrate
   ```
4. Warte, bis die Migrationen abgeschlossen sind

**Option B: Über Railway CLI**

```bash
# Installiere Railway CLI (falls noch nicht installiert)
npm i -g @railway/cli

# Login
railway login

# Verbinde mit deinem Projekt
railway link

# Führe Migrationen aus
railway run npm run db:migrate
```

### Schritt 10: Spiel testen! 🎮

1. Öffne deine Railway-URL: `https://dein-service.up.railway.app`
2. Das Spiel sollte jetzt online sein!
3. Erstelle einen Test-Account:
   - Registriere dich mit einer E-Mail
   - Erstelle ein Passwort
   - Logge dich ein
4. Teste die wichtigsten Funktionen:
   - Insel erstellen
   - Gebäude bauen
   - Ausbauten starten
   - Bauschleife prüfen

## ✅ Checkliste - Hast du alles gemacht?

- [ ] Code auf GitHub gepusht
- [ ] Railway Account erstellt
- [ ] Neues Projekt erstellt (GitHub Repo verbunden)
- [ ] PostgreSQL Datenbank hinzugefügt
- [ ] Environment Variables gesetzt:
  - [ ] `NODE_ENV=production`
  - [ ] `DB_TYPE=postgresql`
  - [ ] `JWT_SECRET` (sicherer Secret, min. 32 Zeichen)
  - [ ] `PORT=5000`
  - [ ] `CORS_ORIGIN` (mit Railway-URL aktualisiert)
- [ ] Build Command gesetzt: `npm install && npm run build`
- [ ] Start Command gesetzt: `npm start`
- [ ] Erste Deployment erfolgreich
- [ ] Domain-URL gefunden und `CORS_ORIGIN` aktualisiert
- [ ] Datenbank-Migrationen ausgeführt
- [ ] Spiel getestet und funktioniert

## 🎯 Nach dem Deployment

### Automatische Updates

Railway deployt automatisch bei jedem Git Push:
```bash
git add .
git commit -m "Neue Features"
git push origin main
# Railway deployt automatisch!
```

### Logs ansehen

1. Railway Dashboard → Dein Service → **"View Logs"**
2. Siehst alle Server-Logs in Echtzeit

### Health Check

Teste ob der Server läuft:
```
https://dein-service.up.railway.app/health
```

Sollte zurückgeben: `{"status":"ok","timestamp":"..."}`

## 🐛 Häufige Probleme

### Problem: Build schlägt fehl

**Lösung:**
1. Prüfe die Logs in Railway → "View Logs"
2. Stelle sicher, dass alle Dependencies installiert werden können
3. Prüfe ob TypeScript-Kompilierung erfolgreich ist

### Problem: "Cannot find module" Fehler

**Lösung:**
- Stelle sicher, dass `npm install` im Build Command enthalten ist
- Prüfe ob alle Dependencies in `package.json` vorhanden sind

### Problem: Frontend wird nicht angezeigt

**Lösung:**
1. Prüfe ob `NODE_ENV=production` gesetzt ist
2. Prüfe ob `npm run build` erfolgreich war (siehe Logs)
3. Stelle sicher, dass `dist/client` Ordner existiert

### Problem: CORS-Fehler im Browser

**Lösung:**
1. Prüfe ob `CORS_ORIGIN` die exakte Railway-URL enthält
2. Stelle sicher, dass die URL mit `https://` beginnt
3. Redeploye nach Änderung der CORS_ORIGIN

### Problem: Datenbank-Verbindungsfehler

**Lösung:**
1. Prüfe ob PostgreSQL-Service läuft (grüner Punkt)
2. Prüfe ob `DATABASE_URL` automatisch gesetzt wurde
3. Stelle sicher, dass `DB_TYPE=postgresql` gesetzt ist

## 💡 Tipps

1. **JWT_SECRET generieren:**
   ```bash
   # Windows PowerShell:
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
   
   # Oder einfach einen langen zufälligen String verwenden
   ```

2. **Migrationen nach jedem Update:**
   - Wenn du neue Datenbank-Änderungen hast, führe Migrationen aus
   - Railway Console → `npm run db:migrate`

3. **Backup:**
   - Railway macht automatisch Backups der Datenbank
   - Du findest sie unter: Datenbank-Service → "Backups"

## 🎉 Fertig!

Dein Spiel ist jetzt online und für alle zugänglich! 🚀

Teile die URL mit deinen Freunden:
```
https://dein-service.up.railway.app
```

---

**Bei Fragen oder Problemen:** Prüfe die Logs in Railway oder schaue in `RAILWAY_DEPLOYMENT.md` für detaillierte Informationen.
