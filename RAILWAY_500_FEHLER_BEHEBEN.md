# 🔧 500 Fehler beheben - Schritt für Schritt

## ⚠️ Problem:

Sowohl **Registrierung** als auch **Login** geben **500 Fehler** zurück.

Das bedeutet: Die Datenbank-Tabellen existieren wahrscheinlich noch nicht!

---

## 🎯 Lösung: Datenbank-Migrationen ausführen

### Schritt 1: Railway Console öffnen

1. **Gehe zu Railway** → Service (`browsergame`)
2. **Klicke auf "Settings"** (oben)
3. **Scrolle ganz nach unten** zu **"Service"** oder **"Console"**
4. **Klicke auf "Open Console"** oder **"Open Terminal"**
5. **Ein Terminal öffnet sich**

---

### Schritt 2: Migrationen ausführen

Im Terminal siehst du eine Eingabeaufforderung. Tippe ein:

```bash
npm run db:migrate
```

**Drücke Enter** und warte auf die Ausgabe.

---

### Schritt 3: Prüfe die Ausgabe

Du solltest sehen:

```
Migrating up...
Migration 001_users...
Migration 002_villages...
Migration 003_buildings...
Migration 004_resources...
✅ Migration erfolgreich
```

**ODER** du siehst Fehler wie:
- `relation "users" already exists` → Tabellen existieren bereits (gut!)
- `relation "users" does not exist` → Migrationen müssen ausgeführt werden
- `Connection error` → Datenbank-Verbindungsproblem

---

### Schritt 4: Nochmal testen

Nach den Migrationen:

1. **Aktualisiere die Seite** im Browser (Strg+F5)
2. **Versuche erneut zu registrieren**
3. **Prüfe ob es jetzt funktioniert**

---

## 🐛 Wenn die Migrationen fehlschlagen:

### Problem 1: "npm: command not found"

**Lösung:**
- Stelle sicher, dass du im richtigen Verzeichnis bist
- Versuche: `cd /app && npm run db:migrate`

---

### Problem 2: "Connection error" oder "ECONNREFUSED"

**Lösung:**
1. Prüfe `DATABASE_URL` in Railway Variables:
   - Service → Settings → Variables
   - Stelle sicher, dass `DATABASE_URL` korrekt gesetzt ist
2. Prüfe ob PostgreSQL läuft:
   - Gehe zum Projekt-Dashboard
   - Prüfe ob PostgreSQL einen grünen Punkt hat
3. Prüfe `DB_TYPE`:
   - Sollte `postgresql` sein (nicht `sqlite` oder `mock`)

---

### Problem 3: "relation already exists"

**Lösung:**
- Das ist OK! Die Tabellen existieren bereits
- Das Problem liegt woanders
- Prüfe die Railway Logs (siehe unten)

---

## 🔍 Schritt 5: Railway Logs prüfen

Falls die Migrationen erfolgreich waren, aber es immer noch nicht funktioniert:

1. **Gehe zu Railway** → Service (`browsergame`)
2. **Klicke auf "Logs"** (oben)
3. **Scrolle nach unten** zu den neuesten Logs
4. **Versuche erneut zu registrieren** (im Browser)
5. **Schaue in die Logs** - du solltest neue Fehlermeldungen sehen
6. **Kopiere die Fehlermeldung** und schicke sie mir!

---

## 📋 Checkliste:

- [ ] Railway Console geöffnet
- [ ] `npm run db:migrate` ausgeführt
- [ ] Migrationen erfolgreich (oder "already exists")
- [ ] Seite im Browser aktualisiert
- [ ] Erneut registrieren versucht
- [ ] Falls Fehler: Railway Logs geprüft

---

## 💡 Wichtige Hinweise:

- **Migrationen müssen nur EINMAL** ausgeführt werden
- Nach den Migrationen sollten die Tabellen existieren
- Falls Fehler weiterhin bestehen, prüfe die Logs

---

**Sag mir Bescheid:**
1. Wurden die Migrationen erfolgreich ausgeführt?
2. Was steht in den Railway Logs? (Kopiere die Fehlermeldung)

Dann kann ich dir genau helfen! 🎯
