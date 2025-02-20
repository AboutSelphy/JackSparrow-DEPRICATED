require('dotenv').config(); // Load environment variables from .env

const { connectDatabase } = require('./config/database');
const { discordClient } = require('./config/discord');
const { connectTwitch } = require('./config/twitch');
const { connectEventSub } = require('./event/twitchEventSub');


// Import the Express server for Twitch EventSub handling
// const { startTwitchEventListener } = require('./event/twitchEvent');

// Initialize Database
async function initializeDatabase() {
    try {
        await connectDatabase();
        console.log('✅ Database connected successfully!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Initialize Twitch Client
async function initializeTwitch() {
    try {
        await connectTwitch();
        console.log('✅ Connected to Twitch chat!');
    } catch (error) {
        console.error('❌ Twitch client initialization failed:', error.message);
        process.exit(1);
    }
}

// Initialize Discord Bot
async function initializeDiscord() {
    try {
        discordClient.once('ready', () => {
            console.log('✅ Discord bot is online!');
        });
        await discordClient.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
        console.error('❌ Discord client initialization failed:', error.message);
        process.exit(1);
    }
}


// Start all services
async function startBot() {
    try {
        console.log('🚀 Starting bot initialization...');
        await initializeDatabase();
        await initializeTwitch();
        await initializeDiscord();

        await connectEventSub(); // 🔥 Added EventSub WebSocket Connection

        // startTwitchEventListener(); // Starts the Twitch event listener
        console.log('✅ Bot is fully initialized and running!');
    } catch (error) {
        console.error('❌ Fatal error during bot initialization:', error.message);
        process.exit(1);
    }
}

// Start the bot
startBot();
