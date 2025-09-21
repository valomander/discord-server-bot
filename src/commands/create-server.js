const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const AIProvider = require('../ai/aiProvider');
const ServerCreator = require('../services/serverCreator');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-server')
        .setDescription('Erstelle automatisch einen kompletten Discord-Server mit KI-Unterstützung')
        .setDefaultMemberPermissions('32'),
    
    async execute(interaction) {
        // Prüfe Berechtigungen
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({
                content: '❌ Du benötigst die Berechtigung "Server verwalten" um diesen Befehl zu verwenden!',
                flags: 64
            });
        }

        // Prüfe Bot-Berechtigungen
        const botMember = interaction.guild.members.me;
        const requiredPerms = ['ManageChannels', 'ManageRoles', 'ManageGuild'];
        const missingPerms = requiredPerms.filter(perm => !botMember.permissions.has(perm));
        
        if (missingPerms.length > 0) {
            return await interaction.reply({
                content: `❌ Mir fehlen folgende Berechtigungen: ${missingPerms.join(', ')}`,
                flags: 64
            });
        }

        // Zeige Template-Auswahl
        const embed = new EmbedBuilder()
            .setTitle('🤖 KI Server-Creator')
            .setDescription('Wähle eine Vorlage oder erstelle einen benutzerdefinierten Server:')
            .setColor('#00ff88')
            .addFields(
                { name: '🎮 Gaming-Community', value: 'Voice-Kanäle, Game-Kategorien, Rollen für verschiedene Spiele', inline: true },
                { name: '💼 Projektteam', value: 'Arbeitsbereiche, Meeting-Räume, Dokumentation', inline: true },
                { name: '🎓 Lern-/Studiengruppe', value: 'Fächer-Kanäle, Lernräume, Hausaufgaben-Bereiche', inline: true },
                { name: '🌐 Allgemeine Community', value: 'Chat-Bereiche, Events, Ankündigungen', inline: true },
                { name: '🎨 Kreativ-Community', value: 'Showcase-Bereiche, Feedback, Kollaboration', inline: true },
                { name: '⚙️ Benutzerdefiniert', value: 'Beschreibe deine eigenen Anforderungen', inline: true }
            );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('template_select')
            .setPlaceholder('Wähle eine Vorlage aus...')
            .addOptions(
                {
                    label: '🎮 Gaming-Community',
                    value: 'gaming',
                    description: 'Perfekt für Gaming-Server mit Voice und verschiedenen Spielen'
                },
                {
                    label: '💼 Projektteam',
                    value: 'project',
                    description: 'Organisiert für Teamarbeit und Projektmanagement'
                },
                {
                    label: '🎓 Lern-/Studiengruppe',
                    value: 'study',
                    description: 'Strukturiert für Lernen und Wissensvermittlung'
                },
                {
                    label: '🌐 Allgemeine Community',
                    value: 'community',
                    description: 'Vielseitig für verschiedene Community-Aktivitäten'
                },
                {
                    label: '🎨 Kreativ-Community',
                    value: 'creative',
                    description: 'Für Künstler, Designer und kreative Projekte'
                },
                {
                    label: '⚙️ Benutzerdefiniert',
                    value: 'custom',
                    description: 'Individuelle Konfiguration nach deinen Wünschen'
                }
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: 64 // Ephemeral flag
        });

        // Warte auf Template-Auswahl
        const filter = i => i.customId === 'template_select' && i.user.id === interaction.user.id;
        try {
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000 // 5 Minuten
            });

            collector.on('collect', async (i) => {
                await this.handleTemplateSelection(i, interaction);
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: '⏰ Zeit abgelaufen! Verwende den Befehl erneut.',
                        components: []
                    }).catch(() => {}); // Ignore if already replied
                }
            });

        } catch (error) {
            logger.error('Fehler bei Template-Auswahl:', error);
            await interaction.editReply({
                content: '❌ Ein Fehler ist aufgetreten. Versuche es erneut.',
                components: []
            });
        }
    },

    async handleTemplateSelection(selectInteraction, originalInteraction) {
        const selectedTemplate = selectInteraction.values[0];
        
        if (selectedTemplate === 'custom') {
            // Zeige Modal für benutzerdefinierte Eingabe
            await this.showCustomModal(selectInteraction);
        } else {
            // Zeige Modal für Template-Anpassung
            await this.showTemplateModal(selectInteraction, selectedTemplate);
        }
    },

    async showCustomModal(selectInteraction) {
        const modal = new ModalBuilder()
            .setCustomId('custom_server_modal')
            .setTitle('🛠️ Benutzerdefinierter Server');

        const serverNameInput = new TextInputBuilder()
            .setCustomId('server_name')
            .setLabel('Server-Name (optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('Leer lassen für aktuellen Namen');

        const purposeInput = new TextInputBuilder()
            .setCustomId('server_purpose')
            .setLabel('Wofür wird der Server verwendet?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('z.B. Gaming-Community für Minecraft und Valorant');

        const featuresInput = new TextInputBuilder()
            .setCustomId('server_features')
            .setLabel('Gewünschte Features/Kanäle')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('z.B. Voice-Kanäle, Ankündigungen, Memes, Screenshots');

        const rolesInput = new TextInputBuilder()
            .setCustomId('server_roles')
            .setLabel('Gewünschte Rollen')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder('z.B. Moderator, VIP, Spieler-Rollen');

        const additionalInput = new TextInputBuilder()
            .setCustomId('additional_info')
            .setLabel('Zusätzliche Informationen')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder('Besondere Wünsche oder Anforderungen');

        const firstRow = new ActionRowBuilder().addComponents(serverNameInput);
        const secondRow = new ActionRowBuilder().addComponents(purposeInput);
        const thirdRow = new ActionRowBuilder().addComponents(featuresInput);
        const fourthRow = new ActionRowBuilder().addComponents(rolesInput);
        const fifthRow = new ActionRowBuilder().addComponents(additionalInput);

        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

        await selectInteraction.showModal(modal);

        // Warte auf Modal-Submission
        const filter = i => i.customId === 'custom_server_modal' && i.user.id === selectInteraction.user.id;
        try {
            const modalInteraction = await selectInteraction.awaitModalSubmit({
                filter,
                time: 600000 // 10 Minuten
            });

            await this.processCustomServer(modalInteraction);
        } catch (error) {
            logger.error('Fehler bei Custom Modal:', error);
        }
    },

    async showTemplateModal(selectInteraction, template) {
        const templates = {
            gaming: {
                title: '🎮 Gaming-Community anpassen',
                purpose: 'Gaming-Community für verschiedene Spiele mit Voice-Kanälen und Game-spezifischen Bereichen'
            },
            project: {
                title: '💼 Projektteam anpassen', 
                purpose: 'Projektteam-Server mit Arbeitsbereichen, Meeting-Räumen und Dokumentation'
            },
            study: {
                title: '🎓 Studiengruppe anpassen',
                purpose: 'Lern- und Studiengruppe mit Fächer-Kanälen und Lernräumen'
            },
            community: {
                title: '🌐 Community anpassen',
                purpose: 'Allgemeine Community mit Chat-Bereichen, Events und Ankündigungen'
            },
            creative: {
                title: '🎨 Kreativ-Community anpassen',
                purpose: 'Kreative Community mit Showcase-Bereichen und Kollaboration'
            }
        };

        const templateData = templates[template];
        
        const modal = new ModalBuilder()
            .setCustomId(`template_modal_${template}`)
            .setTitle(templateData.title);

        const serverNameInput = new TextInputBuilder()
            .setCustomId('server_name')
            .setLabel('Server-Name (optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('Leer lassen für aktuellen Namen');

        const customizationInput = new TextInputBuilder()
            .setCustomId('customization')
            .setLabel('Anpassungen/Besonderheiten')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setValue(templateData.purpose)
            .setPlaceholder('Ändere oder ergänze die Beschreibung...');

        const firstRow = new ActionRowBuilder().addComponents(serverNameInput);
        const secondRow = new ActionRowBuilder().addComponents(customizationInput);

        modal.addComponents(firstRow, secondRow);

        await selectInteraction.showModal(modal);

        // Warte auf Modal-Submission
        const filter = i => i.customId === `template_modal_${template}` && i.user.id === selectInteraction.user.id;
        try {
            const modalInteraction = await selectInteraction.awaitModalSubmit({
                filter,
                time: 600000 // 10 Minuten
            });

            await this.processTemplateServer(modalInteraction, template);
        } catch (error) {
            logger.error('Fehler bei Template Modal:', error);
        }
    },

    async processCustomServer(interaction) {
        await interaction.deferReply({ flags: 64 });

        const serverName = interaction.fields.getTextInputValue('server_name') || null;
        const purpose = interaction.fields.getTextInputValue('server_purpose');
        const features = interaction.fields.getTextInputValue('server_features');
        const roles = interaction.fields.getTextInputValue('server_roles') || '';
        const additional = interaction.fields.getTextInputValue('additional_info') || '';

        const userInput = [purpose, features, roles, additional].filter(Boolean);

        await this.createServerWithAI(interaction, userInput, serverName);
    },

    async processTemplateServer(interaction, template) {
        await interaction.deferReply({ flags: 64 });

        const serverName = interaction.fields.getTextInputValue('server_name') || null;
        const customization = interaction.fields.getTextInputValue('customization');

        const userInput = [customization];

        await this.createServerWithAI(interaction, userInput, serverName, template);
    },

    async createServerWithAI(interaction, userInput, serverName = null, template = null) {
        try {
            // Zeige Lade-Nachricht
            await interaction.editReply({
                content: '🤖 KI generiert Server-Konfiguration... Dies kann einen Moment dauern.'
            });

            // Generiere Konfiguration mit KI
            const aiProvider = new AIProvider();
            const config = await aiProvider.generateServerConfig(userInput);

            // Überschreibe Server-Name wenn angegeben
            if (serverName) {
                config.serverName = serverName;
            }

            // Zeige Vorschau
            await this.showConfigPreview(interaction, config, template);

        } catch (error) {
            logger.error('Fehler bei KI-Generierung:', error);
            await interaction.editReply({
                content: `❌ Fehler bei der Server-Generierung: ${error.message}`
            });
        }
    },

    async showConfigPreview(interaction, config, template) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Server-Vorschau')
            .setDescription(`**Server-Name:** ${config.serverName || interaction.guild.name}\n\n**Kategorien & Kanäle:**`)
            .setColor('#00ff88');

        // Kategorien und Kanäle anzeigen
        if (config.categories) {
            config.categories.forEach(category => {
                const channels = category.channels.map(ch => 
                    `${ch.type === 'voice' ? '🔊' : '💬'} ${ch.name}`
                ).join('\n');
                embed.addFields({
                    name: `📁 ${category.name}`,
                    value: channels || 'Keine Kanäle',
                    inline: true
                });
            });
        }

        // Rollen anzeigen
        if (config.roles && config.roles.length > 0) {
            const rolesList = config.roles.map(role => `🎭 ${role.name}`).join('\n');
            embed.addFields({
                name: '🎭 Rollen',
                value: rolesList,
                inline: false
            });
        }

        // Regeln anzeigen
        if (config.rules) {
            embed.addFields({
                name: '📜 Server-Regeln',
                value: config.rules.length > 200 ? config.rules.substring(0, 200) + '...' : config.rules,
                inline: false
            });
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_creation')
            .setLabel('✅ Server erstellen')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_creation')
            .setLabel('❌ Abbrechen')
            .setStyle(ButtonStyle.Secondary);

        const regenerateButton = new ButtonBuilder()
            .setCustomId('regenerate_config')
            .setLabel('🔄 Neu generieren')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(confirmButton, regenerateButton, cancelButton);

        await interaction.editReply({
            content: '**Vorschau deiner Server-Konfiguration:**\nÜberprüfe die Einstellungen und bestätige die Erstellung.',
            embeds: [embed],
            components: [row]
        });

        // Speichere Konfiguration temporär
        interaction.client.tempConfigs = interaction.client.tempConfigs || new Map();
        interaction.client.tempConfigs.set(interaction.user.id, { config, template });

        // Warte auf Bestätigung
        const filter = i => ['confirm_creation', 'cancel_creation', 'regenerate_config'].includes(i.customId) && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 300000 // 5 Minuten
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm_creation') {
                await this.executeServerCreation(i, config);
            } else if (i.customId === 'cancel_creation') {
                await i.update({
                    content: '❌ Server-Erstellung abgebrochen.',
                    embeds: [],
                    components: []
                });
            } else if (i.customId === 'regenerate_config') {
                await i.update({
                    content: '🔄 Regeneriere Konfiguration...',
                    embeds: [],
                    components: []
                });
                // Hier könnte man die KI erneut aufrufen
            }
            collector.stop();
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏰ Zeit abgelaufen! Server-Erstellung abgebrochen.',
                    embeds: [],
                    components: []
                }).catch(() => {}); // Ignore if already replied
            }
        });
    },

    async executeServerCreation(interaction, config) {
        await interaction.deferUpdate();

        try {
            const serverCreator = new ServerCreator(interaction.guild, interaction.client.database);
            
            await interaction.editReply({
                content: '🚧 Erstelle Server-Struktur... Dies kann einige Minuten dauern.',
                embeds: [],
                components: []
            });

            const result = await serverCreator.createServer(config, interaction.user.id);

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Server erfolgreich erstellt!')
                .setDescription('Dein Server wurde erfolgreich konfiguriert.')
                .setColor('#00ff88')
                .addFields(
                    { name: '📊 Statistiken', value: `
                        **Kategorien:** ${result.categoriesCreated}
                        **Kanäle:** ${result.channelsCreated}
                        **Rollen:** ${result.rolesCreated}
                        **Dauer:** ${Math.round(result.duration / 1000)}s
                    `, inline: false }
                );

            if (result.errors && result.errors.length > 0) {
                successEmbed.addFields({
                    name: '⚠️ Warnungen',
                    value: result.errors.slice(0, 3).join('\n'),
                    inline: false
                });
            }

            await interaction.editReply({
                content: '',
                embeds: [successEmbed]
            });

            // NACH erfolgreicher Server-Erstellung: Lösche Temp-Channel
            await this.cleanupTempChannel(interaction.guild);

        } catch (error) {
            logger.error('Fehler bei Server-Erstellung:', error);
            await interaction.editReply({
                content: `❌ Fehler bei der Server-Erstellung: ${error.message}`,
                embeds: [],
                components: []
            });
        }
    },

    async cleanupTempChannel(guild) {
        try {
            // Suche nach Temp-Channel
            const tempChannel = guild.channels.cache.find(channel => 
                channel.name === '🔧temp-bot-control' && 
                channel.type === 0 && // Text Channel
                channel.deletable
            );

            if (tempChannel) {
                // Sende Abschiedsnachricht
                try {
                    await tempChannel.send({
                        embeds: [{
                            title: '✅ Server-Erstellung abgeschlossen',
                            description: 'Der neue Server wurde erfolgreich erstellt. Dieser temporäre Kanal wird nicht mehr benötigt.',
                            color: 0x00ff88,
                            footer: { text: 'Kanal wird in 5 Sekunden gelöscht...' }
                        }]
                    });

                    // Kurz warten und dann löschen
                    await this.delay(5000);
                } catch (error) {
                    // Ignoriere Fehler beim Senden der Nachricht
                }

                await tempChannel.delete('Temp-Channel wird gelöscht - Server-Erstellung abgeschlossen');
                logger.info('Temp-Channel automatisch gelöscht nach erfolgreicher Server-Erstellung');
            }
        } catch (error) {
            // Ignoriere Fehler beim Cleanup - soll nichts blockieren
            logger.warn('Fehler beim Cleanup des Temp-Channels:', error.message);
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};