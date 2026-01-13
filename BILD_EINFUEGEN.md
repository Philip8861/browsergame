# 🖼️ Bild als Login-Hintergrund einfügen

## ✅ Was bereits gemacht wurde:

1. ✅ Assets-Verzeichnis erstellt: `src/client/assets/`
2. ✅ CSS angepasst für Hintergrundbild
3. ✅ Fallback-Gradient erstellt (tropischer Strand-Stil)

## 📋 Nächste Schritte:

### Option 1: Bild direkt hinzufügen

1. **Bild speichern:**
   - Benenne das Bild: `login-background.png`
   - Speichere es hier: `src/client/assets/login-background.png`

2. **Fertig!** 
   - Das Bild wird automatisch als Hintergrund verwendet
   - Seite neu laden (F5)

### Option 2: Bild von URL verwenden

Falls du das Bild online hast, kannst du die CSS-Datei anpassen:

**Datei:** `src/client/styles/main.css`

**Suche nach:**
```css
background-image: url('/assets/login-background.png');
```

**Ändere zu:**
```css
background-image: url('https://deine-url-zum-bild.jpg');
```

## 🎨 Aktueller Fallback

Bis das Bild hinzugefügt wird, zeigt die Seite einen CSS-Gradient im tropischen Strand-Stil:
- Blauer Himmel oben
- Türkises Meer
- Goldener Strand
- Grüner Dschungel

## 📝 Bild-Anforderungen

- **Format:** JPG, PNG oder WebP
- **Auflösung:** Mindestens 1920x1080 (Full HD)
- **Dateigröße:** < 2MB (für schnelles Laden)
- **Stil:** Tropischer Strand (passt zum Spiel-Thema)

## 🔍 Prüfen ob es funktioniert

1. Bild in `src/client/assets/login-background.png` speichern
2. Server neu starten (falls nötig)
3. Browser öffnen: http://localhost:3000
4. Login-Modal sollte jetzt das Bild als Hintergrund zeigen

---

**Tipp:** Falls das Bild nicht angezeigt wird, prüfe die Browser-Konsole (F12) für Fehler.

