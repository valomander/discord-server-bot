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
                logger.info('Rufe Ollama auf...');
                response = await this.callOllama(prompt);
            } else if (this.provider === 'openrouter') {
                logger.info('Rufe OpenRouter auf...');
                response = await this.callOpenRouter(prompt);
            }
            
            if (!response) {
                logger.warn('Keine Antwort von KI-Service erhalten, verwende Fallback');
                return this.getFallbackConfig();
            }
            
            return this.parseResponse(response);
        } catch (error) {
            logger.error('Fehler bei KI-Anfrage:', error);
            logger.warn('Verwende Fallback-Konfiguration aufgrund von KI-Fehler');
            return this.getFallbackConfig();
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
          "description": "string",
          "permissions": {
            "private": false
          }
        }
      ]
    }
  ],
  "roles": [
    {
      "name": "string",
      "permissions": ["SEND_MESSAGES", "VIEW_CHANNEL"],
      "color": "#hexcode",
      "mentionable": false
    }
  ],
  "rules": "string mit Server-Regeln",
  "welcomeMessage": "string für Begrüßungsnachricht"
}

Wichtige Regeln:
- Erstelle NIEMALS Rollen mit ADMINISTRATOR-Berechtigung
- Maximiere 15 Kanäle und 8 Rollen
- Verwende IMMER schöne Channel-Namen mit Emojis (📋, 💬, 🔧, 🎮, 🚀, etc.)
- Verwende ASCII-Zeichen für bessere Formatierung (├, ┬, └, ─, ║, etc.)
- Channel-Berechtigungen: private=true für Staff-Kanäle, private=false für öffentliche
- Staff-Kanäle sind nur für Admin/Moderator/Staff sichtbar
- Antwort muss gültiges JSON sein ohne zusätzlichen Text`;

        const enhancedUserInput = `Erstelle eine Server-Konfiguration basierend auf: ${userInput.join(', ')}

WICHTIGE FORMATIERUNGS-REGELN:
- Verwende IMMER passende Emojis für Channel-Namen: 📋 für Regeln, 💬 für Chat, 🔧 für Support, 🎮 für Gaming, 🎵 für Musik, 📸 für Screenshots
- Nutze ASCII-Zeichen für Strukturierung: ├─, ┬─, └─, ║, ═
- Setze "private": true für Administrative Kanäle (Admin, Mod, Staff)
- Setze "private": false für öffentliche Community-Kanäle
- Channel-Namen sollten kreativ und ansprechend sein
- Voice-Kanäle dürfen KEINE description haben
- WICHTIG: Antworte nur mit validem JSON ohne Kommentare

BEISPIEL-FORMATE:
- "📋├─regeln-und-info"
- "💬┬─allgemeiner-chat"
- "🔧║mod-bereich"
- "🎮└─gaming-lobby"
- "📸┬─screenshots-gallery"`;

        return {
            system: systemPrompt,
            user: enhancedUserInput
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
            logger.info('KI-Antwort erhalten, Länge:', response?.length || 0);
            
            // Prüfe ob Antwort leer oder ungültig ist
            if (!response || response.trim().length === 0) {
                logger.error('Leere KI-Antwort erhalten');
                return this.getFallbackConfig();
            }
            
            // Bereinige die Antwort von möglichen Kommentaren und ungültigen Zeichen
            let cleanedResponse = response;
            
            // Entferne Kommentare in Klammern aus JSON
            cleanedResponse = cleanedResponse.replace(/\([^)]*\)/g, '');
            
            // Entferne JavaScript-style Kommentare
            cleanedResponse = cleanedResponse.replace(/\/\/.*$/gm, '');
            cleanedResponse = cleanedResponse.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Extrahiere JSON aus der Antwort
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                logger.warn('Kein JSON gefunden, verwende Fallback-Config');
                return this.getFallbackConfig();
            }
            
            let jsonString = jsonMatch[0];
            
            // Weitere Bereinigung für häufige JSON-Fehler
            jsonString = jsonString.replace(/,\s*}/g, '}'); // Entferne trailing commas
            jsonString = jsonString.replace(/,\s*]/g, ']'); // Entferne trailing commas in arrays
            
            const config = JSON.parse(jsonString);
            logger.info('JSON erfolgreich geparst');
            return this.validateAndSanitize(config);
            
        } catch (error) {
            logger.error('Fehler beim Parsen der KI-Antwort:', error);
            logger.error('Original Response (erste 500 Zeichen):', response?.substring(0, 500) || 'LEER');
            logger.warn('Verwende Fallback-Konfiguration');
            return this.getFallbackConfig();
        }
    }

    getFallbackConfig() {
        return {
            serverName: "KI-Server",
            categories: [
                {
                    name: "📋 Information",
                    channels: [
                        {
                            name: "📋├─regeln",
                            type: "text",
                            description: "Server-Regeln und wichtige Informationen",
                            permissions: { private: false }
                        },
                        {
                            name: "💬├─willkommen",
                            type: "text", 
                            description: "Begrüßung neuer Mitglieder",
                            permissions: { private: false }
                        }
                    ]
                },
                {
                    name: "💬 Community",
                    channels: [
                        {
                            name: "💬┬─allgemein-chat",
                            type: "text",
                            description: "Allgemeiner Chat für alle Themen",
                            permissions: { private: false }
                        },
                        {
                            name: "🎮├─gaming-talk",
                            type: "text",
                            description: "Diskussionen über Spiele",
                            permissions: { private: false }
                        },
                        {
                            name: "🔊└─voice-chat",
                            type: "voice",
                            permissions: { private: false }
                        }
                    ]
                },
                {
                    name: "🔧 Moderation",
                    channels: [
                        {
                            name: "🔧║mod-bereich",
                            type: "text",
                            description: "Privater Bereich für Moderatoren",
                            permissions: { private: true }
                        }
                    ]
                }
            ],
            roles: [
                {
                    name: "Moderator",
                    permissions: ["MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"],
                    color: "#ff6b6b",
                    mentionable: false
                },
                {
                    name: "Mitglied",
                    permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    color: "#4ecdc4",
                    mentionable: false
                }
            ],
            rules: "Willkommen auf unserem Server! Bitte verhaltet euch respektvoll und haltet euch an die Discord-Nutzungsbedingungen.",
            welcomeMessage: "Herzlich willkommen! Lest euch die Regeln durch und habt Spaß in unserer Community!"
        };
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
                // Bereinige Channel-Beschreibungen (nur für Text-Kanäle)
                category.channels.forEach(channel => {
                    if (channel.description) {
                        channel.description = this.sanitizeText(channel.description);
                    }
                    // Voice-Kanäle dürfen keine Beschreibung haben
                    if (channel.type === 'voice') {
                        delete channel.description;
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