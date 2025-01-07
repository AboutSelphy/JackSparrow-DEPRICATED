require('dotenv').config();

module.exports = {
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        accessToken: process.env.TWITCH_ACCESS_TOKEN,
        oauthToken: process.env.TWITCH_OAUTH_TOKEN,
        botUsername: process.env.TWITCH_BOT_USERNAME,
        channel: process.env.TWITCH_CHANNEL,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN,
        channelId: process.env.DISCORD_CHANNEL_ID,
    },
    database: {
        host: process.env.DATABASE_HOST,      // e.g., 'localhost'
        port: process.env.DATABASE_PORT,      // e.g., '3306'
        username: process.env.DATABASE_USER,  // Database username
        password: process.env.DATABASE_PASSWORD,  // Database password
        database: process.env.DATABASE_NAME,  // Database name
    },
};
