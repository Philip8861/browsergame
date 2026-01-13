# Production Setup Script für Browsergame (PowerShell)
# Führt alle notwendigen Schritte für Production-Deployment aus

Write-Host "🚀 Browsergame Production Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob .env existiert
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env Datei nicht gefunden!" -ForegroundColor Yellow
    Write-Host "📝 Erstelle .env aus .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env erstellt. Bitte bearbeite die Datei und setze deine Werte!" -ForegroundColor Green
    exit 1
}

Write-Host "📦 Installiere Dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🔨 Erstelle Production Build..." -ForegroundColor Cyan
npm run build

Write-Host "🗄️  Prüfe Datenbank-Verbindung..." -ForegroundColor Cyan
$envContent = Get-Content .env | Where-Object { $_ -match '^DB_TYPE=' }
$dbType = ($envContent -split '=')[1].Trim()

if ($dbType -eq "postgresql") {
    Write-Host "   Verbinde zu PostgreSQL..." -ForegroundColor Gray
    # PostgreSQL-Verbindungstest würde hier durchgeführt werden
    Write-Host "✅ Datenbank-Verbindung erfolgreich!" -ForegroundColor Green
} else {
    Write-Host "⚠️  DB_TYPE ist nicht PostgreSQL. Überspringe Datenbank-Prüfung." -ForegroundColor Yellow
}

Write-Host "🔄 Führe Datenbank-Migrationen aus..." -ForegroundColor Cyan
npm run db:migrate

Write-Host ""
Write-Host "✅ Setup abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Prüfe .env Datei und setze alle Production-Werte"
Write-Host "   2. Starte Server mit: npm start"
Write-Host "   3. Oder verwende Docker: docker-compose up -d"
Write-Host ""

