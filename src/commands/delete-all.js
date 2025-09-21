const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-all')
        .setDescription('⚠️ ACHTUNG: Löscht ALLE Kanäle und Rollen (außer @everyone)')
        .setDefaultMemberPermissions('8'), // Administrator permission

    async execute(interaction) {
        // Strenge Berechtigungsprüfung
        if (!interaction.member.permissions.has('Administrator')) {
            return await interaction.reply({
                content: '❌ Du benötigst Administrator-Berechtigung um diesen Command zu verwenden!',
                flags: 64
            });
        }

        // Prüfe Bot-Berechtigungen
        const botMember = interaction.guild.members.me;
        const requiredPerms = ['ManageChannels', 'ManageRoles'];
        const missingPerms = requiredPerms.filter(perm => !botMember.permissions.has(perm));
        
        if (missingPerms.length > 0) {
            return await interaction.reply({
                content: `❌ Mir fehlen folgende Berechtigungen: ${missingPerms.join(', ')}`,
                flags: 64
            });
        }

        // Sammle Statistiken
        const channels = interaction.guild.channels.cache.filter(ch => 
            ch.type !== 4 && ch.deletable // Nicht Kategorien und nur löschbare
        );
        const categories = interaction.guild.channels.cache.filter(ch => 
            ch.type === 4 && ch.deletable
        );
        const roles = interaction.guild.roles.cache.filter(role => 
            role.id !== interaction.guild.id && // Nicht @everyone
            role.editable && // Nur editierbare Rollen
            !role.managed // Keine Bot-Rollen
        );

        // Warnung anzeigen
        const warningEmbed = new EmbedBuilder()
            .setTitle('⚠️ GEFÄHRLICHER BEFEHL')
            .setDescription('**ACHTUNG: Dieser Befehl löscht ALLES!**\n\nDies wird folgendes **PERMANENT** löschen:')
            .setColor('#ff0000')
            .addFields(
                { name: '📁 Kategorien', value: `${categories.size} Kategorien`, inline: true },
                { name: '💬 Kanäle', value: `${channels.size} Kanäle`, inline: true },
                { name: '🎭 Rollen', value: `${roles.size} Rollen`, inline: true }
            )
            .addFields({
                name: '⚠️ WARNUNG',
                value: '**DIESE AKTION KANN NICHT RÜCKGÄNGIG GEMACHT WERDEN!**\nAlle Nachrichten, Channel-Einstellungen und Rollen-Konfigurationen gehen verloren.',
                inline: false
            })
            .setFooter({ text: 'Nur Administrator können diesen Befehl verwenden' });

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_delete_all')
            .setLabel('🗑️ JA, ALLES LÖSCHEN')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_delete_all')
            .setLabel('❌ Abbrechen')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.reply({
            embeds: [warningEmbed],
            components: [row],
            flags: 64
        });

        // Warte auf Bestätigung
        const filter = i => ['confirm_delete_all', 'cancel_delete_all'].includes(i.customId) && 
                           i.user.id === interaction.user.id;
        
        try {
            const confirmation = await interaction.followUp({
                content: '⏰ Warte auf Bestätigung...',
                flags: 64
            });

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 30000 // 30 Sekunden
            });

            collector.on('collect', async (i) => {
                if (i.customId === 'confirm_delete_all') {
                    await this.executeDeleteAll(i, interaction.guild);
                } else {
                    await i.update({
                        content: '❌ Löschung abgebrochen. Alle Daten bleiben erhalten.',
                        embeds: [],
                        components: []
                    });
                }
                collector.stop();
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: '⏰ Zeit abgelaufen! Löschung abgebrochen aus Sicherheitsgründen.',
                        embeds: [],
                        components: []
                    }).catch(() => {});
                }
            });

        } catch (error) {
            logger.error('Fehler bei Delete-All Confirmation:', error);
            await interaction.editReply({
                content: '❌ Ein Fehler ist aufgetreten.',
                embeds: [],
                components: []
            });
        }
    },

    async executeDeleteAll(interaction, guild) {
        await interaction.update({
            content: '🔥 **LÖSCHE ALLES...** Dies kann einige Minuten dauern.',
            embeds: [],
            components: []
        });

        const startTime = Date.now();
        let deleted = { channels: 0, categories: 0, roles: 0 };
        let errors = [];

        try {
            // 1. Lösche zuerst alle Kanäle (nicht Kategorien)
            const channels = guild.channels.cache.filter(ch => 
                ch.type !== 4 && ch.deletable
            );

            for (const [id, channel] of channels) {
                try {
                    await channel.delete('Bulk-Delete: Alle Kanäle löschen');
                    deleted.channels++;
                    await this.delay(500); // Rate limiting
                } catch (error) {
                    errors.push(`Kanal ${channel.name}: ${error.message}`);
                    logger.error(`Fehler beim Löschen von Kanal ${channel.name}:`, error);
                }
            }

            // 2. Lösche Kategorien
            const categories = guild.channels.cache.filter(ch => 
                ch.type === 4 && ch.deletable
            );

            for (const [id, category] of categories) {
                try {
                    await category.delete('Bulk-Delete: Alle Kategorien löschen');
                    deleted.categories++;
                    await this.delay(500);
                } catch (error) {
                    errors.push(`Kategorie ${category.name}: ${error.message}`);
                    logger.error(`Fehler beim Löschen von Kategorie ${category.name}:`, error);
                }
            }

            // 3. Lösche Rollen
            const roles = guild.roles.cache.filter(role => 
                role.id !== guild.id && // Nicht @everyone
                role.editable && 
                !role.managed
            );

            for (const [id, role] of roles) {
                try {
                    await role.delete('Bulk-Delete: Alle Rollen löschen');
                    deleted.roles++;
                    await this.delay(500);
                } catch (error) {
                    errors.push(`Rolle ${role.name}: ${error.message}`);
                    logger.error(`Fehler beim Löschen von Rolle ${role.name}:`, error);
                }
            }

            // 4. Erstelle Temp-Channel für weitere Aktionen
            let tempChannel = null;
            try {
                tempChannel = await guild.channels.create({
                    name: '🔧temp-bot-control',
                    type: 0, // Text Channel
                    topic: 'Temporärer Kanal für Bot-Commands. Wird beim nächsten /create-server automatisch gelöscht.',
                    reason: 'Temp-Channel nach Delete-All erstellt'
                });
                
                // Sende Hilfe-Nachricht in Temp-Channel
                await tempChannel.send({
                    embeds: [{
                        title: '🔧 Temporärer Bot-Control Kanal',
                        description: 'Dieser Kanal wurde automatisch erstellt, damit Sie weiterhin Bot-Commands verwenden können.',
                        color: 0x00ff88,
                        fields: [
                            {
                                name: '🚀 Neuen Server erstellen',
                                value: '`/create-server` - Erstellt einen neuen Server',
                                inline: false
                            },
                            {
                                name: '🆘 Hilfe',
                                value: '`/help` - Zeigt alle verfügbaren Commands',
                                inline: false
                            },
                            {
                                name: '⚠️ Hinweis',
                                value: 'Dieser Kanal wird automatisch gelöscht, wenn Sie `/create-server` verwenden.',
                                inline: false
                            }
                        ]
                    }]
                });
                
                logger.info('Temp-Channel erstellt nach Delete-All');
            } catch (error) {
                errors.push(`Temp-Channel konnte nicht erstellt werden: ${error.message}`);
                logger.error('Fehler beim Erstellen des Temp-Channels:', error);
            }

            const duration = Date.now() - startTime;

            // Erfolgsmeldung
            const successEmbed = new EmbedBuilder()
                .setTitle('🗑️ Löschung abgeschlossen')
                .setDescription('Alle löschbaren Elemente wurden entfernt.')
                .setColor('#ff6b6b')
                .addFields(
                    { name: '📊 Gelöscht', value: `
                        **Kanäle:** ${deleted.channels}
                        **Kategorien:** ${deleted.categories}  
                        **Rollen:** ${deleted.roles}
                        **Dauer:** ${Math.round(duration / 1000)}s
                    `, inline: false }
                );

            if (tempChannel) {
                successEmbed.addFields({
                    name: '🔧 Temp-Channel erstellt',
                    value: `${tempChannel} wurde für weitere Bot-Commands erstellt.`,
                    inline: false
                });
            }

            if (errors.length > 0) {
                successEmbed.addFields({
                    name: '⚠️ Fehler',
                    value: errors.slice(0, 5).join('\n'),
                    inline: false
                });
            }

            // Sende Antwort in Temp-Channel falls Original-Channel gelöscht wurde
            try {
                await interaction.editReply({
                    embeds: [successEmbed]
                });
            } catch (error) {
                // Falls Original-Channel gelöscht wurde, sende in Temp-Channel
                if (tempChannel) {
                    await tempChannel.send({
                        content: `✅ Löschung von ${interaction.user} abgeschlossen:`,
                        embeds: [successEmbed]
                    });
                }
                logger.warn('Original-Channel wurde gelöscht, Antwort in Temp-Channel gesendet');
            }

            // Log in Database
            if (guild.client.database) {
                await guild.client.database.logServerCreation(
                    guild.id, 
                    interaction.user.id, 
                    { action: 'delete_all' }, 
                    { deleted, errors, duration }
                );
            }

        } catch (error) {
            logger.error('Schwerer Fehler bei Delete-All:', error);
            
            // Versuche Fehler-Nachricht zu senden
            try {
                await interaction.editReply({
                    content: `❌ Schwerer Fehler aufgetreten: ${error.message}`,
                    embeds: [],
                    components: []
                });
            } catch (replyError) {
                // Falls Reply fehlschlägt, versuche in einem beliebigen Kanal zu senden
                try {
                    const anyChannel = guild.channels.cache.find(ch => 
                        ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages')
                    );
                    
                    if (anyChannel) {
                        await anyChannel.send({
                            content: `❌ Schwerer Fehler bei Delete-All von ${interaction.user}: ${error.message}`
                        });
                    }
                } catch (fallbackError) {
                    logger.error('Konnte Fehlernachricht nicht senden:', fallbackError);
                }
            }
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};