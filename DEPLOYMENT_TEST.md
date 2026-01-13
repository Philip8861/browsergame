# ✅ Deployment-Prüfung - Schritt für Schritt

## 🎯 Schnelltest (2 Minuten)

### 1. Health Check testen

Öffne im Browser:
```
https://DEINE-RAILWAY-URL/health
```

**Erwartete Antwort:**
```json
{"status":"ok","timestamp":"2024-..."}
```

✅ **Wenn du das siehst:** Server läuft perfekt!

### 2. Frontend testen

Öffne im Browser:
```
https://DEINE-RAILWAY-URL
```

**Erwartetes Ergebnis:**
- Die Login-Seite oder Startseite des Spiels wird angezeigt
- Keine Fehler im Browser (F12 → Console prüfen)

✅ **Wenn das Spiel lädt:** Frontend funktioniert!

### 3. Registrierung testen

1. Versuche dich zu registrieren:
   - E-Mail: `test@example.com`
   - Username: `testuser`
   - Passwort: `test123456`
2. Klicke auf "Registrieren"

✅ **Wenn Registrierung funktioniert:** API + Datenbank funktionieren!

## 📊 Detaillierte Prüfung

### Prüfe Railway Logs

1. Gehe zu Railway → Dein Service → **"View Logs"**
2. Suche nach folgenden Meldungen:

**✅ Gute Zeichen:**
```
✅ PostgreSQL Datenbank-Modul geladen
✅ Neue Datenbankverbindung etabliert
✅ Routes erfolgreich geladen
✅ Statische Dateien aktiviert für Production
🚀 Server läuft auf Port 5000
✅ Server bereit für Requests
```

**❌ Schlechte Zeichen (Fehler):**
```
❌ Fehler beim Laden von PostgreSQL
❌ Database query failed
❌ Connection refused
❌ CORS-Fehler
```

### Prüfe Browser Console

1. Öffne deine Railway-URL im Browser
2. Drücke **F12** (Entwicklertools öffnen)
3. Gehe zum Tab **"Console"**
4. Prüfe auf Fehler:

**✅ Keine Fehler:** Alles funktioniert!

**❌ Mögliche Fehler:**
- `CORS policy`: CORS_ORIGIN nicht richtig gesetzt
- `Failed to fetch`: Server nicht erreichbar
- `404 Not Found`: Route nicht gefunden
- `500 Internal Server Error`: Server-Fehler

### Prüfe Environment Variables

In Railway → Dein Service → **"Variables"**:

**Muss vorhanden sein:**
- ✅ `NODE_ENV` = `production`
- ✅ `DB_TYPE` = `postgresql`
- ✅ `DATABASE_URL` = (automatisch von Railway gesetzt)
- ✅ `JWT_SECRET` = (dein Secret)
- ✅ `PORT` = `5000`
- ✅ `CORS_ORIGIN` = (deine Railway-URL)

### Prüfe Build

In Railway → Dein Service → **"Deployments"**:

1. Klicke auf das neueste Deployment
2. Prüfe ob Build erfolgreich war:
   - ✅ "Build succeeded" oder "Deployment successful"
   - ❌ KEINE Fehler wie "Build failed" oder "npm install failed"

## 🐛 Häufige Probleme & Lösungen

### Problem: "Cannot GET /"

**Symptom:** Browser zeigt "Cannot GET /" statt dem Spiel

**Lösung:**
1. Prüfe ob `NODE_ENV=production` gesetzt ist
2. Prüfe Railway Logs → Suche nach `✅ Statische Dateien aktiviert`
3. Prüfe ob Build erfolgreich war → `dist/client` Ordner sollte existieren

### Problem: Frontend lädt nicht

**Symptom:** Nur API-Endpunkte funktionieren, Frontend nicht

**Lösung:**
1. Prüfe Railway Logs → "View Logs"
2. Suche nach: `✅ Statische Dateien aktiviert für Production`
3. Prüfe ob `npm run build` erfolgreich war
4. Prüfe ob `dist/client` Ordner existiert

### Problem: Datenbank-Fehler

**Symptom:** Registrierung/Login funktioniert nicht, DB-Fehler in Logs

**Lösung:**
1. Prüfe ob PostgreSQL-Service läuft (grüner Punkt in Railway)
2. Prüfe ob `DATABASE_URL` gesetzt ist (Railway → Variables)
3. Prüfe ob `DB_TYPE=postgresql` gesetzt ist
4. Führe Migrationen aus: Railway Console → `npm run db:migrate`

### Problem: CORS-Fehler

**Symptom:** Browser Console zeigt "CORS policy" Fehler

**Lösung:**
1. Prüfe ob `CORS_ORIGIN` die exakte Railway-URL enthält
2. Stelle sicher, dass die URL mit `https://` beginnt
3. Redeploye nach Änderung der CORS_ORIGIN

### Problem: 500 Internal Server Error

**Symptom:** Server antwortet mit 500 Fehler

**Lösung:**
1. Prüfe Railway Logs → "View Logs"
2. Suche nach dem genauen Fehler
3. Häufige Ursachen:
   - Datenbank-Verbindungsfehler
   - Fehlende Environment Variables
   - Build-Fehler

## ✅ Finale Checkliste

- [ ] Health Check funktioniert (`/health`)
- [ ] Frontend lädt (`/`)
- [ ] Keine Fehler in Browser Console (F12)
- [ ] Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Insel erstellen funktioniert
- [ ] Gebäude bauen funktioniert
- [ ] Bauschleife funktioniert
- [ ] Keine Datenbank-Fehler in Railway Logs
- [ ] Alle Environment Variables gesetzt
- [ ] Build erfolgreich

## 🎉 Wenn alles funktioniert:

**Dein Spiel ist jetzt online!** 🚀

- ✅ Von überall erreichbar
- ✅ Auf allen Geräten spielbar
- ✅ Für alle zugänglich (wenn du die URL teilst)

**Teile die URL mit deinen Freunden:**
```
https://DEINE-RAILWAY-URL
```

---

**Gib mir deine Railway-URL und ich helfe dir bei der Prüfung!** 🚀
