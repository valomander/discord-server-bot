const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info(`Bot ist bereit! Eingeloggt als ${client.user.tag}`);
        logger.info(`Bot ist auf ${client.guilds.cache.size} Servern aktiv`);
        
        // Setze Bot-Status mit Server-Anzahl
        const serverCount = client.guilds.cache.size;
        client.user.setActivity(`/create-server | ${serverCount} Server`, { type: 0 });
        
        // Registriere alle Guilds in der Database
        if (client.database) {
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    await client.database.registerGuild(guild);
                } catch (error) {
                    logger.error(`Fehler beim Registrieren von Guild ${guild.name}:`, error);
                }
            }
            logger.info(`${serverCount} Guilds in Database registriert/aktualisiert`);
        }
        
        // Aktualisiere Status alle 30 Minuten
        setInterval(() => {
            const currentServerCount = client.guilds.cache.size;
            client.user.setActivity(`/create-server | ${currentServerCount} Server`, { type: 0 });
        }, 30 * 60 * 1000); // 30 Minuten
    }
};