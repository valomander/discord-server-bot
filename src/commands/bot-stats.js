const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-stats')
        .setDescription('Zeigt Bot-Statistiken und Multi-Server Informationen'),
    
    async execute(interaction) {
        try {
            const client = interaction.client;
            const database = client.database;
            
            // Sammle Bot-Statistiken
            const totalGuilds = client.guilds.cache.size;
            const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const uptime = process.uptime();
            
            // Formatiere Uptime
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
            
            // Database Statistiken (falls verfügbar)
            let dbStats = null;
            let serverStats = null;
            if (database && database.db) {
                try {
                    dbStats = await database.getServerStats();
                    serverStats = await database.getServerStats(interaction.guild.id);
                } catch (error) {
                    // Ignoriere DB-Fehler
                }
            }
            
            const embed = new EmbedBuilder()
                .setTitle('📊 Bot-Statistiken')
                .setDescription('Multi-Server Discord Bot Statistiken')
                .setColor('#00ff88')
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    {
                        name: '🌐 Globale Statistiken',
                        value: `
                            **Server:** ${totalGuilds}
                            **Nutzer:** ${totalUsers.toLocaleString()}
                            **Uptime:** ${uptimeStr}
                            **Version:** ${require('../../package.json').version}
                        `,
                        inline: true
                    },
                    {
                        name: '⚙️ System',
                        value: `
                            **Node.js:** ${process.version}
                            **Memory:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
                            **Platform:** ${process.platform}
                        `,
                        inline: true
                    }
                );

            // Database Statistiken hinzufügen
            if (dbStats) {
                embed.addFields({
                    name: '📈 Globale Bot-Nutzung',
                    value: `
                        **Total Server-Erstellungen:** ${dbStats.totalConfigs}
                        **Erfolgreiche Erstellungen:** ${dbStats.successfulCreations}
                        **Erfolgsrate:** ${dbStats.totalConfigs > 0 ? Math.round((dbStats.successfulCreations / dbStats.totalConfigs) * 100) : 0}%
                    `,
                    inline: false
                });
            }

            if (serverStats) {
                embed.addFields({
                    name: `🏠 Statistiken für ${interaction.guild.name}`,
                    value: `
                        **Server-Erstellungen:** ${serverStats.totalConfigs}
                        **Erfolgreiche Erstellungen:** ${serverStats.successfulCreations}
                        **Letzte Aktivität:** ${serverStats.lastCreation ? serverStats.lastCreation.toLocaleDateString('de-DE') : 'Keine'}
                    `,
                    inline: false
                });
            }

            // Top Server (nur für Bot-Owner sichtbar)
            if (interaction.user.id === process.env.BOT_OWNER_ID) {
                const topGuilds = client.guilds.cache
                    .sort((a, b) => b.memberCount - a.memberCount)
                    .first(5);
                
                if (topGuilds.length > 0) {
                    const topGuildsList = topGuilds.map(guild => 
                        `${guild.name}: ${guild.memberCount} Mitglieder`
                    ).join('\n');
                    
                    embed.addFields({
                        name: '🏆 Top Server (Owner-Only)',
                        value: topGuildsList,
                        inline: false
                    });
                }
            }

            embed.setFooter({ 
                text: `Angefragt von ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });
            
            await interaction.reply({ embeds: [embed], flags: 64 });
            
        } catch (error) {
            await interaction.reply({
                content: '❌ Fehler beim Abrufen der Bot-Statistiken.',
                flags: 64
            });
        }
    }
};