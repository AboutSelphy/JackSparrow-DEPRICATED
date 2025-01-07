const tmi = require('tmi.js');
const { twitch } = require('./config');

const twitchClient = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true, secure: true },
    identity: {
        username: twitch.botUsername,
        password: `oauth:${twitch.oauthToken}`,
    },
    channels: [twitch.channel],
});

module.exports = twitchClient;
