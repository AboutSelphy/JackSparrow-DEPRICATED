require('dotenv').config(); // Load environment variables from .env

//note: Import the necessary services and configurations
const { connectDatabase } = require('./config/database');
const { discordClient } = require('./config/discord');
const { connectTwitch } = require('./config/twitch');

// note: import functions
const eventHandler = require('./event/eventHandler');



const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Import routes (make sure you use the correct file paths)
const streamOnlineRoute = require('./event/streamOnline');
const streamOfflineRoute = require('./event/streamOffline');

const PORT = 3000;



// Initialize Database
async function initializeDatabase() {
    try {
        await connectDatabase(); // Establish DB connection
        console.log('✅ Database connected successfully!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Twitch Client
async function initializeTwitch() {
    try {
        await connectTwitch(); // Connect to Twitch
        console.log('✅ Connected to Twitch chat!');
    } catch (error) {
        console.error('❌ Twitch client initialization failed:', error.message);
        process.exit(1); // Exit if Twitch connection fails
    }
}

// Initialize Discord Bot
async function initializeDiscord() {
    try {
        discordClient.once('ready', () => {
            console.log('✅ Discord bot is online!');
        });
        await discordClient.login(process.env.DISCORD_BOT_TOKEN); // Log into Discord
    } catch (error) {
        console.error('❌ Discord client initialization failed:', error.message);
        process.exit(1); // Exit if Discord login fails
    }
}

// Start the services
async function startBot() {
    try {
        console.log('🚀 Starting bot initialization...');

        // Step 1: Initialize database
        await initializeDatabase();

        // Step 2: Initialize Twitch client
        await initializeTwitch();

        // Step 3: Initialize Discord bot
        await initializeDiscord();

        


        console.log('✅ Bot is fully initialized and running!');
    } catch (error) {
        console.error('❌ Fatal error during bot initialization:', error.message);
        process.exit(1); // Exit the application if critical failure occurs
    }
}

// Start the bot
startBot();


// Middleware
app.use(bodyParser.json()); // Use body parser to handle JSON requests
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); }})); // Store raw body

app.post('/eventsub', (req, res) => {
    console.log('🔔 Received Twitch EventSub:', req.body);
    res.sendStatus(200); // Acknowledge receipt
});


// Use routes
app.use('/eventsub', streamOnlineRoute); // Make sure the routes are used correctly
app.use('/eventssub', streamOfflineRoute); // Use the correct path for both online and offline routes

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${PORT}`);
});