# 🌐 Service öffentlich machen (Expose)

## ⚠️ Problem:

Du siehst: **"Unexposed service"**

Das bedeutet: Der Service läuft, aber hat noch **keine öffentliche URL**!

---

## ✅ Lösung: Service "exposen"

### Schritt 1: Networking öffnen

1. **Auf der Service-Seite** (`browsergame`)
2. **Klicke auf "Settings"** (oben)
3. **Scrolle zu "Networking"** oder **"Public Networking"**

**ODER:**

1. **Klicke direkt auf "Networking"** (wenn sichtbar in der Navigation)

---

### Schritt 2: Public Networking aktivieren

Auf der Networking-Seite siehst du:

```
┌─────────────────────────────────────┐
│  Networking                         │
│                                     │
│  Public Networking                  │
│  [ ] Generate Domain                │ ← HIER!
│                                     │
│  Private Networking                 │
│  ...                                │
└─────────────────────────────────────┘
```

**Oder du siehst:**

```
Public Networking
Access your application over HTTP with the following domains

[+ Generate Domain]  ← KLICKE DARAUF!
```

**Klicke auf "Generate Domain"** oder **"Generate Public Domain"**

---

### Schritt 3: Domain generieren

Nach dem Klick:

1. **Railway generiert automatisch eine Domain**
2. **Warte 10-30 Sekunden**
3. **Du siehst jetzt:**

```
Public Networking
Access your application over HTTP with the following domains

browsergame-production.up.railway.app  ← DEINE URL!
Port 3000
```

✅ **URL wurde generiert!**

---

### Schritt 4: URL kopieren

**Kopiere die URL:**
- Beispiel: `browsergame-production.up.railway.app`
- **WICHTIG:** Füge `https://` davor ein!
- Vollständige URL: `https://browsergame-production.up.railway.app`

---

### Schritt 5: CORS_ORIGIN setzen

1. **Klicke auf "Settings"** → **"Variables"**
2. **Finde `CORS_ORIGIN`** in der Liste
3. **Klicke auf das ✏️ Bearbeiten-Symbol**
4. **Füge deine URL ein:**
   ```
   https://browsergame-production.up.railway.app
   ```
   (Ersetze mit deiner tatsächlichen URL!)
5. **Klicke auf "Save"**

---

### Schritt 6: Service neu deployen

1. **Klicke auf "Deployments"**
2. **Klicke auf "Redeploy"**
3. **Warte 2-3 Minuten**

---

## 🎨 Alternative: Über Settings

Falls du "Networking" nicht findest:

1. **Klicke auf "Settings"**
2. **Scrolle ganz nach unten**
3. **Suche nach "Networking"** oder **"Public Networking"**
4. **Aktiviere "Generate Domain"** oder **"Public Domain"**

---

## 🐛 Häufige Probleme:

### Problem 1: "Generate Domain" Button nicht sichtbar

**Lösung:**
- Stelle sicher, dass du auf **Service → Settings → Networking** bist
- Nicht auf PostgreSQL!
- Scrolle nach unten, der Button kann weiter unten sein

### Problem 2: Domain wird nicht generiert

**Lösung:**
- Warte 30-60 Sekunden
- Aktualisiere die Seite (F5)
- Prüfe die Logs (Service → Logs)

### Problem 3: "Unexposed service" bleibt bestehen

**Lösung:**
1. Prüfe, ob der Service läuft (grüner Punkt)
2. Prüfe, ob `PORT` Variable gesetzt ist (`PORT=3000`)
3. Warte 1-2 Minuten nach dem Generieren der Domain
4. Aktualisiere die Seite

---

## ✅ Checkliste:

- [ ] Service läuft (🟢 grüner Punkt)
- [ ] "Generate Domain" geklickt
- [ ] Domain wurde generiert (z.B. `browsergame-production.up.railway.app`)
- [ ] URL kopiert (mit `https://`)
- [ ] `CORS_ORIGIN` auf die URL gesetzt
- [ ] Service neu deployed
- [ ] "Unexposed service" ist weg (zeigt jetzt die URL)

---

## 🎯 Nächste Schritte:

Nach dem Exposen:

1. ✅ Service ist öffentlich
2. ✅ URL verfügbar
3. ⏭️ Datenbank-Migrationen ausführen
4. ⏭️ Spiel testen!

---

**Sag mir Bescheid, wenn die Domain generiert wurde!** 🚀
