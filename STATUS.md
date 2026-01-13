# ✅ Setup-Status

## Was wurde automatisch erledigt:

1. ✅ **Dependencies installiert** - Alle npm-Pakete wurden installiert
2. ✅ **.env Datei erstellt** - Konfiguration wurde angelegt
3. ✅ **Mock-Datenbank aktiviert** - DB_TYPE=mock gesetzt (funktioniert ohne PostgreSQL)
4. ✅ **Server gestartet** - Backend und Frontend laufen

## Aktueller Status:

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Datenbank**: Mock-Modus (Daten werden in `data/mock-db.json` gespeichert)

## Nächste Schritte:

1. **Browser öffnen**: http://localhost:3000
2. **Registrierung testen**: Erstelle einen neuen Account
3. **Spiel testen**: Nach Login siehst du dein Dorf

## Mock-Datenbank:

Die Mock-Datenbank speichert alle Daten in `data/mock-db.json`. 
Du kannst diese Datei löschen um von vorne zu beginnen.

## Für Produktion:

Um PostgreSQL zu verwenden:
1. PostgreSQL installieren
2. `.env` ändern: `DB_TYPE=postgresql` (oder entfernen)
3. Datenbank erstellen und Schema einrichten

## Server neu starten:

```bash
npm run dev
```

## Server stoppen:

```bash
# Windows PowerShell:
taskkill /F /IM node.exe
```




