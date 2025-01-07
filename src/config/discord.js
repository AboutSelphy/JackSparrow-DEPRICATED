const { Client, GatewayIntentBits } = require('discord.js');
const { discord } = require('./config');

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.login(discord.botToken);
module.exports = discordClient;
