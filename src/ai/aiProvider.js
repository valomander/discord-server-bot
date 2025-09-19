const axios = require('axios');
const logger = require('../utils/logger');

class AIProvider {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'ollama';
        this.setupProvider();
    }

    setupProvider() {
        switch (this.provider) {
            case 'ollama':
                this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
                this.model = process.env.OLLAMA_MODEL || 'gpt-oss:20b';
                break;
            case 'openrouter':
                this.apiKey = process.env.OPENROUTER_API_KEY;
                this.baseURL = 'https://openrouter.ai/api/v1';
                this.model = process.env.OPENROUTER_MODEL || 'microsoft/wizardlm-2-8x22b';
                break;
            default:
                throw new Error(`Unbekannter AI Provider: ${this.provider}`);
        }
    }

    async generateServerConfig(userInput) {
        const prompt = this.buildPrompt(userInput);
        
        try {
            let response;
            
            if (this.provider === 'ollama') {
                response = await this.callOllama(prompt);
            } else if (this.provider === 'openrouter') {
                response = await this.callOpenRouter(prompt);
            }
            
            return this.parseResponse(response);
        } catch (error) {
            logger.error('Fehler bei KI-Anfrage:', error);
            throw new Error('KI-Service ist momentan nicht verfügbar');
        }
    }

    buildPrompt(userInput) {
        const systemPrompt = `Du bist ein Experte für Discord-Server-Konfiguration. Du antwortest AUSSCHLIESSLICH mit validem JSON nach folgendem Schema:

{
  "serverName": "string",
  "categories": [
    {
      "name": "string",
      "channels": [
        {
          "name": "string",
          "type": "text|voice",
          "description": "string (optional)"
        }
      ]
    }
  ],
  "roles": [
    {
      "name": "string",
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL", ...],
      "color": "#hexcode",
      "mentionable": boolean
    }
  ],
  "rules": "string mit Server-Regeln",
  "welcomeMessage": "string für Begrüßungsnachricht"
}

Wichtige Regeln:
- Erstelle NIEMALS Rollen mit ADMINISTRATOR-Berechtigung
- Maximiere 15 Kanäle und 8 Rollen
- Verwende nur erlaubte Discord-Permissions
- Antwort muss gültiges JSON sein ohne zusätzlichen Text`;

        return {
            system: systemPrompt,
            user: `Erstelle eine Server-Konfiguration basierend auf: ${userInput.join(', ')}`
        };
    }

    async callOllama(prompt) {
        const response = await axios.post(`${this.baseURL}/api/generate`, {
            model: this.model,
            prompt: `${prompt.system}\n\nUser: ${prompt.user}`,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9
            }
        });

        return response.data.response;
    }

    async callOpenRouter(prompt) {
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
            model: this.model,
            messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user }
            ],
            temperature: 0.7,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    }

    parseResponse(response) {
        try {
            // Extrahiere JSON aus der Antwort (falls zusätzlicher Text vorhanden)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Kein JSON in der Antwort gefunden');
            }
            
            const config = JSON.parse(jsonMatch[0]);
            return this.validateAndSanitize(config);
        } catch (error) {
            logger.error('Fehler beim Parsen der KI-Antwort:', error);
            throw new Error('KI-Antwort konnte nicht verarbeitet werden');
        }
    }

    validateAndSanitize(config) {
        // Validierung und Bereinigung der Konfiguration
        const allowedPermissions = [
            'VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES',
            'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS',
            'CONNECT', 'SPEAK', 'USE_VAD', 'STREAM'
        ];

        // Rollen bereinigen
        if (config.roles) {
            config.roles = config.roles.map(role => ({
                ...role,
                permissions: role.permissions?.filter(perm => 
                    allowedPermissions.includes(perm)
                ) || ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }));
        }

        // Kanäle begrenzen und bereinigen
        if (config.categories) {
            config.categories = config.categories.slice(0, 5);
            config.categories.forEach(category => {
                category.channels = category.channels?.slice(0, 8) || [];
                // Bereinige Channel-Beschreibungen
                category.channels.forEach(channel => {
                    if (channel.description) {
                        channel.description = this.sanitizeText(channel.description);
                    }
                });
            });
        }

        // Rollen begrenzen
        if (config.roles) {
            config.roles = config.roles.slice(0, 8);
        }

        return config;
    }

    sanitizeText(text) {
        if (!text) return text;
        
        // Entferne potentiell problematische Begriffe
        const problematicTerms = [
            'discord.gg', 'discord.com', 'invite', 'free nitro', 
            'hack', 'cheat', 'exploit', 'ban', 'kick'
        ];
        
        let sanitized = text;
        problematicTerms.forEach(term => {
            const regex = new RegExp(term, 'gi');
            sanitized = sanitized.replace(regex, 'gaming');
        });
        
        return sanitized;
    }
}

module.exports = AIProvider;