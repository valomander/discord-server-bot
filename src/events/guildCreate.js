const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        logger.info(`Bot zu neuem Server hinzugefügt: ${guild.name} (${guild.id})`);
        logger.info(`Server-Details: ${guild.memberCount} Mitglieder, Owner: ${guild.ownerId}`);
        
        // Registriere Guild in Database
        if (guild.client.database) {
            await guild.client.database.registerGuild(guild);
        }
        
        // Suche nach einem Standard-Kanal um Begrüßung zu senden
        try {
            const welcomeChannel = guild.systemChannel || 
                                 guild.channels.cache.find(channel => 
                                     channel.type === 0 && // Text Channel
                                     channel.permissionsFor(guild.members.me).has('SendMessages')
                                 );
            
            if (welcomeChannel) {
                await welcomeChannel.send({
                    embeds: [{
                        title: '🤖 KI Server-Creator Bot ist da!',
                        description: 'Vielen Dank, dass Sie mich zu Ihrem Server hinzugefügt haben!',
                        color: 0x00ff88,
                        fields: [
                            {
                                name: '🚀 Erste Schritte',
                                value: '`/help` - Zeigt alle verfügbaren Commands\n`/create-server` - Erstellt automatisch einen kompletten Server',
                                inline: false
                            },
                            {
                                name: '🔧 Berechtigungen',
                                value: 'Stellen Sie sicher, dass der Bot folgende Berechtigungen hat:\n• Kanäle verwalten\n• Rollen verwalten\n• Nachrichten senden',
                                inline: false
                            },
                            {
                                name: '🎯 Features',
                                value: '• KI-gestützte Server-Erstellung\n• Multiple Templates\n• Automatische Rollback-Funktion\n• Selektive Löschfunktionen',
                                inline: false
                            }
                        ],
                        footer: { text: 'Powered by KI | Entwickelt von Valentin' }
                    }]
                });
                
                logger.info(`Begrüßungsnachricht gesendet in ${welcomeChannel.name}`);
            }
        } catch (error) {
            logger.error('Fehler beim Senden der Begrüßungsnachricht:', error);
        }
    }
};