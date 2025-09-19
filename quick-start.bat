@echo off
echo 🚀 Discord Bot Quick Start (ohne Redis/MongoDB)
echo ==============================================

:: Prüfe ob .env existiert
if not exist .env (
    echo ⚠️  Erstelle minimale .env Datei...
    (
        echo DISCORD_TOKEN=DEIN_BOT_TOKEN_HIER
        echo DISCORD_CLIENT_ID=DEINE_CLIENT_ID_HIER
        echo AI_PROVIDER=ollama
        echo OLLAMA_BASE_URL=http://localhost:11434
        echo OLLAMA_MODEL=llama2
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env Datei erstellt - BITTE DISCORD_TOKEN und DISCORD_CLIENT_ID ausfüllen!
    pause
    exit /b 1
)

:: Installiere Dependencies falls nötig
if not exist node_modules (
    echo 📦 Installiere Dependencies...
    npm install
)

:: Erstelle logs Ordner
if not exist logs mkdir logs

echo 📝 Registriere Discord Commands...
node deploy-commands.js

echo.
echo 🚀 Starte Bot...
echo ⚠️  Bot läuft im vereinfachten Modus ohne Datenbank
npm start

pause