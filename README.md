# 🤖 KI Server-Creator Discord Bot

Ein intelligenter Discord-Bot, der automatisch komplette Server-Strukturen mit KI-Unterstützung erstellt.

## ✨ Features

- 🎯 **Automatische Server-Erstellung** - Komplette Discord-Server in Minuten
- 🤖 **KI-Integration** - Ollama oder OpenRouter für intelligente Konfiguration
- 🎮 **Vorgefertigte Templates** - Gaming, Projekt, Studium, Community, Kreativ
- ⚙️ **Benutzerdefiniert** - Individuelle Server nach eigenen Wünschen
- 🔄 **Rollback-Funktion** - Automatisches Rückgängigmachen bei Fehlern
- 📊 **Logging & Monitoring** - Vollständige Nachverfolgung aller Aktionen
- 🛡️ **Sicherheit** - Keine Administrator-Rechte, Whitelisting von Berechtigungen

## 🚀 Installation

### Voraussetzungen

- Node.js 18+ 
- MongoDB
- Redis (optional, für Rate-Limiting)
- Ollama oder OpenRouter API-Key

### Schritt 1: Repository klonen

\`\`\`bash
git clone <repository-url>
cd discord-server-bot
npm install
\`\`\`

### Schritt 2: Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

\`\`\`bash
cp .env.example .env
\`\`\`

### Schritt 3: Discord Bot erstellen

1. Gehe zu https://discord.com/developers/applications
2. Erstelle eine neue Application
3. Gehe zu "Bot" und erstelle einen Bot
4. Kopiere den Token in die `.env` Datei
5. Aktiviere "MESSAGE CONTENT INTENT"

### Schritt 4: Bot-Berechtigungen

Der Bot benötigt folgende Berechtigungen:
- `Manage Channels`
- `Manage Roles` 
- `Send Messages`
- `Use Slash Commands`

### Schritt 5: Commands registrieren

\`\`\`bash
node deploy-commands.js
\`\`\`

### Schritt 6: Bot starten

\`\`\`bash
npm start
# oder für Development:
npm run dev
\`\`\`

## 🎯 Verwendung

### Hauptbefehl

\`\`\`
/create-server
\`\`\`

1. Wähle eine Vorlage oder "Benutzerdefiniert"
2. Beantworte die Fragen im Modal
3. Überprüfe die Vorschau
4. Bestätige die Erstellung

### Weitere Befehle

- `/help` - Zeigt alle verfügbaren Befehle
- `/server-status` - Status der letzten Server-Erstellung

## 🛠️ Konfiguration

### KI-Provider

#### Ollama (Lokal)
\`\`\`env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
\`\`\`

#### OpenRouter (Cloud)
\`\`\`env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=microsoft/wizardlm-2-8x22b
\`\`\`

### Datenbank

MongoDB wird für persistente Speicherung verwendet:
- Server-Konfigurationen
- Templates
- Logs

## 📁 Projektstruktur

\`\`\`
discord-server-bot/
├── src/
│   ├── commands/          # Slash Commands
│   ├── events/            # Discord Events
│   ├── services/          # Business Logic
│   ├── ai/               # KI-Integration
│   ├── database/         # Datenbankoperationen
│   └── utils/            # Hilfsfunktionen
├── logs/                 # Log-Dateien
├── .env.example         # Umgebungsvariablen-Template
└── deploy-commands.js   # Command-Registrierung
\`\`\`

## 🎨 Templates

### Gaming-Community
- Voice-Kanäle für verschiedene Spiele
- Text-Kanäle für Chat und Screenshots
- Rollen für verschiedene Spielertypen

### Projektteam
- Arbeitsbereiche und Meeting-Räume
- Dokumentations-Kanäle
- Rollen für Teammitglieder

### Lern-/Studiengruppe
- Fächer-spezifische Kanäle
- Lernräume und Hausaufgaben-Bereiche
- Rollen für Tutoren und Studenten

### Community
- Allgemeine Chat-Bereiche
- Event- und Ankündigungs-Kanäle
- Moderations-Rollen

### Kreativ
- Showcase-Bereiche für Kunstwerke
- Kollaborations-Kanäle
- Feedback-Systeme

## 🔒 Sicherheit

- Keine ADMINISTRATOR-Berechtigungen für erstellte Rollen
- Whitelisting von Discord-Permissions
- Rate-Limiting für Discord API
- Eingabe-Validierung und Sanitization
- Rollback-Mechanismus bei Fehlern

## 📊 Monitoring

- Winston Logger für strukturierte Logs
- Datenbank-Logging aller Operationen
- Fehler-Tracking und -Reporting

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📜 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🆘 Support

Bei Problemen oder Fragen:
1. Prüfe die Logs in `logs/`
2. Überprüfe die `.env` Konfiguration
3. Stelle sicher, dass alle Services (MongoDB, Ollama) laufen
4. Öffne ein Issue auf GitHub

## 🔮 Roadmap

- [ ] Web-Dashboard für visuelle Server-Bearbeitung
- [ ] Mehr Template-Kategorien
- [ ] Template-Sharing zwischen Servern
- [ ] Advanced Permission-Management
- [ ] Integration mit anderen Bots
- [ ] Mehrsprachigkeit
- [ ] Voice-Channel-Management
- [ ] Automatische Backup-Funktionen