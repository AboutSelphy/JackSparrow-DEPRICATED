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

// Connect the client
async function connectTwitch() {
    try {
      await twitchClient.connect(); // This will initiate the connection to Twitch
      console.log('✅ Twitch client connected!');
    } catch (error) {
      console.error('❌ Twitch client connection failed:', error.message);
      throw error; // Stop execution on error
    }
  }
  
  module.exports = { twitchClient, connectTwitch };
