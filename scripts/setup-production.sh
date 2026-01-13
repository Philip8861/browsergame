#!/bin/bash

# Production Setup Script für Browsergame
# Führt alle notwendigen Schritte für Production-Deployment aus

set -e  # Exit on error

echo "🚀 Browsergame Production Setup"
echo "================================"
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "⚠️  .env Datei nicht gefunden!"
    echo "📝 Erstelle .env aus .env.example..."
    cp .env.example .env
    echo "✅ .env erstellt. Bitte bearbeite die Datei und setze deine Werte!"
    exit 1
fi

# Lade .env Variablen
source .env

echo "📦 Installiere Dependencies..."
npm install

echo "🔨 Erstelle Production Build..."
npm run build

echo "🗄️  Prüfe Datenbank-Verbindung..."
if [ "$DB_TYPE" = "postgresql" ]; then
    echo "   Verbinde zu PostgreSQL..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Datenbank-Verbindung erfolgreich!"
    else
        echo "❌ Datenbank-Verbindung fehlgeschlagen!"
        echo "   Bitte prüfe deine DB_* Einstellungen in .env"
        exit 1
    fi
else
    echo "⚠️  DB_TYPE ist nicht PostgreSQL. Überspringe Datenbank-Prüfung."
fi

echo "🔄 Führe Datenbank-Migrationen aus..."
npm run db:migrate

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Prüfe .env Datei und setze alle Production-Werte"
echo "   2. Starte Server mit: npm start"
echo "   3. Oder verwende Docker: docker-compose up -d"
echo ""

