# 📝 Environment Variables in Railway einfügen - Schritt für Schritt

## 🔐 Dein generierter JWT_SECRET:

```
78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a
```

**Kopiere diesen Wert!** Du brauchst ihn gleich.

---

## 🎯 Schritt-für-Schritt: Variablen in Railway einfügen

### Schritt 1: Service öffnen

1. **Gehe zu Railway Dashboard:** https://railway.app
2. **Klicke auf dein Projekt:** `independent-exploration`
3. **Du siehst jetzt zwei Karten:**
   - 📦 **Service** (z.B. `browsergame-production`)
   - 🗄️ **PostgreSQL** (Datenbank)
4. **Klicke auf den SERVICE** (nicht PostgreSQL!)

---

### Schritt 2: Settings öffnen

Nach dem Klick auf den Service siehst du oben eine Navigation:

```
[Deployments] [Metrics] [Logs] [Settings] [Networking]
```

**Klicke auf "Settings"** (4. Tab von links)

---

### Schritt 3: Variables-Bereich finden

Auf der Settings-Seite scrollst du nach unten. Du siehst verschiedene Bereiche:

```
┌─────────────────────────────────────┐
│  Settings                           │
│                                     │
│  General                            │
│  Variables                          │ ← HIER!
│  Build & Deploy                     │
│  Networking                         │
│  ...                                │
└─────────────────────────────────────┘
```

**Scrolle zu "Variables"** (oder "Environment Variables")

---

### Schritt 4: Erste Variable hinzufügen (NODE_ENV)

1. **Du siehst eine Liste** (wahrscheinlich noch leer oder mit wenigen Einträgen)
2. **Oben rechts** siehst du einen Button:
   ```
   [+ New Variable]  oder  [+ Add Variable]
   ```
3. **Klicke darauf!**

4. **Ein Dialog/Popup öffnet sich:**
   ```
   ┌─────────────────────────────┐
   │  New Variable               │
   │                             │
   │  Name:  [___________]       │
   │  Value: [___________]       │
   │                             │
   │  [Cancel]  [Add]            │
   └─────────────────────────────┘
   ```

5. **In "Name" tippe:** `NODE_ENV`
6. **In "Value" tippe:** `production`
7. **Klicke auf "Add"** oder **"Save"**

✅ **Erste Variable ist gesetzt!**

---

### Schritt 5: Zweite Variable (DB_TYPE)

1. **Klicke erneut auf "+ New Variable"**
2. **Name:** `DB_TYPE`
3. **Value:** `postgresql`
4. **Klicke auf "Add"**

✅ **Zweite Variable ist gesetzt!**

---

### Schritt 6: Dritte Variable (PORT)

1. **Klicke erneut auf "+ New Variable"**
2. **Name:** `PORT`
3. **Value:** `3000`
4. **Klicke auf "Add"**

✅ **Dritte Variable ist gesetzt!**

---

### Schritt 7: Vierte Variable (JWT_SECRET)

1. **Klicke erneut auf "+ New Variable"**
2. **Name:** `JWT_SECRET`
3. **Value:** Kopiere diesen Wert:
   ```
   78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a
   ```
4. **Klicke auf "Add"**

✅ **Vierte Variable ist gesetzt!**

---

### Schritt 8: Fünfte Variable (CORS_ORIGIN) - erstmal leer

1. **Klicke erneut auf "+ New Variable"**
2. **Name:** `CORS_ORIGIN`
3. **Value:** Lass es **LEER** (nichts eintippen)
4. **Klicke auf "Add"**

✅ **Fünfte Variable ist gesetzt!**

---

### Schritt 9: Sechste Variable (DATABASE_URL) - von PostgreSQL kopieren

**WICHTIG:** Diese Variable musst du von der PostgreSQL-Datenbank kopieren!

#### 9.1: Zurück zum Projekt-Dashboard

1. **Oben links** siehst du einen Pfeil **"←"** oder **"Back"**
2. **Klicke darauf**, um zurück zum Projekt-Dashboard zu gehen

#### 9.2: PostgreSQL öffnen

1. **Du siehst wieder die zwei Karten**
2. **Klicke auf PostgreSQL** (die Datenbank-Karte, nicht der Service!)

#### 9.3: PostgreSQL Settings öffnen

1. **Klicke auf "Settings"** (oben)
2. **Scrolle zu "Variables"**

#### 9.4: DATABASE_URL finden und kopieren

1. **Du siehst eine Liste mit Variablen**
2. **Finde `DATABASE_URL`** in der Liste
3. **Der Wert ist versteckt** (zeigt nur Punkte: `••••••••`)
4. **Klicke auf das 👁️ Auge-Symbol** neben `DATABASE_URL`
5. **Der Wert wird jetzt sichtbar:**
   ```
   postgresql://postgres:PASSWORD@HOST:5432/railway
   ```
6. **Markiere den kompletten Wert** (von `postgresql://` bis zum Ende)
7. **Kopiere ihn** (Strg+C oder Rechtsklick → Copy)

#### 9.5: Zurück zum Service

1. **Gehe zurück zum Projekt-Dashboard** (Pfeil oben links)
2. **Klicke auf den SERVICE** (nicht PostgreSQL!)
3. **Klicke auf "Settings"**
4. **Scrolle zu "Variables"**

#### 9.6: DATABASE_URL hinzufügen

1. **Klicke auf "+ New Variable"**
2. **Name:** `DATABASE_URL`
3. **Value:** **Füge den kopierten Wert ein** (Strg+V)
4. **Klicke auf "Add"**

✅ **Sechste Variable ist gesetzt!**

---

### Schritt 10: Prüfen

Nach dem Hinzufügen aller Variablen solltest du in der Liste sehen:

```
Variables:
✅ NODE_ENV = production
✅ DB_TYPE = postgresql
✅ PORT = 3000
✅ JWT_SECRET = 78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a
✅ CORS_ORIGIN = (leer)
✅ DATABASE_URL = postgresql://...
```

**Prüfe:** Sind alle 6 Variablen vorhanden?

---

### Schritt 11: Service neu deployen

Nach dem Setzen aller Variablen:

1. **Klicke auf "Deployments"** (oben in der Navigation)
2. **Du siehst eine Liste von Deployments**
3. **Oben rechts** oder bei dem neuesten Deployment:
   - **Klicke auf "Redeploy"** Button
   - Oder **drei Punkte "..." → "Redeploy"**
4. **Warte 2-3 Minuten** auf das Deployment

**Status ändert sich:**
- 🟡 Building... → Warte
- 🟢 Running → Fertig!

---

## 🎨 Visuelle Hilfe: Wie sieht das aus?

### Variables-Liste (nach dem Hinzufügen):

```
┌─────────────────────────────────────────────────────┐
│  Variables                                          │
│                                                     │
│  [+ New Variable]                                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ NODE_ENV                                    │   │
│  │ production                          [✏️] [🗑️]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ DB_TYPE                                     │   │
│  │ postgresql                          [✏️] [🗑️]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ PORT                                         │   │
│  │ 3000                                 [✏️] [🗑️]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ... (weitere Variablen)                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Häufige Probleme:

### Problem 1: "+ New Variable" Button nicht sichtbar

**Lösung:**
- Stelle sicher, dass du auf **Service → Settings → Variables** bist
- Nicht auf PostgreSQL!
- Scrolle nach unten, der Button ist oben rechts

### Problem 2: DATABASE_URL nicht gefunden

**Lösung:**
- Stelle sicher, dass du auf **PostgreSQL → Settings → Variables** gehst
- Nicht auf Service → Variables!
- Die `DATABASE_URL` ist nur bei der Datenbank sichtbar

### Problem 3: Variable wird nicht gespeichert

**Lösung:**
- Stelle sicher, dass du auf "Add" oder "Save" klickst
- Prüfe, ob der Name korrekt ist (Großbuchstaben beachten!)
- Prüfe, ob der Wert nicht leer ist (außer bei CORS_ORIGIN)

---

## ✅ Checkliste:

- [ ] `NODE_ENV` = `production` hinzugefügt
- [ ] `DB_TYPE` = `postgresql` hinzugefügt
- [ ] `PORT` = `3000` hinzugefügt
- [ ] `JWT_SECRET` = `78fe3544b89c5a8b4c55402fd20706bd69793f4657f7c1866972f40328ecc11a` hinzugefügt
- [ ] `CORS_ORIGIN` = leer hinzugefügt
- [ ] `DATABASE_URL` = von PostgreSQL kopiert und hinzugefügt
- [ ] Service neu deployed
- [ ] Status ist grün (🟢 Running)

---

## 🎯 Nächste Schritte:

Nach erfolgreichem Deployment:

1. ✅ Alle Variablen gesetzt
2. ✅ Service läuft (grüner Punkt)
3. ⏭️ URL finden (Networking → Domain)
4. ⏭️ `CORS_ORIGIN` auf die URL setzen
5. ⏭️ Service neu deployen
6. ⏭️ Datenbank-Migrationen ausführen
7. ⏭️ Spiel testen!

---

**Sag mir Bescheid, wenn du alle Variablen eingefügt hast!** 🚀
