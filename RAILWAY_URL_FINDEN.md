# 📍 Wo finde ich meine Railway-URL?

## 🎯 Schritt-für-Schritt Anleitung:

### Methode 1: Über Settings → Domains (Empfohlen)

1. **Gehe zu Railway Dashboard:**
   - Öffne [railway.app](https://railway.app)
   - Logge dich ein

2. **Wähle dein Projekt:**
   - Klicke auf dein Projekt (z.B. "browsergame")

3. **Wähle deinen Service:**
   - Klicke auf deinen Service (nicht die Datenbank!)

4. **Gehe zu Settings:**
   - Klicke auf den Tab **"Settings"** (oben im Service)

5. **Gehe zu Domains:**
   - Scrolle nach unten zu **"Domains"** Sektion
   - Oder klicke direkt auf **"Domains"** in der Seitenleiste

6. **Kopiere die URL:**
   - Du siehst eine URL wie: `https://browsergame-production.up.railway.app`
   - Oder: `https://browsergame-production.railway.app`
   - Klicke auf das **Kopier-Symbol** 📋 neben der URL

### Methode 2: Über das Dashboard

1. **Gehe zu Railway Dashboard**
2. **Klicke auf dein Projekt**
3. **Klicke auf deinen Service**
4. **Oben rechts** siehst du die URL direkt angezeigt
5. Klicke darauf zum Kopieren

### Methode 3: Nach dem ersten Deployment

1. **Nach erfolgreichem Deployment:**
   - Railway zeigt dir automatisch eine Benachrichtigung
   - Klicke auf **"View"** oder **"Open"**
   - Die URL wird geöffnet

## 🔍 So sieht es aus:

```
┌─────────────────────────────────────────────┐
│  Railway Dashboard                          │
├─────────────────────────────────────────────┤
│  📦 browsergame (Projekt)                   │
│     ┌───────────────────────────────────┐  │
│     │  📦 browsergame-production (Service)│  │
│     │                                     │  │
│     │  [Settings] [Variables] [Deployments]│ │
│     │                                     │  │
│     │  Settings Tab:                      │  │
│     │  ┌───────────────────────────────┐ │  │
│     │  │  Domains                      │ │  │
│     │  │  ┌─────────────────────────┐ │ │  │
│     │  │  │ https://...railway.app  │ │ │  │
│     │  │  │ [📋] ← HIER KLICKEN!    │ │ │  │
│     │  │  └─────────────────────────┘ │ │  │
│     │  └───────────────────────────────┘ │  │
│     └───────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 📝 URL-Format:

Deine Railway-URL sieht immer so aus:
```
https://SERVICE-NAME.up.railway.app
```

**Beispiele:**
- `https://browsergame-production.up.railway.app`
- `https://browsergame.up.railway.app`
- `https://browsergame-production.railway.app`

## ✅ Wenn du die URL gefunden hast:

1. **Kopiere sie**
2. **Teste sie im Browser:**
   - Öffne: `https://DEINE-URL`
   - Öffne: `https://DEINE-URL/health`
3. **Aktualisiere CORS_ORIGIN:**
   - Railway → Service → Variables
   - Finde `CORS_ORIGIN`
   - Setze den Wert auf deine Railway-URL
   - Klicke auf "Save"

## 🐛 Falls du die URL nicht findest:

**Mögliche Gründe:**
1. **Deployment noch nicht fertig:**
   - Warte bis das Deployment abgeschlossen ist
   - Prüfe Railway → Deployments → Status

2. **Service läuft nicht:**
   - Prüfe ob der Service einen grünen Punkt hat
   - Prüfe ob Build erfolgreich war

3. **Domain noch nicht generiert:**
   - Railway generiert die URL automatisch nach dem ersten Deployment
   - Warte 1-2 Minuten nach dem Deployment

## 💡 Tipp:

Die URL wird auch in den **Railway Logs** angezeigt:
1. Railway → Service → "View Logs"
2. Suche nach "Server läuft auf" oder "Listening on"

---

**Hast du die URL gefunden? Teste sie und sag mir, ob alles funktioniert!** 🚀
