const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.client = null;
        this.db = null;
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-server-bot';
    }

    async connect() {
        try {
            if (!this.uri || this.uri.includes('your_mongodb_uri')) {
                throw new Error('MongoDB URI nicht konfiguriert');
            }
            
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db();
            
            // Teste Verbindung
            await this.db.admin().ping();
            
            // Erstelle Indizes
            await this.createIndexes();
            
            logger.info('Erfolgreich mit MongoDB verbunden');
        } catch (error) {
            logger.error('Fehler bei MongoDB-Verbindung:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            logger.info('MongoDB-Verbindung geschlossen');
        }
    }

    async createIndexes() {
        try {
            // Index für Server-Konfigurationen
            await this.db.collection('serverConfigs').createIndex({ guildId: 1 });
            await this.db.collection('serverConfigs').createIndex({ createdAt: 1 });
            
            // Index für Templates
            await this.db.collection('templates').createIndex({ name: 1 }, { unique: true });
            await this.db.collection('templates').createIndex({ category: 1 });
            
            logger.info('Datenbank-Indizes erstellt');
        } catch (error) {
            logger.error('Fehler beim Erstellen der Indizes:', error);
        }
    }

    // Server-Konfigurationen
    async saveServerConfig(guildId, userId, config, status = 'created') {
        if (!this.db) {
            logger.warn('Keine Datenbank verfügbar - Server-Config nicht gespeichert');
            return { insertedId: 'temp-id' };
        }
        return await this.db.collection('serverConfigs').insertOne({
            guildId: String(guildId), // Ensure string format
            guildName: config.guildName || 'Unknown Server',
            userId: String(userId),
            config,
            status,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    async getServerConfig(guildId, configId = null) {
        if (!this.db) {
            logger.warn('Keine Datenbank verfügbar');
            return null;
        }
        const query = { guildId: String(guildId) };
        if (configId) query._id = configId;
        
        return await this.db.collection('serverConfigs')
            .findOne(query, { sort: { createdAt: -1 } });
    }

    // Hole alle Server-Configs (für Multi-Server Management)
    async getAllServerConfigs() {
        if (!this.db) return [];
        
        return await this.db.collection('serverConfigs')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
    }

    // Hole Server-Statistiken
    async getServerStats(guildId = null) {
        if (!this.db) return null;
        
        const query = guildId ? { guildId: String(guildId) } : {};
        
        const stats = await this.db.collection('serverConfigs').aggregate([
            { $match: query },
            {
                $group: {
                    _id: guildId ? '$guildId' : null,
                    totalConfigs: { $sum: 1 },
                    successfulCreations: { 
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
                    },
                    lastCreation: { $max: '$createdAt' }
                }
            }
        ]).toArray();
        
        return stats[0] || { totalConfigs: 0, successfulCreations: 0, lastCreation: null };
    }

    async updateServerConfigStatus(configId, status) {
        if (!this.db) {
            logger.warn('Keine Datenbank verfügbar - Status nicht aktualisiert');
            return;
        }
        return await this.db.collection('serverConfigs').updateOne(
            { _id: configId },
            { 
                $set: { 
                    status,
                    updatedAt: new Date()
                }
            }
        );
    }

    // Templates
    async saveTemplate(name, category, config, isPublic = false) {
        return await this.db.collection('templates').insertOne({
            name,
            category,
            config,
            isPublic,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    async getTemplates(category = null, isPublic = true) {
        const query = { isPublic };
        if (category) query.category = category;
        
        return await this.db.collection('templates')
            .find(query)
            .sort({ usageCount: -1, createdAt: -1 })
            .toArray();
    }

    async incrementTemplateUsage(templateId) {
        return await this.db.collection('templates').updateOne(
            { _id: templateId },
            { 
                $inc: { usageCount: 1 },
                $set: { updatedAt: new Date() }
            }
        );
    }

    // Logs
    async logServerCreation(guildId, userId, config, result) {
        if (!this.db) {
            logger.info('Server-Erstellung abgeschlossen (ohne DB-Log):', { guildId, result });
            return;
        }
        return await this.db.collection('creationLogs').insertOne({
            guildId: String(guildId),
            guildName: config.guildName || 'Unknown Server',
            userId: String(userId),
            config,
            result,
            timestamp: new Date()
        });
    }

    // Guild Management
    async registerGuild(guild) {
        if (!this.db) return;
        
        const guildData = {
            guildId: String(guild.id),
            guildName: guild.name,
            memberCount: guild.memberCount,
            joinedAt: new Date(),
            lastActivity: new Date(),
            isActive: true
        };
        
        await this.db.collection('guilds').replaceOne(
            { guildId: String(guild.id) },
            guildData,
            { upsert: true }
        );
        
        logger.info(`Guild registriert/aktualisiert: ${guild.name} (${guild.id})`);
    }

    async updateGuildActivity(guildId) {
        if (!this.db) return;
        
        await this.db.collection('guilds').updateOne(
            { guildId: String(guildId) },
            { 
                $set: { 
                    lastActivity: new Date(),
                    isActive: true
                }
            }
        );
    }

    async markGuildInactive(guildId) {
        if (!this.db) return;
        
        await this.db.collection('guilds').updateOne(
            { guildId: String(guildId) },
            { 
                $set: { 
                    isActive: false,
                    leftAt: new Date()
                }
            }
        );
    }
}

module.exports = Database;