# 🎮 Spiel-Test Anleitung

## Server starten

### Option 1: Beide Server gleichzeitig
```bash
npm run dev
```

### Option 2: Einzeln starten
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

## Browser öffnen

Öffne: **http://localhost:3000**

## Test-Schritte

### 1. Registrierung testen
1. Öffne http://localhost:3000
2. Klicke auf "Registrierung" Tab
3. Fülle das Formular aus:
   - Benutzername: z.B. "testuser"
   - E-Mail: z.B. "test@example.com"
   - Passwort: Mindestens 6 Zeichen
4. Klicke "Registrieren"
5. Du solltest automatisch eingeloggt werden

### 2. Spiel-Ansicht prüfen
Nach erfolgreicher Registrierung solltest du sehen:
- ✅ Ressourcenanzeige oben (Holz, Lehm, Eisen, Getreide)
- ✅ Dorf-Name in der Sidebar
- ✅ Gebäude-Plätze im Hauptbereich (Phaser 3 Canvas)
- ✅ Gebäude-Liste in der Sidebar

### 3. Gebäude-Upgrade testen
1. Klicke auf ein Gebäude im Hauptbereich
2. Upgrade-Modal sollte sich öffnen
3. Klicke "Upgrade starten"
4. Timer sollte in der Gebäude-Liste erscheinen

### 4. Login testen
1. Klicke "Abmelden"
2. Klicke auf "Login" Tab
3. Logge dich mit deinen Daten ein
4. Du solltest wieder dein Dorf sehen

## Bekannte Probleme & Lösungen

### Backend antwortet nicht
- Prüfe ob Port 5000 frei ist
- Prüfe die Server-Logs im Terminal
- Stelle sicher, dass `.env` Datei existiert

### Frontend lädt nicht
- Prüfe ob Port 3000 frei ist
- Öffne Browser-Konsole (F12) für Fehlerdetails
- Stelle sicher, dass Vite läuft

### API-Fehler
- Prüfe ob Backend läuft: http://localhost:5000/health
- Prüfe Browser-Konsole (F12) → Network Tab
- Stelle sicher, dass CORS konfiguriert ist

## Mock-Datenbank

Die Mock-Datenbank speichert Daten in `data/mock-db.json`.
Du kannst diese Datei löschen um von vorne zu beginnen.

## Hilfe

- Browser-Konsole öffnen: F12
- Network-Tab prüfen für API-Calls
- Server-Logs im Terminal prüfen

Viel Erfolg beim Testen! 🎮




