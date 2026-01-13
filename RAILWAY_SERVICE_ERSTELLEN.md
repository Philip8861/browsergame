# 🚀 Service auf Railway erstellen

## ✅ Aktueller Status:

Du hast:
- ✅ Projekt: `independent-exploration`
- ✅ PostgreSQL-Datenbank
- ❌ **KEINEN Service** (das Spiel läuft noch nicht)

## 🎯 Schritt-für-Schritt: Service erstellen

### Schritt 1: "+ New" Button finden

Auf dem Projekt-Dashboard (`independent-exploration`) siehst du oben rechts einen Button:

```
[+ New]  oder  [+ Add Service]
```

**Klicke darauf!**

---

### Schritt 2: Service-Typ wählen

Du siehst jetzt ein Menü mit Optionen:

```
┌─────────────────────────────┐
│  New Service                │
│                             │
│  📦 GitHub Repo             │ ← WÄHLE DIESES!
│  📦 Empty Service           │
│  📦 Template                │
│  🗄️ Database                │
└─────────────────────────────┘
```

**Klicke auf "GitHub Repo"** (oder "GitHub Repository")

---

### Schritt 3: Repository auswählen

Railway zeigt dir eine Liste deiner GitHub-Repositories:

```
┌─────────────────────────────┐
│  Select Repository          │
│                             │
│  🔍 Search...               │
│                             │
│  📦 Philip8861/browsergame  │ ← WÄHLE DIESES!
│  📦 Anderes Repo            │
│  ...                        │
└─────────────────────────────┘
```

**Klicke auf `Philip8861/browsergame`**

---

### Schritt 4: Railway verbindet sich mit GitHub

Railway fragt dich möglicherweise nach Berechtigungen:
- **"Authorize Railway"** → Klicke darauf
- **"Install Railway App"** → Klicke darauf

**Wichtig:** Erlaube Railway den Zugriff auf dein Repository!

---

### Schritt 5: Service wird erstellt

Railway erstellt jetzt automatisch:
1. ✅ Einen neuen Service
2. ✅ Startet das Deployment
3. ✅ Generiert eine URL

**Das kann 2-5 Minuten dauern!**

Du siehst:
```
┌─────────────────────────────┐
│  browsergame-production     │
│                             │
│  Status: 🟡 Building...     │
│                             │
│  [View Logs]                │
└─────────────────────────────┘
```

---

### Schritt 6: Warte auf Deployment

**Warte, bis der Status grün wird:**
- 🟡 Building... → Warte
- 🟢 Running → Fertig!

**Das kann 2-5 Minuten dauern!**

---

### Schritt 7: Environment Variables setzen

**WICHTIG:** Nach dem Deployment musst du Environment Variables setzen!

1. **Klicke auf den neuen Service** (nicht PostgreSQL!)
2. **Klicke auf "Settings"** (oben)
3. **Scrolle zu "Variables"**
4. **Füge diese Variablen hinzu:**

```
NODE_ENV = production
DB_TYPE = postgresql
DATABASE_URL = [Kopiere von PostgreSQL → Variables → DATABASE_URL]
JWT_SECRET = [Dein generierter Secret, min. 32 Zeichen]
PORT = 3000
CORS_ORIGIN = [Wird später gesetzt, erstmal leer lassen]
```

**Wie kopiere ich DATABASE_URL?**
1. Klicke auf **PostgreSQL** (die Datenbank)
2. Klicke auf **"Settings"**
3. Scrolle zu **"Variables"**
4. Kopiere den Wert von **`DATABASE_URL`**
5. Gehe zurück zum Service
6. Füge ihn als Variable hinzu

---

### Schritt 8: Service neu deployen

Nach dem Setzen der Variables:
1. Klicke auf **"Deployments"** (oben)
2. Klicke auf **"Redeploy"** (oder drei Punkte → Redeploy)

**Warte erneut 2-3 Minuten!**

---

### Schritt 9: URL finden

Nach erfolgreichem Deployment:

1. **Klicke auf "Networking"** (oben)
2. **Oder** schaue oben rechts nach **"Open"** Button

Du solltest sehen:
```
Public Networking
Access your application over HTTP with the following domains

browsergame-production.up.railway.app  ← DAS IST DEINE URL!
Port 3000
```

**Das ist die URL für dein Spiel!** 🎉

---

## 🐛 Häufige Probleme:

### Problem 1: "Repository not found"

**Lösung:**
- Stelle sicher, dass Railway Zugriff auf dein GitHub-Repository hat
- Gehe zu GitHub → Settings → Applications → Railway → Erlaube Zugriff

### Problem 2: Build schlägt fehl

**Lösung:**
1. Klicke auf "View Logs"
2. Prüfe die Fehlermeldung
3. Häufige Probleme:
   - Fehlende `package.json`
   - Fehlende Build-Skripte
   - Fehlende Environment Variables

### Problem 3: Service startet nicht

**Lösung:**
1. Prüfe Environment Variables (alle gesetzt?)
2. Prüfe `PORT` Variable (sollte `3000` sein)
3. Prüfe Logs auf Fehler

---

## 💡 Nächste Schritte nach erfolgreichem Deployment:

1. ✅ Service läuft (grüner Punkt)
2. ✅ URL gefunden
3. ⏭️ `CORS_ORIGIN` auf die URL setzen
4. ⏭️ Service neu deployen
5. ⏭️ Datenbank-Migrationen ausführen
6. ⏭️ Spiel testen!

---

## 🎯 Was du jetzt tun solltest:

1. **Klicke auf "+ New"** (oben rechts)
2. **Wähle "GitHub Repo"**
3. **Wähle `Philip8861/browsergame`**
4. **Warte auf das Deployment**
5. **Sag mir Bescheid, wenn der Service erstellt wurde!**

Dann helfen wir dir mit den Environment Variables weiter! 🚀
