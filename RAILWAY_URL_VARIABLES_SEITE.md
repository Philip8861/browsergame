# 🌐 URL finden - Du bist auf der Variables-Seite!

## ✅ Was ich sehe:

- ✅ Alle Environment Variables sind gesetzt
- ⚠️ `CORS_ORIGIN` ist noch auf Platzhalter: `https://dein-service.up.railway.app`
- ✅ `DATABASE_URL` ist gesetzt
- ✅ `NODE_ENV` = `production`

**Du musst die echte Railway-URL finden und `CORS_ORIGIN` aktualisieren!**

## 🎯 So findest du die URL:

### Schritt 1: Zurück zur Service-Seite

1. **Schaue oben nach den Tabs:**
   ```
   [Metrics] [Logs] [Deployments] [Variables] [Settings]
   ```
2. **Klicke auf "Settings"** Tab (nicht Variables!)

### Schritt 2: Domains finden

1. In den Settings siehst du verschiedene Sektionen
2. **Scrolle nach unten** oder suche nach **"Domains"**
3. Dort siehst du die URL:
   ```
   https://dein-service-name.up.railway.app
   ```
4. **Kopiere diese URL!**

### Alternative: Oben rechts auf der Service-Seite

1. **Klicke oben links auf "← Back"** oder auf den Service-Namen
2. Du kommst zurück zur Service-Übersicht
3. **Oben rechts** siehst du einen **"Open"** Button 🌐
4. Klicke darauf oder kopiere die URL

## 🔧 CORS_ORIGIN aktualisieren:

Sobald du die URL hast:

1. **Bleibe auf der Variables-Seite** (wo du jetzt bist)
2. **Finde `CORS_ORIGIN`** in der Liste
3. **Klicke darauf** (zum Bearbeiten)
4. **Ändere den Wert** von:
   ```
   https://dein-service.up.railway.app
   ```
   Zu deiner echten URL:
   ```
   https://DEINE-ECHTE-RAILWAY-URL.up.railway.app
   ```
5. **Klicke auf "Save"**
6. Railway startet automatisch ein neues Deployment

## 💡 Schnelltest:

**Die URL findest du:**
- **Settings Tab** → "Domains" Sektion
- **Oder oben rechts** auf der Service-Seite → "Open" Button

**Die URL sieht immer so aus:**
```
https://SERVICE-NAME.up.railway.app
```

---

**Gehe zu Settings → Domains und kopiere die URL!** 🎯
