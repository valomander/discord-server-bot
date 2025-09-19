const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');
const logger = require('./utils/logger');
const Database = require('./database/database');
require('dotenv').config();

class DiscordServerBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        this.client.commands = new Collection();
        this.database = new Database();
    }

    async start() {
        try {
            // Lade Commands und Events
            await loadCommands(this.client);
            await loadEvents(this.client);
            
            // Verbinde zur Datenbank (optional wenn MongoDB verfügbar)
            try {
                await this.database.connect();
                this.client.database = this.database;
                logger.info('Datenbank verbunden');
            } catch (error) {
                logger.warn('Datenbank-Verbindung fehlgeschlagen, Bot läuft ohne DB:', error.message);
                // Bot kann auch ohne DB laufen (mit eingeschränkter Funktionalität)
            }
            
            // Starte Bot
            await this.client.login(process.env.DISCORD_TOKEN);
            logger.info('Discord-Bot erfolgreich gestartet!');
            
        } catch (error) {
            logger.error('Fehler beim Starten des Bots:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.info('Bot wird heruntergefahren...');
        await this.database.disconnect();
        this.client.destroy();
        process.exit(0);
    }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
    if (bot) await bot.shutdown();
});

process.on('SIGTERM', async () => {
    if (bot) await bot.shutdown();
});

// Starte Bot
const bot = new DiscordServerBot();
bot.start();