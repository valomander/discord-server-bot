const { ChannelType, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

class ServerCreator {
    constructor(guild, database) {
        this.guild = guild;
        this.database = database;
        this.createdItems = {
            roles: [],
            categories: [],
            channels: [],
            messages: []
        };
    }

    async createServer(config, userId) {
        const startTime = Date.now();
        const errors = [];

        try {
            logger.info(`Starte Server-Erstellung für Guild ${this.guild.id}`);

            // Füge Guild-Name zur Config hinzu
            config.guildName = this.guild.name;
            
            // Speichere Konfiguration in Database
            const configRecord = await this.database.saveServerConfig(
                this.guild.id, 
                userId, 
                config, 
                'creating'
            );

            // 1. Erstelle Rollen
            if (config.roles) {
                await this.createRoles(config.roles, errors);
            }

            // 2. Erstelle Kategorien und Kanäle
            if (config.categories) {
                await this.createCategoriesAndChannels(config.categories, errors);
            }

            // 3. Setze Server-Name (falls angegeben)
            if (config.serverName && config.serverName !== this.guild.name) {
                try {
                    await this.guild.setName(config.serverName);
                    logger.info(`Server-Name geändert zu: ${config.serverName}`);
                } catch (error) {
                    errors.push(`Server-Name konnte nicht geändert werden: ${error.message}`);
                }
            }

            // 4. Erstelle Willkommensnachricht
            if (config.welcomeMessage) {
                await this.createWelcomeMessage(config.welcomeMessage, errors);
            }

            // 5. Setze Server-Regeln
            if (config.rules) {
                await this.setServerRules(config.rules, errors);
            }

            const duration = Date.now() - startTime;
            
            // Update Status in Database
            await this.database.updateServerConfigStatus(configRecord.insertedId, 'completed');
            
            // Log Erstellung
            const result = {
                categoriesCreated: this.createdItems.categories.length,
                channelsCreated: this.createdItems.channels.length,
                rolesCreated: this.createdItems.roles.length,
                duration,
                errors
            };

            await this.database.logServerCreation(this.guild.id, userId, config, result);

            logger.info(`Server-Erstellung abgeschlossen in ${duration}ms`);
            return result;

        } catch (error) {
            logger.error('Fehler bei Server-Erstellung:', error);
            
            // Versuche Rollback
            await this.rollbackCreation();
            
            throw new Error(`Server-Erstellung fehlgeschlagen: ${error.message}`);
        }
    }

    async createRoles(rolesConfig, errors) {
        logger.info(`Erstelle ${rolesConfig.length} Rollen...`);
        
        for (const roleConfig of rolesConfig) {
            try {
                // Rate Limiting
                await this.delay(1000);
                
                const permissions = this.mapPermissions(roleConfig.permissions || []);
                
                const role = await this.guild.roles.create({
                    name: roleConfig.name,
                    color: roleConfig.color || '#99aab5',
                    permissions: permissions,
                    mentionable: roleConfig.mentionable || false,
                    reason: 'Automatische Server-Erstellung durch KI-Bot'
                });
                
                this.createdItems.roles.push(role.id);
                logger.info(`Rolle erstellt: ${role.name}`);
                
            } catch (error) {
                const errorMsg = `Rolle "${roleConfig.name}" konnte nicht erstellt werden: ${error.message}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }
    }

    async createCategoriesAndChannels(categoriesConfig, errors) {
        logger.info(`Erstelle ${categoriesConfig.length} Kategorien...`);
        
        for (const categoryConfig of categoriesConfig) {
            try {
                await this.delay(1000);
                
                // Erstelle Kategorie
                const category = await this.guild.channels.create({
                    name: categoryConfig.name,
                    type: ChannelType.GuildCategory,
                    reason: 'Automatische Server-Erstellung durch KI-Bot'
                });
                
                this.createdItems.categories.push(category.id);
                logger.info(`Kategorie erstellt: ${category.name}`);
                
                // Erstelle Kanäle in der Kategorie
                if (categoryConfig.channels) {
                    await this.createChannelsInCategory(category, categoryConfig.channels, errors);
                }
                
            } catch (error) {
                const errorMsg = `Kategorie "${categoryConfig.name}" konnte nicht erstellt werden: ${error.message}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }
    }

    async createChannelsInCategory(category, channelsConfig, errors) {
        for (const channelConfig of channelsConfig) {
            try {
                await this.delay(1000);
                
                const channelType = channelConfig.type === 'voice' ? 
                    ChannelType.GuildVoice : ChannelType.GuildText;
                
                const channelOptions = {
                    name: channelConfig.name,
                    type: channelType,
                    parent: category.id,
                    reason: 'Automatische Server-Erstellung durch KI-Bot'
                };

                // Nur Text-Kanäle können Topics haben, Voice-Kanäle nicht!
                if (channelType === ChannelType.GuildText) {
                    channelOptions.topic = this.sanitizeChannelTopic(channelConfig.description);
                }

                const channel = await this.guild.channels.create(channelOptions);
                
                // Setze Channel-Berechtigungen falls definiert
                if (channelConfig.permissions) {
                    await this.setChannelPermissions(channel, channelConfig.permissions);
                }
                
                this.createdItems.channels.push(channel.id);
                logger.info(`Kanal erstellt: ${channel.name} (${channelConfig.type})`);
                
            } catch (error) {
                const errorMsg = `Kanal "${channelConfig.name}" konnte nicht erstellt werden: ${error.message}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }
    }

    async createWelcomeMessage(welcomeMessage, errors) {
        try {
            // Finde einen geeigneten Kanal für die Willkommensnachricht
            const welcomeChannel = this.guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildText && 
                (channel.name.includes('willkommen') || 
                 channel.name.includes('welcome') || 
                 channel.name.includes('general') ||
                 channel.name.includes('allgemein'))
            ) || this.guild.systemChannel;

            if (welcomeChannel) {
                const message = await welcomeChannel.send({
                    content: `📋 **Willkommen auf ${this.guild.name}!**\n\n${welcomeMessage}`
                });
                
                this.createdItems.messages.push(message.id);
                logger.info('Willkommensnachricht erstellt');
            } else {
                errors.push('Kein geeigneter Kanal für Willkommensnachricht gefunden');
            }
            
        } catch (error) {
            const errorMsg = `Willkommensnachricht konnte nicht erstellt werden: ${error.message}`;
            logger.error(errorMsg);
            errors.push(errorMsg);
        }
    }

    async setServerRules(rules, errors) {
        try {
            // Finde oder erstelle Regel-Kanal
            let rulesChannel = this.guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildText && 
                (channel.name.includes('regel') || channel.name.includes('rules'))
            );

            if (!rulesChannel) {
                await this.delay(1000);
                rulesChannel = await this.guild.channels.create({
                    name: 'regeln',
                    type: ChannelType.GuildText,
                    reason: 'Automatische Server-Erstellung durch KI-Bot'
                });
                
                this.createdItems.channels.push(rulesChannel.id);
            }

            const message = await rulesChannel.send({
                content: `📜 **Server-Regeln**\n\n${rules}`
            });
            
            this.createdItems.messages.push(message.id);
            logger.info('Server-Regeln erstellt');
            
        } catch (error) {
            const errorMsg = `Server-Regeln konnten nicht erstellt werden: ${error.message}`;
            logger.error(errorMsg);
            errors.push(errorMsg);
        }
    }

    mapPermissions(permissionNames) {
        const permissionMap = {
            'VIEW_CHANNEL': PermissionFlagsBits.ViewChannel,
            'SEND_MESSAGES': PermissionFlagsBits.SendMessages,
            'EMBED_LINKS': PermissionFlagsBits.EmbedLinks,
            'ATTACH_FILES': PermissionFlagsBits.AttachFiles,
            'READ_MESSAGE_HISTORY': PermissionFlagsBits.ReadMessageHistory,
            'USE_EXTERNAL_EMOJIS': PermissionFlagsBits.UseExternalEmojis,
            'ADD_REACTIONS': PermissionFlagsBits.AddReactions,
            'CONNECT': PermissionFlagsBits.Connect,
            'SPEAK': PermissionFlagsBits.Speak,
            'USE_VAD': PermissionFlagsBits.UseVAD,
            'STREAM': PermissionFlagsBits.Stream,
            'MANAGE_MESSAGES': PermissionFlagsBits.ManageMessages,
            'MANAGE_CHANNELS': PermissionFlagsBits.ManageChannels
        };

        let permissions = 0n;
        for (const permName of permissionNames) {
            if (permissionMap[permName]) {
                permissions |= permissionMap[permName];
            }
        }

        return permissions;
    }

    async rollbackCreation() {
        logger.warn('Starte Rollback der Server-Erstellung...');
        
        try {
            // Lösche erstellte Kanäle
            for (const channelId of this.createdItems.channels) {
                try {
                    const channel = this.guild.channels.cache.get(channelId);
                    if (channel) {
                        await channel.delete('Rollback: Server-Erstellung fehlgeschlagen');
                        await this.delay(500);
                    }
                } catch (error) {
                    logger.error(`Fehler beim Löschen von Kanal ${channelId}:`, error);
                }
            }

            // Lösche erstellte Kategorien
            for (const categoryId of this.createdItems.categories) {
                try {
                    const category = this.guild.channels.cache.get(categoryId);
                    if (category) {
                        await category.delete('Rollback: Server-Erstellung fehlgeschlagen');
                        await this.delay(500);
                    }
                } catch (error) {
                    logger.error(`Fehler beim Löschen von Kategorie ${categoryId}:`, error);
                }
            }

            // Lösche erstellte Rollen
            for (const roleId of this.createdItems.roles) {
                try {
                    const role = this.guild.roles.cache.get(roleId);
                    if (role && role.editable) {
                        await role.delete('Rollback: Server-Erstellung fehlgeschlagen');
                        await this.delay(500);
                    }
                } catch (error) {
                    logger.error(`Fehler beim Löschen von Rolle ${roleId}:`, error);
                }
            }

            logger.info('Rollback abgeschlossen');
        } catch (error) {
            logger.error('Fehler beim Rollback:', error);
        }
    }

    async setChannelPermissions(channel, permissions) {
        try {
            // Falls Channel als privat markiert ist
            if (permissions.private) {
                // Verstecke vor @everyone
                await channel.permissionOverwrites.edit(this.guild.roles.everyone, {
                    ViewChannel: false
                });
                
                // Erlaube Staff-Rollen Zugang
                const staffRoles = this.guild.roles.cache.filter(role => 
                    role.name.toLowerCase().includes('admin') ||
                    role.name.toLowerCase().includes('mod') ||
                    role.name.toLowerCase().includes('staff') ||
                    role.name.toLowerCase().includes('team')
                );
                
                for (const [roleId, role] of staffRoles) {
                    await channel.permissionOverwrites.edit(role, {
                        ViewChannel: true,
                        SendMessages: channel.type === ChannelType.GuildText,
                        Connect: channel.type === ChannelType.GuildVoice,
                        Speak: channel.type === ChannelType.GuildVoice
                    });
                }
                
                logger.info(`Private Berechtigungen gesetzt für Kanal: ${channel.name}`);
            } else {
                // Öffentlicher Kanal - Standard-Berechtigungen
                await channel.permissionOverwrites.edit(this.guild.roles.everyone, {
                    ViewChannel: true,
                    SendMessages: channel.type === ChannelType.GuildText,
                    Connect: channel.type === ChannelType.GuildVoice,
                    Speak: channel.type === ChannelType.GuildVoice
                });
            }
            
            // Spezifische Rollen-Berechtigungen setzen
            if (permissions.viewChannel) {
                for (const roleName of permissions.viewChannel) {
                    if (roleName === '@everyone') continue; // Schon behandelt
                    
                    const role = this.guild.roles.cache.find(r => 
                        r.name.toLowerCase() === roleName.toLowerCase()
                    );
                    
                    if (role) {
                        await channel.permissionOverwrites.edit(role, {
                            ViewChannel: true
                        });
                    }
                }
            }
            
        } catch (error) {
            logger.error(`Fehler beim Setzen der Channel-Berechtigungen für ${channel.name}:`, error);
        }
    }

    sanitizeChannelTopic(topic) {
        if (!topic) return null;
        
        // Entferne potentiell problematische Wörter/Zeichen
        const blockedWords = [
            'discord', 'nitro', 'server', 'invite', 'link', 'admin', 
            'mod', 'moderator', 'ban', 'kick', 'mute', 'timeout',
            'free', 'hack', 'cheat', 'bot', 'spam', 'scam'
        ];
        
        let sanitized = topic.toLowerCase();
        
        // Ersetze blockierte Wörter
        blockedWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            sanitized = sanitized.replace(regex, word.charAt(0) + '*'.repeat(word.length - 1));
        });
        
        // Entferne spezielle Zeichen die Probleme machen können
        sanitized = sanitized.replace(/[<>@#&!]/g, '');
        
        // Begrenze Länge auf 1024 Zeichen
        if (sanitized.length > 1024) {
            sanitized = sanitized.substring(0, 1024);
        }
        
        return sanitized || null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = ServerCreator;