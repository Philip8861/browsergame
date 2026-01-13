# 🌐 URL finden - Du bist auf der Projekt-Seite!

## 🎯 Von der Projekt-Seite zur URL:

### Schritt 1: Service finden

Auf der Projekt-Seite siehst du deine Services:
```
┌─────────────────────────────────────┐
│  📦 browsergame (Projekt)          │
├─────────────────────────────────────┤
│  📦 browsergame-production (Service) ← HIER KLICKEN! │
│  🗄️  PostgreSQL (Datenbank)        │
└─────────────────────────────────────┘
```

**WICHTIG:** Klicke auf den **SERVICE** (nicht die Datenbank!)

### Schritt 2: Settings öffnen

Nachdem du auf den Service geklickt hast:
1. Du siehst oben Tabs: `[Metrics] [Logs] [Deployments] [Variables] [Settings]`
2. **Klicke auf "Settings"** Tab

### Schritt 3: Domains finden

1. In Settings scrolle nach unten
2. Suche nach **"Domains"** Sektion
3. Dort siehst du die URL:
   ```
   https://dein-service-name.up.railway.app
   ```
4. **Kopiere diese URL!**

## 🔧 Alternative: Railway CLI verwenden

Falls du Railway CLI installiert hast:

```bash
# Login (falls noch nicht geschehen)
railway login

# Verbinde mit Projekt
railway link -p c189f3e4-5d02-43f5-bba4-d8aa8c18b65f

# Zeige Domain-URL
railway domain
```

## 💡 Schnellste Methode:

1. **Auf der Projekt-Seite:** Klicke auf den **SERVICE** (mit grünem Punkt)
2. **Oben rechts** siehst du einen **"Open"** Button 🌐
3. **Klicke darauf** → Die URL wird geöffnet!

---

**Klicke auf deinen Service und dann auf "Settings" → "Domains"!** 🎯
