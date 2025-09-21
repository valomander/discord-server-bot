#!/bin/bash

echo "🤖 Discord Server-Creator Bot Starter"
echo "===================================="

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    echo "Bitte installiere Node.js von https://nodejs.org/"
    exit 1
fi

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "⚠️  .env Datei nicht gefunden!"
    echo "Führe zuerst 'node setup.js' aus."
    exit 1
fi

# Prüfe ob node_modules existiert
if [ ! -d node_modules ]; then
    echo "📦 Installiere Dependencies..."
    npm install
fi

# Erstelle logs Ordner falls nicht vorhanden
mkdir -p logs

echo "🚀 Starte Discord Bot..."
npm start