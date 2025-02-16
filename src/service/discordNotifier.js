const { EmbedBuilder } = require('discord.js'); // Import Embed for styling
const { discordClient } = require('../config/discord');
const { discord } = require('../config/config');


async function sendDiscordLiveNotification(streamerName, streamUrl) {
    try {
        const channel = await discordClient.channels.fetch(discord.channelSchedule);
        if (!channel) {
            console.error('❌ Discord channel not found!');
            return;
        }

        // Create an embed for the live notification
        const embed = new EmbedBuilder()
            .setColor(0x9146FF) // Twitch purple
            .setTitle('🎉 Stream is Live! 🎉')
            .setURL(streamUrl)
            .setDescription(`Come join the fun! **${streamerName}** is now live on Twitch!`)
            .addFields(
                { name: '🎮 Current Stream', value: `[Watch the stream right now!](${streamUrl})`, inline: false }
            )
            .setThumbnail(`https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png`) // Twitch logo
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamerName.toLowerCase()}-640x360.jpg`) // Live preview
            .setFooter({ text: 'Powered by Aboutselphy.com', iconURL: 'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png' })
            .setTimestamp();

        // Send the embedded message
        await channel.send({ embeds: [embed] });
        console.log(`✅ Sent live notification to Discord: ${streamerName} is live!`);
    } catch (error) {
        console.error('❌ Failed to send Discord notification:', error.message);
    }
}

module.exports = { sendDiscordLiveNotification };
