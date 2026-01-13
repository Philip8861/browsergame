# 🚂 Railway Deployment - Komplettes Spiel Online

Diese Anleitung zeigt dir, wie du das komplette Spiel (Backend + Frontend) auf Railway deployst, damit es für alle online zugänglich ist.

## 📋 Voraussetzungen

- GitHub Repository mit deinem Code
- Railway Account (kostenlos): [railway.app](https://railway.app)
- Railway CLI (optional, für lokales Deployment)

## 🚀 Schritt-für-Schritt Anleitung

### Schritt 1: Railway Account erstellen

1. Gehe zu [railway.app](https://railway.app)
2. Klicke auf **"Start a New Project"**
3. Logge dich mit GitHub ein

### Schritt 2: Neues Projekt erstellen

1. Klicke auf **"New Project"**
2. Wähle **"Deploy from GitHub repo"**
3. Wähle dein Repository aus
4. Railway erstellt automatisch ein neues Projekt

### Schritt 3: PostgreSQL Datenbank hinzufügen

1. In deinem Railway-Projekt, klicke auf **"+ New"**
2. Wähle **"Database"** → **"Add PostgreSQL"**
3. Warte, bis die Datenbank erstellt wurde
4. Railway setzt automatisch die `DATABASE_URL` Umgebungsvariable

### Schritt 4: Environment Variables konfigurieren

Klicke auf deinen Service → **"Variables"** Tab und füge hinzu:

```env
# Wird automatisch von Railway gesetzt (wenn PostgreSQL Service verbunden ist)
DATABASE_URL=postgresql://...

# Database Type
DB_TYPE=postgresql

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Secret (WICHTIG: Generiere einen sicheren Secret!)
JWT_SECRET=dein-super-geheimer-secret-key-min-32-zeichen-lang

# CORS - Setze deine Railway-URL hier ein
# Nach dem Deployment findest du die URL unter "Settings" → "Domains"
CORS_ORIGIN=https://dein-service.up.railway.app

# Optional: WebSocket Port (wird normalerweise nicht benötigt)
WS_PORT=5001
```

**WICHTIG:** 
- Generiere einen sicheren `JWT_SECRET` (mindestens 32 Zeichen)
- Die `CORS_ORIGIN` musst du nach dem ersten Deployment anpassen (siehe Schritt 7)

### Schritt 5: Build & Start Commands konfigurieren

In Railway, klicke auf deinen Service → **"Settings"** → **"Deploy"**:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** (leer lassen oder `/`)

### Schritt 6: Deployment starten

1. Railway startet automatisch das Deployment, wenn du die Commands gesetzt hast
2. Oder klicke manuell auf **"Deploy"**
3. Warte, bis der Build abgeschlossen ist (kann 2-5 Minuten dauern)

### Schritt 7: Domain konfigurieren

1. Nach erfolgreichem Deployment, gehe zu **"Settings"** → **"Domains"**
2. Railway generiert automatisch eine URL wie: `https://dein-service.up.railway.app`
3. Kopiere diese URL
4. Gehe zurück zu **"Variables"** und aktualisiere:
   ```env
   CORS_ORIGIN=https://dein-service.up.railway.app
   ```
5. Klicke auf **"Redeploy"** damit die neue CORS-URL aktiv wird

### Schritt 8: Datenbank-Migrationen ausführen

1. Klicke auf deinen Service → **"Deployments"** Tab
2. Klicke auf die neueste Deployment → **"View Logs"**
3. Oder verwende Railway CLI:
   ```bash
   railway run npm run db:migrate
   ```

**Alternative:** Öffne die Railway Console:
1. Klicke auf deinen Service → **"View Logs"**
2. Klicke auf **"Open Console"**
3. Führe aus: `npm run db:migrate`

### Schritt 9: Spiel testen

1. Öffne deine Railway-URL: `https://dein-service.up.railway.app`
2. Das Spiel sollte jetzt online sein!
3. Erstelle einen Test-Account und teste die Funktionen

## 🔧 Wichtige Konfigurationen

### Statische Dateien

Der Server liefert automatisch das Frontend aus, wenn `NODE_ENV=production` gesetzt ist.

### Port-Konfiguration

Railway setzt automatisch die `PORT` Umgebungsvariable. Der Server verwendet diese automatisch.

### Datenbank-Verbindung

Die `DATABASE_URL` wird automatisch von Railway gesetzt, wenn du die PostgreSQL-Datenbank als Service hinzufügst.

## 🎯 Custom Domain (Optional)

Wenn du eine eigene Domain verwenden möchtest:

1. Gehe zu **"Settings"** → **"Domains"**
2. Klicke auf **"Custom Domain"**
3. Füge deine Domain hinzu (z.B. `spiel.deine-domain.com`)
4. Folge den DNS-Anweisungen von Railway
5. Aktualisiere `CORS_ORIGIN` mit deiner Custom Domain

## 📊 Monitoring

### Logs ansehen

1. Klicke auf deinen Service → **"Deployments"**
2. Wähle ein Deployment → **"View Logs"**
3. Oder nutze **"View Logs"** für Live-Logs

### Health Check

Railway prüft automatisch den `/health` Endpoint:
- URL: `https://dein-service.up.railway.app/health`
- Erwartete Antwort: `{"status":"ok","timestamp":"..."}`

## 🔄 Updates deployen

1. **Automatisch:** Railway deployt automatisch bei jedem Git Push zu deinem Repository
2. **Manuell:** Klicke auf **"Deploy"** → **"Deploy Latest"**

Nach jedem Update:
- Migrationen werden automatisch ausgeführt (falls konfiguriert)
- Oder manuell: `railway run npm run db:migrate`

## 🐛 Troubleshooting

### Build schlägt fehl

**Problem:** `npm run build` schlägt fehl

**Lösung:**
1. Prüfe die Logs in Railway
2. Stelle sicher, dass alle Dependencies in `package.json` vorhanden sind
3. Prüfe ob TypeScript-Kompilierung erfolgreich ist

### Datenbank-Verbindungsfehler

**Problem:** Server kann sich nicht mit der Datenbank verbinden

**Lösung:**
1. Prüfe ob `DATABASE_URL` gesetzt ist (Railway → Variables)
2. Stelle sicher, dass PostgreSQL-Service läuft
3. Prüfe ob `DB_TYPE=postgresql` gesetzt ist

### Frontend wird nicht angezeigt

**Problem:** Nur API-Endpunkte funktionieren, Frontend nicht

**Lösung:**
1. Prüfe ob `npm run build` erfolgreich war
2. Stelle sicher, dass `dist/client` Ordner existiert
3. Prüfe ob `NODE_ENV=production` gesetzt ist

### CORS-Fehler

**Problem:** Browser zeigt CORS-Fehler

**Lösung:**
1. Prüfe ob `CORS_ORIGIN` die richtige URL enthält
2. Stelle sicher, dass die URL mit `https://` beginnt
3. Redeploye den Service nach Änderung der CORS_ORIGIN

## 💰 Kosten

Railway bietet:
- **Free Tier:** $5 kostenloses Guthaben pro Monat
- **Hobby Plan:** $5/Monat für mehr Ressourcen
- **Pro Plan:** $20/Monat für Production-Apps

Für ein kleines Spiel reicht der Free Tier meist aus!

## 📚 Weitere Ressourcen

- [Railway Dokumentation](https://docs.railway.app/)
- [Railway Discord Community](https://discord.gg/railway)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## ✅ Checkliste

- [ ] Railway Account erstellt
- [ ] GitHub Repository verbunden
- [ ] PostgreSQL Datenbank hinzugefügt
- [ ] Environment Variables gesetzt
- [ ] Build & Start Commands konfiguriert
- [ ] Deployment erfolgreich
- [ ] Domain konfiguriert
- [ ] CORS_ORIGIN aktualisiert
- [ ] Migrationen ausgeführt
- [ ] Spiel getestet
- [ ] (Optional) Custom Domain eingerichtet

---

**Viel Erfolg beim Deployment! 🚀**

Dein Spiel ist jetzt online und für alle zugänglich!
