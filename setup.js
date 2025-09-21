#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('🤖 Discord Server-Creator Bot Setup');
    console.log('=====================================\n');

    // Erstelle logs Ordner
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
        console.log('✅ Logs-Ordner erstellt');
    }

    // Prüfe ob .env existiert
    if (fs.existsSync('.env')) {
        const overwrite = await question('⚠️  .env Datei existiert bereits. Überschreiben? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup abgebrochen.');
            rl.close();
            return;
        }
    }

    console.log('\n📝 Bot-Konfiguration:');
    
    const discordToken = await question('Discord Bot Token: ');
    const discordClientId = await question('Discord Client ID: ');
    
    console.log('\n🤖 KI-Provider wählen:');
    console.log('1. Ollama (lokal)');
    console.log('2. OpenRouter (cloud)');
    
    const aiChoice = await question('Wähle (1 oder 2): ');
    
    let aiConfig = '';
    if (aiChoice === '1') {
        const ollamaUrl = await question('Ollama Base URL (http://localhost:11434): ') || 'http://localhost:11434';
        const ollamaModel = await question('Ollama Model (gpt-oss:20b): ') || 'gpt-oss:20b';
        aiConfig = `AI_PROVIDER=ollama
OLLAMA_BASE_URL=${ollamaUrl}
OLLAMA_MODEL=${ollamaModel}`;
    } else {
        const openrouterKey = await question('OpenRouter API Key: ');
        const openrouterModel = await question('OpenRouter Model (microsoft/wizardlm-2-8x22b): ') || 'microsoft/wizardlm-2-8x22b';
        aiConfig = `AI_PROVIDER=openrouter
OPENROUTER_API_KEY=${openrouterKey}
OPENROUTER_MODEL=${openrouterModel}`;
    }

    console.log('\n🗄️  Datenbank-Konfiguration:');
    const mongoUri = await question('MongoDB URI (mongodb://localhost:27017/discord-server-bot): ') || 'mongodb://localhost:27017/discord-server-bot';
    const redisUrl = await question('Redis URL (redis://localhost:6379): ') || 'redis://localhost:6379';

    const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=${discordToken}
DISCORD_CLIENT_ID=${discordClientId}

# AI Configuration
${aiConfig}

# Database Configuration
MONGODB_URI=${mongoUri}
REDIS_URL=${redisUrl}

# Bot Configuration
BOT_PREFIX=/
MAX_CHANNELS_PER_REQUEST=20
MAX_ROLES_PER_REQUEST=10
RATE_LIMIT_DELAY=1000

# Environment
NODE_ENV=development`;

    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env Datei erstellt');

    console.log('\n🚀 Nächste Schritte:');
    console.log('1. npm install');
    console.log('2. Starte MongoDB und Redis (oder nutze Docker: docker-compose up -d mongodb redis)');
    
    if (aiChoice === '1') {
        console.log('3. Starte Ollama und lade das Modell: ollama pull gpt-oss:20b');
    }
    
    console.log('4. Registriere Commands: node deploy-commands.js');
    console.log('5. Starte Bot: npm start');
    
    console.log('\n📚 Weitere Hilfe findest du in der README.md');

    rl.close();
}

// Fehlerbehandlung
process.on('SIGINT', () => {
    console.log('\n\nSetup abgebrochen.');
    rl.close();
    process.exit(0);
});

setup().catch(console.error);