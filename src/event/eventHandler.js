const { sendDiscordLiveNotification } = require('../service/discordNotifier');

function handleStreamEvent(event) {
    const eventType = event.event.type;
    const streamerName = event.event.broadcaster_user_name;
    const streamUrl = `https://www.twitch.tv/${event.event.broadcaster_user_login}`;

    switch (eventType) {
        case 'live':
            console.log(`🎥 ${streamerName} is now live!`);
            sendDiscordLiveNotification(streamerName, streamUrl);
            break;

        case 'stream.offline':
            console.log(`⛔ ${streamerName} is now offline.`);
            break;

        default:
            console.log(`⚠️ Unknown event type: ${eventType}`);
    }
}

module.exports = { handleStreamEvent };
