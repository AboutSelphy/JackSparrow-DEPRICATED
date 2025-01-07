const axios = require('axios');
const { twitch } = require('../config/config'); // Import the config file

// To track the current state of the stream (whether it's live or not)
let previousStreamStatus = false; // To store the last known state of the stream
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

  // Detect state change: Offline -> Live
  if (isLive && !previousStreamStatus) {
    console.log('🔄 Stream transitioned to live!');
    discordNotificationSent = false; // Reset notification flag on new live state
  }

  // Send notification if live and notification not yet sent
  if (isLive && !discordNotificationSent) {
    discordNotificationSent = true; // Mark notification as sent
    previousStreamStatus = isLive; // Update the previous state
    return true; // Allow sending the notification
  }

  // Detect state change: Live -> Offline
  if (!isLive && previousStreamStatus) {
    console.log('🔄 Stream transitioned to offline!');
    discordNotificationSent = false; // Reset the notification flag
  }

  previousStreamStatus = isLive; // Update the previous state
  return true; // Do not allow notification
}

// Function to determine if points can be collected
async function canCollectPoints() {
  const isLive = await checkStreamLiveStatus();
  return isLive; // Return true if live, meaning points can be collected
}

// Periodically check the stream status every minute (60000ms)
setInterval(async () => {
  const isLive = await checkStreamLiveStatus(); // Check the live status of the stream
  const sendNotification = await shouldSendDiscordNotification(); // Check if a notification should be sent

  if (sendNotification) {
    console.log('🔄 Sending Discord notification...');
    // Call your Discord notification function here
  }

  const canCollect = await canCollectPoints(); // Check if points can be collected
  if (canCollect) {
    console.log('✅ Stream is live, points can be collected!');
  } else {
    console.log('❌ Stream is offline, no points to collect.');
  }
}, 60000); // Check every minute (60000ms)

module.exports = { checkStreamLiveStatus, shouldSendDiscordNotification, canCollectPoints };
