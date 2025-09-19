const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`Kein Command gefunden für ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
            logger.info(`Command ${interaction.commandName} ausgeführt von ${interaction.user.tag} auf Server ${interaction.guild.name}`);
        } catch (error) {
            logger.error(`Fehler bei Ausführung von Command ${interaction.commandName}:`, error);
            
            const errorMessage = 'Es gab einen Fehler bei der Ausführung dieses Commands!';
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, flags: 64 });
                } else {
                    await interaction.reply({ content: errorMessage, flags: 64 });
                }
            } catch (err) {
                // Ignore if interaction has already been acknowledged
                logger.error('Konnte Fehlernachricht nicht senden:', err.message);
            }
        }
    }
};