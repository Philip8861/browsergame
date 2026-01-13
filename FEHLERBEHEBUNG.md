# 🔧 Fehlerbehebung: ERR_CONNECTION_REFUSED

## Problem gelöst! ✅

Der Server wurde neu gestartet. Die Website sollte jetzt erreichbar sein.

## Was wurde gemacht:

1. ✅ Alle alten Node-Prozesse beendet
2. ✅ Server neu gestartet (`npm run dev`)
3. ✅ Frontend läuft auf Port 3000
4. ⏳ Backend startet noch (kann 10-20 Sekunden dauern)

## Nächste Schritte:

### 1. Browser aktualisieren
- Drücke **F5** oder **Strg+R** um die Seite neu zu laden
- Oder öffne: http://localhost:3000

### 2. Falls es immer noch nicht funktioniert:

**Prüfe ob Server läuft:**
```powershell
# Prüfe Port 3000
netstat -ano | findstr ":3000"

# Prüfe Port 5000  
netstat -ano | findstr ":5000"
```

**Server manuell starten:**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

**Oder beide zusammen:**
```bash
npm run dev
```

### 3. Häufige Probleme:

**Port bereits belegt:**
- Ändere Port in `vite.config.ts` (z.B. 3001)
- Ändere `CORS_ORIGIN` in `.env` entsprechend

**Firewall blockiert:**
- Windows Firewall kann Ports blockieren
- Prüfe Firewall-Einstellungen

**TypeScript-Fehler:**
- Prüfe Server-Logs im Terminal
- Eventuell müssen TypeScript-Fehler behoben werden

## Server-Status prüfen:

**Frontend testen:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

**Backend testen:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

## Hilfe:

- Browser-Konsole öffnen: **F12**
- Network-Tab prüfen für API-Calls
- Server-Logs im Terminal prüfen

---

**Aktueller Status:** Frontend läuft ✅ | Backend startet ⏳




