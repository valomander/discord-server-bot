# 🚀 Quick Start Guide

## Minimale Installation (ohne Datenbank)

### 1. Dependencies installieren
```bash
npm install
```

### 2. Discord Bot erstellen
1. Gehe zu https://discord.com/developers/applications
2. Klicke "New Application" und gib einen Namen ein
3. Gehe zu "Bot" im Seitenmenü
4. Klicke "Add Bot" 
5. Kopiere den **Token**
6. Gehe zu "OAuth2" > "General"
7. Kopiere die **Application ID** (Client ID)

### 3. Bot-Berechtigungen einstellen
1. Gehe zu "OAuth2" > "URL Generator"
2. Wähle "bot" und "applications.commands"
3. Wähle folgende Bot-Berechtigungen:
   - Manage Channels
   - Manage Roles
   - Send Messages
   - Use Slash Commands
   - View Channels
4. Kopiere die generierte URL und lade den Bot auf deinen Server ein

### 4. .env Datei erstellen
Erstelle eine `.env` Datei im Projektordner:

```env
# Discord Bot Configuration
DISCORD_TOKEN=DEIN_BOT_TOKEN_HIER
DISCORD_CLIENT_ID=DEINE_CLIENT_ID_HIER

# AI Configuration (Ollama lokal)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Environment
NODE_ENV=development
```

### 5. Ollama installieren (für lokale KI)
1. Lade Ollama herunter: https://ollama.ai/
2. Installiere es
3. Öffne Terminal/CMD und führe aus:
   ```bash
   ollama pull llama2
   ```
4. Starte Ollama:
   ```bash
   ollama serve
   ```

### 6. Commands registrieren
```bash
node deploy-commands.js
```

### 7. Bot starten
```bash
npm start
```

## ✅ Test

1. Gehe auf deinen Discord-Server
2. Tippe `/create-server`
3. Folge den Anweisungen
4. Der Bot erstellt automatisch deinen Server!

## 🔧 Problemlösung

### "Commands nicht gefunden"
- Führe `node deploy-commands.js` erneut aus
- Warte 1-2 Minuten und versuche erneut

### "Bot reagiert nicht"
- Prüfe ob Bot online ist (grüner Punkt)
- Prüfe Bot-Berechtigungen auf dem Server
- Prüfe `.env` Datei und Token

### "KI-Fehler"
- Prüfe ob Ollama läuft (`ollama serve`)
- Prüfe ob das Modell heruntergeladen ist (`ollama list`)

### "Keine Berechtigung"
- Der Benutzer braucht "Server verwalten" Berechtigung
- Der Bot braucht "Kanäle verwalten" und "Rollen verwalten"

## 🎯 Verwendung

### Verfügbare Commands:
- `/create-server` - Hauptfunktion: Server erstellen
- `/help` - Hilfe anzeigen
- `/server-status` - Status der letzten Erstellung

### Templates:
- 🎮 Gaming-Community
- 💼 Projektteam  
- 🎓 Lern-/Studiengruppe
- 🌐 Allgemeine Community
- 🎨 Kreativ-Community
- ⚙️ Benutzerdefiniert

## 🆘 Erweiterte Installation

Für volle Funktionalität mit Datenbank siehe `README.md`