# 🌐 Domain generieren - Detaillierte Anleitung

## ⚠️ Aktueller Status:

Du siehst: **"Unexposed service"**

Das bedeutet: Der Service läuft, aber hat noch keine öffentliche URL!

---

## 🎯 Schritt-für-Schritt: Domain generieren

### Schritt 1: Settings öffnen

1. **Du bist auf der Service-Seite** (`browsergame`)
2. **Oben siehst du Tabs:**
   ```
   [Deployments] [Variables] [Metrics] [Settings]
   ```
3. **Klicke auf "Settings"** (ganz rechts)

---

### Schritt 2: Networking-Bereich finden

Auf der Settings-Seite scrollst du nach unten. Du siehst verschiedene Bereiche:

```
┌─────────────────────────────────────┐
│  Settings                           │
│                                     │
│  General                            │
│  Variables                          │
│  Build & Deploy                     │
│  Networking                         │ ← HIER!
│  Service                            │
│  ...                                │
└─────────────────────────────────────┘
```

**Scrolle zu "Networking"** (kann weiter unten sein!)

---

### Schritt 3: Public Networking finden

Im Networking-Bereich siehst du:

```
┌─────────────────────────────────────┐
│  Networking                         │
│                                     │
│  Public Networking                  │ ← HIER!
│  [ ] Generate Domain                │
│                                     │
│  Private Networking                 │
│  ...                                │
└─────────────────────────────────────┘
```

**ODER** du siehst:

```
Public Networking
Access your application over HTTP with the following domains

[+ Generate Domain]  ← KLICKE DARAUF!
```

---

### Schritt 4: Domain generieren

**Klicke auf "Generate Domain"** oder **"+ Generate Domain"**

**WICHTIG:** 
- Es kann ein Checkbox sein → Aktiviere sie!
- Oder ein Button → Klicke darauf!

---

### Schritt 5: Warten

Nach dem Klick:

1. **Railway generiert automatisch eine Domain**
2. **Warte 10-30 Sekunden**
3. **Die Seite aktualisiert sich automatisch**

---

### Schritt 6: URL finden

Nach der Generierung siehst du:

```
Public Networking
Access your application over HTTP with the following domains

browsergame-production.up.railway.app  ← DEINE URL!
Port 3000
```

**ODER** oben rechts auf der Service-Seite:

```
🌐 Open  browsergame-production.up.railway.app
```

✅ **URL wurde generiert!**

---

## 🎨 Alternative Methode: Über die Hauptseite

Falls du "Networking" in Settings nicht findest:

### Option A: Direkt über die Service-Übersicht

1. **Gehe zurück zur Service-Übersicht** (Pfeil oben links)
2. **Oben rechts** siehst du möglicherweise:
   ```
   [🌐 Generate Domain]
   ```
3. **Klicke darauf!**

---

### Option B: Über die Activity-Seite

1. **Klicke auf "Activity"** (oben links, neben dem Projektnamen)
2. **Suche nach "Networking"** oder **"Public Domain"**
3. **Klicke auf "Generate Domain"**

---

## 🐛 Wenn du "Networking" nicht findest:

### Lösung 1: Scrolle weiter nach unten

- "Networking" kann ganz unten in Settings sein
- Scrolle bis zum Ende der Seite

### Lösung 2: Prüfe ob der Service läuft

- Der Service muss **laufen** (🟢 grüner Punkt)
- Falls nicht: Warte auf das Deployment

### Lösung 3: Prüfe PORT Variable

1. **Gehe zu Settings → Variables**
2. **Prüfe ob `PORT=3000` gesetzt ist**
3. Falls nicht: Füge es hinzu
4. **Service neu deployen**

---

## 📋 Checkliste:

- [ ] Auf Service-Seite (`browsergame`)
- [ ] "Settings" Tab geöffnet
- [ ] Zu "Networking" gescrollt
- [ ] "Generate Domain" gefunden
- [ ] "Generate Domain" geklickt/aktiviert
- [ ] 10-30 Sekunden gewartet
- [ ] URL wurde generiert (z.B. `browsergame-production.up.railway.app`)

---

## 🎯 Nach der Domain-Generierung:

1. ✅ URL kopieren (mit `https://` davor)
2. ⏭️ `CORS_ORIGIN` auf die URL setzen
3. ⏭️ Service neu deployen
4. ⏭️ Datenbank-Migrationen ausführen
5. ⏭️ Spiel testen!

---

## 💡 Tipp:

Falls du immer noch Probleme hast:

**Beschreibe mir genau, was du siehst:**
- Welche Tabs siehst du oben?
- Was steht unter "Settings"?
- Siehst du "Networking" irgendwo?

Dann kann ich dir genau sagen, wo du klicken musst! 🎯

---

**Sag mir Bescheid, ob du "Networking" gefunden hast!** 🚀
