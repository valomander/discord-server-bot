const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeigt alle verfügbaren Commands des KI Server-Creator Bots'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 KI Server-Creator Bot - Hilfe')
            .setDescription('Hier sind alle verfügbaren Befehle:')
            .setColor('#00ff88')
            .addFields(
                {
                    name: '📋 `/create-server`',
                    value: 'Erstellt automatisch einen kompletten Discord-Server mit KI-Unterstützung\n*Benötigt: Server verwalten Berechtigung*',
                    inline: false
                },
                {
                    name: '📊 `/server-status`',
                    value: 'Zeigt den Status der letzten Server-Erstellung an',
                    inline: false
                },
                {
                    name: '📚 `/templates`',
                    value: 'Zeigt verfügbare Server-Templates an',
                    inline: false
                },
                {
                    name: '🆘 `/help`',
                    value: 'Zeigt diese Hilfe-Nachricht an',
                    inline: false
                },
                {
                    name: '🗑️ `/delete-all`',
                    value: 'ACHTUNG: Löscht ALLE Kanäle und Rollen\n*Benötigt: Administrator Berechtigung*',
                    inline: false
                },
                {
                    name: '🎯 `/delete-selective`',
                    value: 'Lösche bestimmte Kanäle, Kategorien oder Rollen gezielt\n*Benötigt: Server verwalten Berechtigung*',
                    inline: false
                },
                {
                    name: '📊 `/bot-stats`',
                    value: 'Zeigt Bot-Statistiken und Multi-Server Informationen',
                    inline: false
                }
            )
            .addFields(
                {
                    name: '🎯 Wie funktioniert es?',
                    value: '1. Verwende `/create-server`\n2. Wähle eine Vorlage oder erstelle einen benutzerdefinierten Server\n3. Beantworte die Fragen\n4. Die KI generiert eine Server-Struktur\n5. Bestätige die Erstellung',
                    inline: false
                },
                {
                    name: '🔧 Verfügbare Templates',
                    value: '🎮 Gaming-Community\n💼 Projektteam\n🎓 Lern-/Studiengruppe\n🌐 Allgemeine Community\n🎨 Kreativ-Community\n⚙️ Benutzerdefiniert',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Bot entwickelt von Valentin | Powered by KI',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
};