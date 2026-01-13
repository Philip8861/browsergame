# 🔍 Railway Logs prüfen - 500 Fehler beim Registrieren

## ⚠️ Problem:

Build erfolgreich, aber Registrierung gibt **500 Fehler** zurück.

Das bedeutet: Der Server läuft, aber es gibt einen Fehler auf der Backend-Seite.

---

## 🎯 Schritt 1: Railway Logs prüfen

1. **Gehe zu Railway** → Service (`browsergame`)
2. **Klicke auf "Logs"** (oben in der Navigation)
3. **Scrolle nach unten** zu den neuesten Logs
4. **Suche nach Fehlermeldungen:**
   - `❌` oder `ERROR`
   - `Registrierungsfehler`
   - `Database error`
   - `Connection error`

**Kopiere die Fehlermeldung** und schicke sie mir!

---

## 🎯 Schritt 2: Mögliche Ursachen

### Ursache 1: Datenbank-Migrationen nicht ausgeführt

**Symptom:** Fehler wie "relation 'users' does not exist" oder "table 'users' does not exist"

**Lösung:** Migrationen ausführen (siehe Schritt 3)

---

### Ursache 2: Datenbank-Verbindungsproblem

**Symptom:** Fehler wie "Connection refused" oder "ECONNREFUSED"

**Lösung:**
1. Prüfe `DATABASE_URL` in Railway Variables
2. Stelle sicher, dass PostgreSQL läuft (grüner Punkt)
3. Prüfe ob `DB_TYPE=postgresql` gesetzt ist

---

### Ursache 3: Fehlende Spalten in der Datenbank

**Symptom:** Fehler wie "column 'xxx' does not exist"

**Lösung:** Migrationen ausführen (siehe Schritt 3)

---

## 🎯 Schritt 3: Datenbank-Migrationen ausführen

Die Datenbank-Tabellen müssen erstellt werden!

1. **Auf der Service-Seite** (`browsergame`)
2. **Klicke auf "Settings"** (oben)
3. **Scrolle zu "Service"** oder suche nach **"Console"** oder **"Terminal"**
4. **Klicke auf "Open Console"** oder **"Open Terminal"**
5. **Ein Terminal öffnet sich**
6. **Tippe diesen Befehl ein:**
   ```bash
   npm run db:migrate
   ```
7. **Drücke Enter**
8. **Warte auf die Ausgabe:**
   ```
   Migrating up...
   ✅ Migration erfolgreich
   ```

✅ **Migrationen ausgeführt!**

---

## 🎯 Schritt 4: Nochmal testen

Nach den Migrationen:

1. **Aktualisiere die Seite** im Browser
2. **Versuche erneut zu registrieren**
3. **Prüfe ob es jetzt funktioniert**

---

## 🐛 Wenn es immer noch nicht funktioniert:

**Beschreibe mir:**
1. Was steht in den Railway Logs? (Kopiere die Fehlermeldung)
2. Wurden die Migrationen erfolgreich ausgeführt?
3. Welche Fehlermeldung siehst du im Browser? (F12 → Console)

Dann kann ich dir genau helfen! 🎯

---

**Sag mir Bescheid, was in den Logs steht!** 🔍
