// MongoDB Initialisierungsscript
db = db.getSiblingDB('discord-server-bot');

// Erstelle Collections mit Validierung
db.createCollection('serverConfigs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['guildId', 'userId', 'config', 'status', 'createdAt'],
      properties: {
        guildId: {
          bsonType: 'string',
          description: 'Discord Guild ID'
        },
        userId: {
          bsonType: 'string', 
          description: 'Discord User ID'
        },
        config: {
          bsonType: 'object',
          description: 'Server configuration object'
        },
        status: {
          bsonType: 'string',
          enum: ['creating', 'completed', 'failed', 'partial'],
          description: 'Creation status'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

db.createCollection('templates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'config', 'isPublic'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Template name'
        },
        category: {
          bsonType: 'string',
          enum: ['gaming', 'project', 'study', 'community', 'creative', 'custom'],
          description: 'Template category'
        },
        config: {
          bsonType: 'object',
          description: 'Template configuration'
        },
        isPublic: {
          bsonType: 'bool',
          description: 'Whether template is public'
        },
        usageCount: {
          bsonType: 'int',
          description: 'How often template was used'
        }
      }
    }
  }
});

db.createCollection('creationLogs');

// Erstelle Indizes
db.serverConfigs.createIndex({ 'guildId': 1 });
db.serverConfigs.createIndex({ 'createdAt': 1 });
db.templates.createIndex({ 'name': 1 }, { unique: true });
db.templates.createIndex({ 'category': 1 });
db.creationLogs.createIndex({ 'timestamp': 1 });

// Füge Standard-Templates hinzu
db.templates.insertMany([
  {
    name: 'Gaming-Community Standard',
    category: 'gaming',
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: {
      categories: [
        {
          name: 'Info',
          channels: [
            { name: 'willkommen', type: 'text', description: 'Begrüßung neuer Mitglieder' },
            { name: 'regeln', type: 'text', description: 'Server-Regeln' },
            { name: 'ankündigungen', type: 'text', description: 'Wichtige Updates' }
          ]
        },
        {
          name: 'Gaming',
          channels: [
            { name: 'allgemein', type: 'text', description: 'Allgemeiner Gaming-Chat' },
            { name: 'lfg', type: 'text', description: 'Looking for Group' },
            { name: 'gaming-voice', type: 'voice', description: 'Gaming Voice-Chat' }
          ]
        }
      ],
      roles: [
        { name: 'Moderator', permissions: ['MANAGE_MESSAGES', 'VIEW_CHANNEL', 'SEND_MESSAGES'], color: '#ff6b6b' },
        { name: 'Gamer', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT', 'SPEAK'], color: '#4ecdc4' }
      ],
      rules: 'Sei respektvoll zu anderen Mitgliedern. Kein Spam oder Werbung. Halte dich an die Discord-Nutzungsbedingungen.',
      welcomeMessage: 'Willkommen in unserer Gaming-Community! Lese dir die Regeln durch und hab Spaß!'
    }
  },
  {
    name: 'Projektteam Standard',
    category: 'project', 
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: {
      categories: [
        {
          name: 'Organisation',
          channels: [
            { name: 'projekt-info', type: 'text', description: 'Projekt-Informationen' },
            { name: 'aufgaben', type: 'text', description: 'Task-Management' },
            { name: 'meetings', type: 'voice', description: 'Team-Meetings' }
          ]
        },
        {
          name: 'Entwicklung',
          channels: [
            { name: 'entwicklung', type: 'text', description: 'Development-Chat' },
            { name: 'code-review', type: 'text', description: 'Code-Reviews' },
            { name: 'testing', type: 'text', description: 'Testing und QA' }
          ]
        }
      ],
      roles: [
        { name: 'Projektleiter', permissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'VIEW_CHANNEL', 'SEND_MESSAGES'], color: '#e74c3c' },
        { name: 'Entwickler', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'], color: '#3498db' },
        { name: 'Tester', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES'], color: '#f39c12' }
      ],
      rules: 'Halte Diskussionen professionell. Teile sensible Daten nicht öffentlich. Nutze die entsprechenden Kanäle.',
      welcomeMessage: 'Willkommen im Projektteam! Alle wichtigen Informationen findest du in #projekt-info.'
    }
  }
]);

print('MongoDB Initialisierung abgeschlossen!');