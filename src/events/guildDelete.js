const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        logger.info(`Bot von Server entfernt: ${guild.name} (${guild.id})`);
        
        // Markiere Guild als inaktiv in Database
        if (guild.client.database) {
            await guild.client.database.markGuildInactive(guild.id);
        }
    }
};