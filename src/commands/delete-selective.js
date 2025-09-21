const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-selective')
        .setDescription('Lösche bestimmte Kanäle, Kategorien oder Rollen gezielt')
        .setDefaultMemberPermissions('32'), // Manage Guild permission

    async execute(interaction) {
        // Berechtigungsprüfung
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({
                content: '❌ Du benötigst die Berechtigung "Server verwalten" um diesen Command zu verwenden!',
                flags: 64
            });
        }

        // Bot-Berechtigungen prüfen
        const botMember = interaction.guild.members.me;
        const requiredPerms = ['ManageChannels', 'ManageRoles'];
        const missingPerms = requiredPerms.filter(perm => !botMember.permissions.has(perm));
        
        if (missingPerms.length > 0) {
            return await interaction.reply({
                content: `❌ Mir fehlen folgende Berechtigungen: ${missingPerms.join(', ')}`,
                flags: 64
            });
        }

        // Zeige Auswahl-Menü
        const embed = new EmbedBuilder()
            .setTitle('🎯 Selektive Löschung')
            .setDescription('Wähle aus, was du löschen möchtest:')
            .setColor('#ffa500')
            .addFields(
                { name: '📁 Kategorien', value: 'Lösche ganze Kategorien mit allen Kanälen', inline: true },
                { name: '💬 Kanäle', value: 'Lösche einzelne Kanäle gezielt', inline: true },
                { name: '🎭 Rollen', value: 'Lösche bestimmte Rollen', inline: true }
            );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('delete_type_select')
            .setPlaceholder('Was möchtest du löschen?')
            .addOptions(
                {
                    label: '📁 Kategorien löschen',
                    value: 'categories',
                    description: 'Wähle Kategorien zum Löschen aus'
                },
                {
                    label: '💬 Kanäle löschen', 
                    value: 'channels',
                    description: 'Wähle einzelne Kanäle zum Löschen aus'
                },
                {
                    label: '🎭 Rollen löschen',
                    value: 'roles', 
                    description: 'Wähle Rollen zum Löschen aus'
                }
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: 64
        });

        // Warte auf Typ-Auswahl
        const filter = i => i.customId === 'delete_type_select' && i.user.id === interaction.user.id;
        
        try {
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000 // 5 Minuten
            });

            collector.on('collect', async (i) => {
                const deleteType = i.values[0];
                await this.showItemSelection(i, deleteType);
                collector.stop();
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: '⏰ Zeit abgelaufen! Befehl abgebrochen.',
                        embeds: [],
                        components: []
                    }).catch(() => {});
                }
            });

        } catch (error) {
            logger.error('Fehler bei Delete-Selective:', error);
            await interaction.editReply({
                content: '❌ Ein Fehler ist aufgetreten.',
                embeds: [],
                components: []
            });
        }
    },

    async showItemSelection(interaction, deleteType) {
        let items = [];
        let itemType = '';
        let emoji = '';

        switch (deleteType) {
            case 'categories':
                items = interaction.guild.channels.cache.filter(ch => 
                    ch.type === 4 && ch.deletable
                );
                itemType = 'Kategorien';
                emoji = '📁';
                break;
            case 'channels':
                items = interaction.guild.channels.cache.filter(ch => 
                    ch.type !== 4 && ch.deletable
                );
                itemType = 'Kanäle';
                emoji = '💬';
                break;
            case 'roles':
                items = interaction.guild.roles.cache.filter(role => 
                    role.id !== interaction.guild.id && 
                    role.editable && 
                    !role.managed
                );
                itemType = 'Rollen';
                emoji = '🎭';
                break;
        }

        if (items.size === 0) {
            return await interaction.update({
                content: `❌ Keine löschbaren ${itemType} gefunden.`,
                embeds: [],
                components: []
            });
        }

        // Erstelle Select-Menu für Items (max 25)
        const itemArray = Array.from(items.values()).slice(0, 25);
        
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${itemType} auswählen`)
            .setDescription(`Wähle die ${itemType} aus, die gelöscht werden sollen:`)
            .setColor('#ff9500')
            .addFields({
                name: '⚠️ Warnung',
                value: `Die ausgewählten ${itemType} werden **permanent** gelöscht!`,
                inline: false
            });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`delete_items_${deleteType}`)
            .setPlaceholder(`${itemType} auswählen...`)
            .setMinValues(1)
            .setMaxValues(Math.min(itemArray.length, 25));

        itemArray.forEach(item => {
            let description = '';
            if (deleteType === 'categories') {
                const channelCount = item.children.cache.size;
                description = `${channelCount} Kanäle in dieser Kategorie`;
            } else if (deleteType === 'channels') {
                description = item.type === 0 ? 'Text-Kanal' : item.type === 2 ? 'Voice-Kanal' : 'Kanal';
            } else if (deleteType === 'roles') {
                description = `${item.members.size} Mitglieder`;
            }

            selectMenu.addOptions({
                label: item.name,
                value: item.id,
                description: description.length > 100 ? description.substring(0, 97) + '...' : description
            });
        });

        const selectRow = new ActionRowBuilder().addComponents(selectMenu);

        const confirmButton = new ButtonBuilder()
            .setCustomId(`confirm_delete_${deleteType}`)
            .setLabel('🗑️ Ausgewählte löschen')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true);

        const cancelButton = new ButtonBuilder()
            .setCustomId(`cancel_delete_${deleteType}`)
            .setLabel('❌ Abbrechen')
            .setStyle(ButtonStyle.Secondary);

        const buttonRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.update({
            embeds: [embed],
            components: [selectRow, buttonRow]
        });

        // Speichere Original-Interaction für später
        interaction.client.tempSelections = interaction.client.tempSelections || new Map();
        interaction.client.tempSelections.set(interaction.user.id, {
            originalInteraction: interaction,
            deleteType: deleteType,
            selectedItems: []
        });

        // Warte auf Item-Auswahl
        this.setupItemCollectors(interaction, deleteType);
    },

    setupItemCollectors(interaction, deleteType) {
        const itemFilter = i => i.customId === `delete_items_${deleteType}` && i.user.id === interaction.user.id;
        const buttonFilter = i => [`confirm_delete_${deleteType}`, `cancel_delete_${deleteType}`].includes(i.customId) && i.user.id === interaction.user.id;

        const itemCollector = interaction.channel.createMessageComponentCollector({
            filter: itemFilter,
            time: 300000
        });

        const buttonCollector = interaction.channel.createMessageComponentCollector({
            filter: buttonFilter,
            time: 300000
        });

        itemCollector.on('collect', async (i) => {
            const tempSelection = interaction.client.tempSelections.get(interaction.user.id);
            tempSelection.selectedItems = i.values;

            // Aktiviere Confirm-Button
            const components = i.message.components.map(row => {
                const newRow = ActionRowBuilder.from(row);
                if (newRow.components[0]?.customId?.includes('confirm_delete')) {
                    newRow.components[0].setDisabled(false);
                }
                return newRow;
            });

            await i.update({
                content: `✅ ${i.values.length} ${deleteType} ausgewählt`,
                components: components
            });
        });

        buttonCollector.on('collect', async (i) => {
            if (i.customId.includes('confirm_delete')) {
                await this.executeSelectiveDelete(i, deleteType);
            } else {
                await i.update({
                    content: '❌ Löschung abgebrochen.',
                    embeds: [],
                    components: []
                });
            }
            itemCollector.stop();
            buttonCollector.stop();
        });

        itemCollector.on('end', (collected) => {
            if (collected.size === 0) {
                buttonCollector.stop();
            }
        });

        buttonCollector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏰ Zeit abgelaufen! Löschung abgebrochen.',
                    embeds: [],
                    components: []
                }).catch(() => {});
            }
        });
    },

    async executeSelectiveDelete(interaction, deleteType) {
        const tempSelection = interaction.client.tempSelections.get(interaction.user.id);
        const selectedIds = tempSelection.selectedItems;

        await interaction.update({
            content: `🗑️ Lösche ausgewählte ${deleteType}...`,
            embeds: [],
            components: []
        });

        const startTime = Date.now();
        let deleted = 0;
        let errors = [];

        try {
            for (const itemId of selectedIds) {
                try {
                    let item;
                    if (deleteType === 'roles') {
                        item = interaction.guild.roles.cache.get(itemId);
                        if (item) {
                            await item.delete(`Selektive Löschung durch ${interaction.user.tag}`);
                        }
                    } else {
                        item = interaction.guild.channels.cache.get(itemId);
                        if (item) {
                            await item.delete(`Selektive Löschung durch ${interaction.user.tag}`);
                        }
                    }
                    
                    if (item) {
                        deleted++;
                        logger.info(`${deleteType.slice(0, -1)} ${item.name} gelöscht`);
                    }
                    
                    await this.delay(500); // Rate limiting
                } catch (error) {
                    errors.push(`Fehler beim Löschen: ${error.message}`);
                    logger.error(`Fehler beim Löschen:`, error);
                }
            }

            const duration = Date.now() - startTime;

            // Erfolgsmeldung
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Selektive Löschung abgeschlossen')
                .setDescription(`${deleted} von ${selectedIds.length} Elementen erfolgreich gelöscht.`)
                .setColor('#00ff88')
                .addFields({
                    name: '📊 Statistik',
                    value: `**Gelöscht:** ${deleted}\n**Dauer:** ${Math.round(duration / 1000)}s`,
                    inline: false
                });

            if (errors.length > 0) {
                successEmbed.addFields({
                    name: '⚠️ Fehler',
                    value: errors.slice(0, 3).join('\n'),
                    inline: false
                });
            }

            await interaction.editReply({
                embeds: [successEmbed]
            });

        } catch (error) {
            logger.error('Schwerer Fehler bei selektiver Löschung:', error);
            await interaction.editReply({
                content: `❌ Schwerer Fehler: ${error.message}`,
                embeds: [],
                components: []
            });
        } finally {
            // Cleanup
            interaction.client.tempSelections.delete(interaction.user.id);
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};