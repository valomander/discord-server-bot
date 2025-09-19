const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info(`Bot ist bereit! Eingeloggt als ${client.user.tag}`);
        logger.info(`Bot ist auf ${client.guilds.cache.size} Servern aktiv`);
        
        // Setze Bot-Status
        client.user.setActivity('Server erstellen mit /create-server', { type: 0 });
    }
};