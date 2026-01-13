# 🔧 500 Fehler beim Login beheben

## 🔍 Schritt 1: Logs prüfen

1. **Gehe zu Railway** → https://railway.app
2. **Klicke auf dein Projekt** (`independent-exploration`)
3. **Klicke auf den Service** (`browsergame`)
4. **Klicke oben auf "Logs"**

## 📋 Schritt 2: Suche nach diesen Fehlermeldungen

### Mögliche Fehler:

#### 1. **"relation 'users' does not exist"**
```
❌ Fehler: relation "users" does not exist
```
**Lösung:** Tabellen wurden nicht erstellt. Migrationen wurden nicht ausgeführt.

#### 2. **"connection refused"**
```
❌ Fehler: connect ECONNREFUSED
```
**Lösung:** Datenbankverbindung funktioniert nicht. `DATABASE_URL` ist falsch.

#### 3. **"JWT_SECRET nicht konfiguriert"**
```
❌ Fehler: JWT_SECRET nicht konfiguriert
```
**Lösung:** `JWT_SECRET` fehlt in den Environment Variables.

#### 4. **Keine Migration-Logs sichtbar**
Wenn du **NICHT** diese Zeilen siehst:
```
🔧 Prüfe Datenbank-Schema...
➕ Erstelle users Tabelle...
✅ Automatische Migrationen abgeschlossen
```
**Lösung:** Migrationen wurden nicht ausgeführt. Server wurde möglicherweise vor dem Deployment gestartet.

## 🛠️ Schritt 3: Lösung je nach Fehler

### Lösung A: Tabellen fehlen (Migrationen nicht ausgeführt)

**Option 1: Redeploy**
1. Gehe zu Railway → Service (`browsergame`)
2. Klicke auf **"Redeploy"** (oben rechts)
3. Warte auf das Deployment
4. Prüfe die Logs erneut

**Option 2: Manuell Migrationen ausführen (falls Terminal verfügbar)**
1. Öffne Railway Console/Terminal
2. Führe aus: `npm run db:migrate`

### Lösung B: DATABASE_URL ist falsch

1. Gehe zu Railway → Service (`browsergame`) → **"Variables"**
2. Prüfe `DATABASE_URL`:
   - Sollte mit `postgresql://` beginnen
   - Sollte von der PostgreSQL-Datenbank kopiert sein
3. Falls falsch: Kopiere `DATABASE_URL` von der PostgreSQL-Datenbank

### Lösung C: JWT_SECRET fehlt

1. Gehe zu Railway → Service (`browsergame`) → **"Variables"**
2. Prüfe ob `JWT_SECRET` existiert
3. Falls nicht: Füge hinzu mit Wert: `78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a`

## 📝 Schritt 4: Logs kopieren

**Bitte kopiere die letzten 50-100 Zeilen der Logs** und sende sie mir!

Besonders wichtig:
- Fehlermeldungen (rot markiert)
- Zeilen mit "❌" oder "error"
- Zeilen mit "Login-Fehler"
- Zeilen mit "🔧 Prüfe Datenbank-Schema..."

---

**Sende mir die Logs, dann kann ich dir genau sagen, was das Problem ist!** 🔍
