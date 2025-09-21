const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    try {
        const eventFiles = await fs.readdir(eventsPath);
        const jsFiles = eventFiles.filter(file => file.endsWith('.js'));
        
        for (const file of jsFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            
            logger.info(`Event geladen: ${event.name}`);
        }
        
        logger.info(`${jsFiles.length} Events erfolgreich geladen`);
    } catch (error) {
        logger.error('Fehler beim Laden der Events:', error);
    }
}

module.exports = { loadEvents };