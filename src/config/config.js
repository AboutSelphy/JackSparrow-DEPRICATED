require('dotenv').config();

module.exports = {
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        botId: process.env.TWITCH_BOT_ID,
        accessToken: process.env.TWITCH_ACCESS_TOKEN,
        oauthToken: process.env.TWITCH_OAUTH_TOKEN,
        botUsername: process.env.TWITCH_BOT_USERNAME,
        channel: process.env.TWITCH_CHANNEL,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN,
        channelSchedule: process.env.DISCORD_CHANNEL_SCHEDULE,
    },
    database: {
        url: process.env.DATABASE_URL// Database name
    },
};
