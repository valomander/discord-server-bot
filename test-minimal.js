// Minimaler Test ohne Datenbank
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log('✅ Bot erfolgreich verbunden!');
    console.log(`Eingeloggt als: ${client.user.tag}`);
    console.log(`Bot ist auf ${client.guilds.cache.size} Servern`);
    
    // Test Discord API Berechtigungen
    client.guilds.cache.forEach(guild => {
        const permissions = guild.members.me.permissions;
        console.log(`\nServer: ${guild.name}`);
        console.log(`- Kanäle verwalten: ${permissions.has('ManageChannels') ? '✅' : '❌'}`);
        console.log(`- Rollen verwalten: ${permissions.has('ManageRoles') ? '✅' : '❌'}`);
        console.log(`- Nachrichten senden: ${permissions.has('SendMessages') ? '✅' : '❌'}`);
    });
    
    process.exit(0);
});

client.on('error', (error) => {
    console.error('❌ Discord Client Fehler:', error);
    process.exit(1);
});

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN nicht in .env gefunden!');
    process.exit(1);
}

console.log('🔗 Verbinde mit Discord...');
client.login(process.env.DISCORD_TOKEN);