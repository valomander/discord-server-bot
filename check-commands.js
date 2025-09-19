const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔍 Überprüfe registrierte Commands...');

        // Hole registrierte Commands
        const commands = await rest.get(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
        );

        console.log(`\n📋 Gefundene Commands (${commands.length}):`);
        commands.forEach(cmd => {
            console.log(`- /${cmd.name}: ${cmd.description}`);
        });

        if (commands.length === 0) {
            console.log('\n❌ Keine Commands registriert!');
            console.log('Führe aus: node deploy-commands.js');
        }

    } catch (error) {
        console.error('❌ Fehler:', error);
    }
})();