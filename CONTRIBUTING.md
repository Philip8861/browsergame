# Beitragsrichtlinien

Vielen Dank für dein Interesse am Projekt! Hier sind einige Richtlinien für Beiträge:

## Entwicklungsumgebung einrichten

1. Fork das Repository
2. Klone deinen Fork: `git clone https://github.com/dein-username/browsergame-strategiespiel.git`
3. Installiere Dependencies: `npm install`
4. Erstelle eine `.env` Datei basierend auf `env.example`
5. Setze die Datenbank auf: `npm run db:migrate`

## Code-Stil

- Verwende TypeScript für Backend-Code
- Folge den ESLint und Prettier Regeln
- Führe `npm run lint` und `npm run format` vor Commits aus
- Schreibe aussagekräftige Commit-Messages

## Tests

- Füge Tests für neue Features hinzu
- Stelle sicher, dass alle Tests bestehen: `npm test`
- Ziel: Mindestens 80% Code-Coverage

## Pull Requests

1. Erstelle einen Feature-Branch: `git checkout -b feature/mein-feature`
2. Committe deine Änderungen: `git commit -m 'Add: Beschreibung'`
3. Push zum Branch: `git push origin feature/mein-feature`
4. Öffne einen Pull Request auf GitHub

## Code-Review Prozess

- Alle Pull Requests werden von Maintainern überprüft
- Feedback wird konstruktiv gegeben
- Änderungen können vor dem Merge erforderlich sein

## Fragen?

Öffne ein Issue auf GitHub für Fragen oder Diskussionen.




