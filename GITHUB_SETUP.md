# 🚀 GitHub Setup - Nächste Schritte

Ich habe bereits für dich vorbereitet:
- ✅ Git initialisiert
- ✅ Alle Dateien hinzugefügt
- ✅ Ersten Commit erstellt

## 📝 Was du jetzt tun musst:

### Schritt 1: GitHub Repository erstellen

1. Gehe zu: **[github.com/new](https://github.com/new)**
2. Fülle aus:
   - **Repository name:** z.B. `browsergame`
   - **Visibility:** Wähle **Public**
   - **Lass alle Checkboxen LEER** (kein README, kein .gitignore)
3. Klicke auf **"Create repository"** (grüner Button)
4. **WICHTIG:** Kopiere die URL die GitHub dir zeigt!
   - Sie sieht aus wie: `https://github.com/DEIN-USERNAME/browsergame.git`

### Schritt 2: Code zu GitHub pushen

**Option A: Ich führe den Befehl für dich aus**

Sag mir einfach die GitHub-URL und ich führe den Push-Befehl aus!

**Option B: Du führst es selbst aus**

Öffne PowerShell in deinem Projekt-Ordner und führe aus:

```bash
# ERSETZE die URL mit deiner GitHub-URL!
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO-NAME.git
git branch -M main
git push -u origin main
```

**Bei der Authentifizierung:**
- GitHub fragt nach Username und Password
- Username: Dein GitHub-Username
- Password: Du musst ein **Personal Access Token** verwenden (nicht dein GitHub-Passwort!)
- Token erstellen: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic)
- Scopes: Wähle `repo` (voller Zugriff auf Repositories)

### Schritt 3: Prüfen

Gehe zu deinem Repository auf GitHub und prüfe, ob alle Dateien dort sind!

---

**Sag mir einfach deine GitHub-URL und ich helfe dir beim Push!** 🚀
