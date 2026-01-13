# ✅ Deployment-Prüfung Checkliste

## 🔍 Was du prüfen solltest:

### 1. Railway-URL finden

1. Gehe zu Railway Dashboard
2. Klicke auf deinen Service
3. Gehe zu **"Settings"** → **"Domains"**
4. Kopiere die URL (z.B. `https://browsergame-production.up.railway.app`)

### 2. Health Check testen

Öffne im Browser:
```
https://DEINE-RAILWAY-URL/health
```

**Erwartete Antwort:**
```json
{"status":"ok","timestamp":"2024-..."}
```

✅ **Wenn du das siehst:** Server läuft!

### 3. Frontend testen

Öffne im Browser:
```
https://DEINE-RAILWAY-URL
```

**Erwartetes Ergebnis:**
- Die Login-Seite oder Startseite des Spiels wird angezeigt
- Keine Fehler im Browser (F12 → Console prüfen)

✅ **Wenn das Spiel lädt:** Frontend funktioniert!

### 4. API testen

Öffne im Browser:
```
https://DEINE-RAILWAY-URL/api/health
```

Oder teste die Registrierung:
- Versuche dich zu registrieren
- Erstelle einen Account

✅ **Wenn Registrierung funktioniert:** API funktioniert!

### 5. Datenbank-Verbindung prüfen

**In Railway:**
1. Gehe zu deinem Service → **"View Logs"**
2. Suche nach:
   - ✅ `✅ PostgreSQL Datenbank-Modul geladen`
   - ✅ `✅ Neue Datenbankverbindung etabliert`
   - ❌ KEINE Fehler wie "Connection refused" oder "Database error"

✅ **Wenn keine DB-Fehler:** Datenbank verbunden!

### 6. CORS prüfen

**Im Browser (F12 → Console):**
- Prüfe ob CORS-Fehler angezeigt werden
- Sollte KEINE Fehler wie "CORS policy" geben

✅ **Wenn keine CORS-Fehler:** CORS konfiguriert!

## 🐛 Häufige Probleme:

### Problem: "Cannot GET /"

**Lösung:**
- Prüfe ob `NODE_ENV=production` gesetzt ist
- Prüfe ob Build erfolgreich war (Railway → Deployments → Logs)

### Problem: Frontend lädt nicht

**Lösung:**
1. Prüfe Railway Logs → "View Logs"
2. Suche nach `✅ Statische Dateien aktiviert für Production`
3. Prüfe ob `dist/client` Ordner existiert

### Problem: Datenbank-Fehler

**Lösung:**
1. Prüfe ob PostgreSQL-Service läuft (grüner Punkt)
2. Prüfe ob `DATABASE_URL` gesetzt ist (Railway → Variables)
3. Prüfe ob `DB_TYPE=postgresql` gesetzt ist

### Problem: CORS-Fehler

**Lösung:**
1. Prüfe ob `CORS_ORIGIN` die exakte Railway-URL enthält
2. Stelle sicher, dass die URL mit `https://` beginnt
3. Redeploye nach Änderung

## 📊 Prüf-Liste:

- [ ] Railway-URL gefunden
- [ ] Health Check funktioniert (`/health`)
- [ ] Frontend lädt (`/`)
- [ ] API funktioniert (Registrierung/Login möglich)
- [ ] Datenbank verbunden (keine DB-Fehler in Logs)
- [ ] CORS konfiguriert (keine CORS-Fehler im Browser)
- [ ] Spiel funktioniert (Account erstellen, Insel erstellen, etc.)

---

**Gib mir deine Railway-URL und ich helfe dir bei der Prüfung!** 🚀
