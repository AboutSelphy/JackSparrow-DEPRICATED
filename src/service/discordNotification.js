const { EmbedBuilder } = require('discord.js');  // For Discord embed
const { discord, twitch } = require('../config/config'); // Import the config file
const discordClient = require('../config/discord');
const { checkStreamLiveStatus, shouldSendDiscordNotification } = require('../event/livestatus'); // Import the stream status functions

// Function to send a Discord notification with an embed
async function sendDiscordNotification() {
  try {
    // Create a new embed message using EmbedBuilder
    const embed = new EmbedBuilder()
    .setColor('#9146FF') // Twitch purple
    .setTitle(`🎉 ${twitch.channel} is live!`)
    .setDescription(status.title)
    .addFields({ name: 'Watch Now', value: `[Click here to join the stream!](${status.url})` })
    .setThumbnail('https://static-cdn.jtvnw.net/jtv_user_pictures/twitch-logo.png') // Optional: Twitch logo
    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitch.channel}-1280x720.jpg`) // Twitch live thumbnail
    .setFooter({ text: 'Powered by Twitch', iconURL: 'https://static-cdn.jtvnw.net/jtv_user_pictures/twitch-logo.png' })
    .setTimestamp();

    // Send the embed message to the Discord channel
    const channel = await discordClient.channels.cache.get(discord.channelSchedule);
    if (channel) {
      await channel.send({ embeds: [embed] });
      console.log('✅ Discord notification sent!');
    } else {
      console.error('❌ Channel not found');
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message);
  }
}

// Periodically check the stream status every minute (60000ms)
setInterval(async () => {
  try {
    const isLive = await checkStreamLiveStatus(); // Check if the stream is live
    console.log(`Stream live status: ${isLive ? 'Live' : 'Offline'}`); // Log stream status

    if (isLive) {
      console.log('✅ Stream is live!');
      
      // Log the notification decision
      const sendNotification = await shouldSendDiscordNotification(); // Check if notification should be sent
      console.log(`Should send notification: ${sendNotification}`);  // Debugging line

      if (sendNotification) {
        console.log('Sending Discord notification...');
        await sendDiscordNotification();  // Send the embedded message
      }
    } else {
      console.log('❌ Stream is offline');
    }
  } catch (error) {
    console.error('❌ Error checking stream status:', error.message);
  }
}, 60000);  // Check every minute (60000ms)
