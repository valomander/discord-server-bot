const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    try {
        const commandFiles = await fs.readdir(commandsPath);
        const jsFiles = commandFiles.filter(file => file.endsWith('.js'));
        
        for (const file of jsFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                logger.info(`Command geladen: ${command.data.name}`);
            } else {
                logger.warn(`Command ${file} hat nicht die erforderliche Struktur (data & execute)`);
                console.log('Command Inhalt:', Object.keys(command));
            }
        }
        
        logger.info(`${jsFiles.length} Commands erfolgreich geladen`);
    } catch (error) {
        logger.error('Fehler beim Laden der Commands:', error);
    }
}

module.exports = { loadCommands };