const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-status')
        .setDescription('Zeigt den Status der letzten Server-Erstellung an'),
    
    async execute(interaction) {
        try {
            const database = interaction.client.database;
            const config = await database.getServerConfig(interaction.guild.id);

            if (!config) {
                return await interaction.reply({
                    content: '❌ Keine Server-Konfiguration für diesen Server gefunden.',
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📊 Server-Status')
                .setColor('#00ff88')
                .addFields(
                    {
                        name: '📅 Erstellt am',
                        value: config.createdAt.toLocaleString('de-DE'),
                        inline: true
                    },
                    {
                        name: '👤 Erstellt von',
                        value: `<@${config.userId}>`,
                        inline: true
                    },
                    {
                        name: '📈 Status',
                        value: this.getStatusEmoji(config.status) + ' ' + this.getStatusText(config.status),
                        inline: true
                    }
                );

            if (config.config) {
                const categories = config.config.categories?.length || 0;
                const channels = config.config.categories?.reduce((sum, cat) => sum + (cat.channels?.length || 0), 0) || 0;
                const roles = config.config.roles?.length || 0;

                embed.addFields({
                    name: '📋 Konfiguration',
                    value: `**Kategorien:** ${categories}\n**Kanäle:** ${channels}\n**Rollen:** ${roles}`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed], flags: 64 });

        } catch (error) {
            await interaction.reply({
                content: '❌ Fehler beim Abrufen des Server-Status.',
                flags: 64
            });
        }
    },

    getStatusEmoji(status) {
        const statusEmojis = {
            'creating': '🔄',
            'completed': '✅',
            'failed': '❌',
            'partial': '⚠️'
        };
        return statusEmojis[status] || '❓';
    },

    getStatusText(status) {
        const statusTexts = {
            'creating': 'Wird erstellt...',
            'completed': 'Erfolgreich erstellt',
            'failed': 'Fehlgeschlagen',
            'partial': 'Teilweise erstellt'
        };
        return statusTexts[status] || 'Unbekannt';
    }
};