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
            guildId,
            userId,
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
        const query = { guildId };
        if (configId) query._id = configId;
        
        return await this.db.collection('serverConfigs')
            .findOne(query, { sort: { createdAt: -1 } });
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
            guildId,
            userId,
            config,
            result,
            timestamp: new Date()
        });
    }
}

module.exports = Database;