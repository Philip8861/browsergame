# 🔧 DATABASE_URL korrigieren - "ENOTFOUND HOST" Fehler beheben

## ❌ Problem:

Der Fehler `getaddrinfo ENOTFOUND HOST` bedeutet, dass die `DATABASE_URL` nicht korrekt ist. Der Hostname ist buchstäblich "HOST" statt der echten Datenbank-URL.

## ✅ Lösung: DATABASE_URL korrekt setzen

### Schritt 1: DATABASE_URL von PostgreSQL-Datenbank kopieren

1. **Gehe zu Railway** → https://railway.app
2. **Klicke auf dein Projekt** (`independent-exploration`)
3. **Klicke auf die PostgreSQL-Datenbank** (nicht auf `browsergame` Service!)
   - Sie sollte einen Namen wie `PostgreSQL` oder `postgres-production-...` haben
4. **Klicke auf "Variables"** (oben)
5. **Suche nach `DATABASE_URL`**
6. **Klicke auf das Kopier-Symbol** (📋) neben `DATABASE_URL`
   - Die URL sollte so aussehen: `postgresql://postgres:password@host:port/railway`

### Schritt 2: DATABASE_URL in browsergame Service setzen

1. **Gehe zurück zum Service** (`browsergame`)
2. **Klicke auf "Variables"** (oben)
3. **Suche nach `DATABASE_URL`**
4. **Klicke auf `DATABASE_URL`** (oder "+ New Variable" falls nicht vorhanden)
5. **Füge die kopierte URL ein**
   - **WICHTIG:** Die URL sollte mit `postgresql://` beginnen
   - **WICHTIG:** Keine Platzhalter wie `HOST`, `PORT`, `USER` verwenden!
   - Beispiel: `postgresql://postgres:abc123@monorail.proxy.rlwy.net:12345/railway`

### Schritt 3: Prüfe alle Variablen

Stelle sicher, dass diese Variablen gesetzt sind:

- ✅ `NODE_ENV` = `production`
- ✅ `DB_TYPE` = `postgresql`
- ✅ `DATABASE_URL` = `postgresql://...` (die komplette URL von der PostgreSQL-Datenbank)
- ✅ `JWT_SECRET` = `78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a`
- ✅ `PORT` = `3000`
- ✅ `CORS_ORIGIN` = `https://browsergame-production-f1c0.up.railway.app`

### Schritt 4: Redeploy

1. **Nach dem Setzen der Variablen:**
2. **Klicke auf "Redeploy"** (oben rechts)
3. **Warte auf das Deployment**
4. **Prüfe die Logs**

## 🔍 Wie erkenne ich, ob DATABASE_URL korrekt ist?

### ✅ Korrekt:
```
postgresql://postgres:password123@monorail.proxy.rlwy.net:12345/railway
```

### ❌ Falsch (Platzhalter):
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### ❌ Falsch (nur Hostname):
```
HOST
```

## 🎯 Nach dem Redeploy solltest du sehen:

In den Logs:
```
✅ PostgreSQL Datenbank-Modul geladen
🔧 Prüfe Datenbank-Schema...
✅ Automatische Migrationen abgeschlossen
🚀 Server läuft auf Port 3000
```

**Dann sollte Login funktionieren!** 🎉

---

**Wichtig:** Die `DATABASE_URL` muss von der **PostgreSQL-Datenbank** kopiert werden, nicht vom `browsergame` Service!
