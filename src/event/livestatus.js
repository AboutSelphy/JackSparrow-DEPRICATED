const axios = require('axios');
const { twitch } = require('../config/config'); // Import the config file

// To track the current state of the stream (whether it's live or not)
let currentStreamStatus = false; // Initially, assume the stream is offline
let discordNotificationSent = false; // Flag to track whether the notification has already been sent

// Function to check if the stream is live
async function checkStreamLiveStatus() {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': twitch.clientId,
        'Authorization': `Bearer ${twitch.accessToken}`,
      },
      params: { user_login: twitch.channel },
    });

    const isLive = response.data.data.length > 0;
    currentStreamStatus = isLive;

    return isLive;
  } catch (error) {
    if (error.response) {
      console.error(`❌ Error checking live status: ${error.message}`);
      console.error(`    Status: ${error.response.status}`);
      console.error(`    Data: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(`    Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    } else {
      console.error(`❌ Error checking live status: ${error.message}`);
    }
    return false; // Return false if an error occurs, assuming stream is offline
  }
}

// Function to determine whether to send a Discord notification
async function shouldSendDiscordNotification() {
  const isLive = await checkStreamLiveStatus();

  if (isLive && !discordNotificationSent) {
    discordNotificationSent = true; // Mark that a notification has been sent
    return true;  // Indicate that we should send a Discord notification
  }

  // If the stream is not live or if the notification has already been sent, don't send it again
  if (!isLive) {
    discordNotificationSent = false; // Reset the notification flag when stream goes offline
  }

  return false;
}

// Function to determine if points can be collected
async function canCollectPoints() {
  const isLive = await checkStreamLiveStatus();
  return isLive;  // Return true if live, meaning points can be collected
}

module.exports = { checkStreamLiveStatus, shouldSendDiscordNotification, canCollectPoints };
