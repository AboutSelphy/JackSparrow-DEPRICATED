const { Client, GatewayIntentBits } = require('discord.js');  // Import for v14
const { discord } = require('./config');  // Import your configuration

// Initialize the Discord client with the correct intents for v14
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,             // Guilds intent for the bot to access server details
    GatewayIntentBits.GuildMessages,      // Guild messages intent for reading messages
    GatewayIntentBits.MessageContent      // Message content intent for accessing message content (needed for newer versions)
  ]
});

discordClient.login(discord.botToken);  // Log in using the bot token from your config

async function connectDiscord() {
  try {
    await discordClient.login(process.env.DISCORD_BOT_TOKEN);  // Ensure the token is correct
    console.log('✅ Discord bot is online!');
  } catch (error) {
    console.error('❌ Discord client login failed:', error.message);
    throw error; // Stop execution on error
  }
}

// Export the client and the connect function
module.exports = { discordClient, connectDiscord };
