const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔄 Lösche alle Commands...');
        
        // Lösche alle globalen Commands
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] }
        );
        
        console.log('✅ Alle Commands gelöscht');
        
        // Warte kurz
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📝 Registriere Commands neu...');
        
        // Lade Commands neu
        const fs = require('node:fs');
        const path = require('node:path');
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'src/commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Command vorbereitet: ${command.data.name}`);
            }
        }
        
        // Registriere Commands neu
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        
        console.log(`🎉 ${data.length} Commands erfolgreich neu registriert!`);
        console.log('\n⏰ Warte 1-2 Minuten, dann sollten die Commands in Discord verfügbar sein.');
        
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
})();