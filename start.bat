@echo off
echo 🤖 Discord Server-Creator Bot Starter
echo ====================================

:: Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

:: Prüfe ob .env existiert
if not exist .env (
    echo ⚠️  .env Datei nicht gefunden!
    echo Führe zuerst 'node setup.js' aus.
    pause
    exit /b 1
)

:: Prüfe ob node_modules existiert
if not exist node_modules (
    echo 📦 Installiere Dependencies...
    npm install
)

:: Erstelle logs Ordner falls nicht vorhanden
if not exist logs mkdir logs

echo 🚀 Starte Discord Bot...
npm start

pause