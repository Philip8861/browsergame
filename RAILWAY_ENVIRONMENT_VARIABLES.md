# 🔐 Environment Variables für Railway

## ✅ Liste aller benötigten Variablen:

Du musst diese **6 Environment Variables** in Railway setzen:

### 1. `NODE_ENV`
```
NODE_ENV = production
```
**Was ist das?** Sagt dem Server, dass er im Production-Modus läuft.

---

### 2. `DB_TYPE`
```
DB_TYPE = postgresql
```
**Was ist das?** Sagt dem Server, dass er PostgreSQL verwenden soll (nicht SQLite).

---

### 3. `DATABASE_URL` ⚠️ WICHTIG!
```
DATABASE_URL = postgresql://postgres:PASSWORD@HOST:5432/railway
```
**Was ist das?** Die Verbindungs-URL zu deiner PostgreSQL-Datenbank.

**Wie kopiere ich das?**
1. Klicke auf **PostgreSQL** (die Datenbank-Karte)
2. Klicke auf **"Settings"** (oben)
3. Scrolle zu **"Variables"**
4. Finde **`DATABASE_URL`**
5. Klicke auf das **👁️ Auge-Symbol** (um den Wert anzuzeigen)
6. Klicke auf **"Copy"** (oder markiere und kopiere den Wert)
7. Gehe zurück zum **Service**
8. Füge ihn als Variable hinzu

**Beispiel:**
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

---

### 4. `JWT_SECRET` ⚠️ WICHTIG!
```
JWT_SECRET = dein-super-geheimer-secret-min-32-zeichen-lang
```
**Was ist das?** Ein geheimer Schlüssel für die Verschlüsselung von Login-Tokens.

**Wie generiere ich das?**
**Option 1: PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 2: Online Generator**
- Gehe zu: https://www.random.org/strings/
- Länge: 64 Zeichen
- Zeichensatz: Alphanumerisch
- Kopiere das Ergebnis

**Option 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**WICHTIG:** 
- Mindestens 32 Zeichen lang
- Verwende einen zufälligen, sicheren Wert
- Speichere ihn sicher (du brauchst ihn später!)

**Beispiel:**
```
JWT_SECRET = a7f3b9c2d4e6f8a1b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1
```

---

### 5. `PORT`
```
PORT = 3000
```
**Was ist das?** Der Port, auf dem der Server läuft.

**Hinweis:** Railway setzt `PORT` manchmal automatisch. Falls der Service nicht startet, setze ihn manuell auf `3000`.

---

### 6. `CORS_ORIGIN` (später setzen!)
```
CORS_ORIGIN = 
```
**Was ist das?** Die URL deines Spiels (für Browser-Sicherheit).

**WICHTIG:** 
- **Lass es erstmal LEER** oder setze einen Platzhalter
- **Nach dem Deployment** setzen wir es auf deine Railway-URL
- Beispiel später: `CORS_ORIGIN = https://browsergame-production.up.railway.app`

---

## 📋 Schritt-für-Schritt: Variablen in Railway setzen

### Schritt 1: Service öffnen

1. Gehe zum Projekt-Dashboard (`independent-exploration`)
2. **Klicke auf den SERVICE** (nicht PostgreSQL!)
3. Der Service sollte heißen: `browsergame-production` oder ähnlich

---

### Schritt 2: Settings öffnen

1. **Klicke auf "Settings"** (oben in der Navigation)
2. Scrolle nach unten zu **"Variables"** oder **"Environment Variables"**

---

### Schritt 3: Variablen hinzufügen

Für jede Variable:

1. **Klicke auf "+ New Variable"** oder **"+ Add Variable"**
2. **Name:** Tippe den Variablennamen (z.B. `NODE_ENV`)
3. **Value:** Tippe den Wert (z.B. `production`)
4. **Klicke auf "Add"** oder **"Save"**

**Wiederhole das für alle 6 Variablen!**

---

### Schritt 4: DATABASE_URL kopieren

**WICHTIG:** Für `DATABASE_URL` musst du den Wert von PostgreSQL kopieren!

1. **Gehe zurück zum Projekt-Dashboard**
2. **Klicke auf PostgreSQL** (die Datenbank-Karte)
3. **Klicke auf "Settings"**
4. **Scrolle zu "Variables"**
5. **Finde `DATABASE_URL`**
6. **Klicke auf das 👁️ Auge-Symbol** (um den Wert zu sehen)
7. **Kopiere den kompletten Wert** (beginnt mit `postgresql://...`)
8. **Gehe zurück zum Service**
9. **Füge `DATABASE_URL` als Variable hinzu** mit dem kopierten Wert

---

### Schritt 5: Prüfen

Nach dem Hinzufügen aller Variablen solltest du sehen:

```
Variables:
✅ NODE_ENV = production
✅ DB_TYPE = postgresql
✅ DATABASE_URL = postgresql://...
✅ JWT_SECRET = ...
✅ PORT = 3000
✅ CORS_ORIGIN = (leer oder Platzhalter)
```

---

### Schritt 6: Service neu deployen

Nach dem Setzen der Variablen:

1. **Klicke auf "Deployments"** (oben)
2. **Klicke auf "Redeploy"** (oder drei Punkte → Redeploy)
3. **Warte 2-3 Minuten** auf das Deployment

---

## 🐛 Häufige Fehler:

### Fehler 1: "DATABASE_URL not found"

**Lösung:**
- Stelle sicher, dass du auf **PostgreSQL → Settings → Variables** gehst
- Nicht auf Service → Variables!
- Die `DATABASE_URL` ist nur bei der Datenbank sichtbar

### Fehler 2: "JWT_SECRET too short"

**Lösung:**
- Stelle sicher, dass `JWT_SECRET` mindestens 32 Zeichen lang ist
- Verwende einen Generator (siehe oben)

### Fehler 3: Service startet nicht

**Lösung:**
1. Prüfe alle Variablen (alle gesetzt?)
2. Prüfe `PORT` (sollte `3000` sein)
3. Prüfe Logs: Service → "Logs" Tab

---

## 💡 Checkliste:

- [ ] `NODE_ENV` = `production`
- [ ] `DB_TYPE` = `postgresql`
- [ ] `DATABASE_URL` = von PostgreSQL kopiert
- [ ] `JWT_SECRET` = mindestens 32 Zeichen lang
- [ ] `PORT` = `3000`
- [ ] `CORS_ORIGIN` = leer (wird später gesetzt)
- [ ] Service neu deployed

---

## 🎯 Nächste Schritte:

Nach dem Setzen aller Variablen und erfolgreichem Deployment:

1. ✅ Service läuft (grüner Punkt)
2. ⏭️ URL finden (Networking → Domain)
3. ⏭️ `CORS_ORIGIN` auf die URL setzen
4. ⏭️ Service neu deployen
5. ⏭️ Datenbank-Migrationen ausführen
6. ⏭️ Spiel testen!

---

**Sag mir Bescheid, wenn du alle Variablen gesetzt hast!** 🚀
