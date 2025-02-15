require('dotenv').config();

module.exports = {
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        botId: process.env.TWITCH_BOT_ID,
        broadcastId: process.env.TWITCH_BROADCAST_USERID,
        bearerToken: process.env.TWITCH_BEARER_TOKEN,
        oauthToken: process.env.TWITCH_OAUTH_TOKEN,
        callback: process.env.EVENTSUB_CALLBACK_URL,
        botUsername: process.env.TWITCH_BOT_USERNAME,
        channel: process.env.TWITCH_CHANNEL,
        secret: process.env.TWITCH_SECRET,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN,
        channelSchedule: process.env.DISCORD_CHANNEL_SCHEDULE,
    },
    database: {
        url: process.env.DATABASE_URL// Database name
    },
};
