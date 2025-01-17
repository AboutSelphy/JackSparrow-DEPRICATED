const axios = require('axios');
const { twitch } = require('../config/config'); // Import the config file

let previousStreamStatus = false;  // To store the last known state of the stream
let discordNotificationSent = false;  // Flag to track whether the notification has already been sent

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

    return response.data.data.length > 0;  // Return true if stream is live
  } catch (error) {
    console.error(`❌ Error checking live status: ${error.message}`);
    return false;  // Return false if an error occurs, assuming stream is offline
  }
}

// Function to determine whether to send a Discord notification
async function shouldSendDiscordNotification() {
  const isLive = await checkStreamLiveStatus();
  
  console.log(`Stream live status: ${isLive ? 'Live' : 'Offline'}`);
  console.log(`Previous state: ${previousStreamStatus ? 'Live' : 'Offline'}`);
  console.log(`Notification sent? ${discordNotificationSent ? 'Yes' : 'No'}`);

  // If the stream has transitioned to live and it was previously offline
  if (isLive && !previousStreamStatus) {
    console.log('🔄 Stream transitioned to live!');
    discordNotificationSent = false; // Reset notification flag when transitioning to live
  }

  // If the stream has transitioned to offline, reset notification flag
  if (!isLive && previousStreamStatus) {
    console.log('🔄 Stream transitioned to offline!');
    discordNotificationSent = false; // Reset notification flag when transitioning to offline
  }

  // Only send notification if live and flag is false
  if (isLive && !discordNotificationSent) {
    console.log('🔄 Allowing notification send!');
    discordNotificationSent = true; // Mark notification as sent
    previousStreamStatus = isLive; // Update the previous state
    return true; // Allow sending the notification
  }

  previousStreamStatus = isLive; // Update the previous state to current status
  return false; // Do not send notification if already sent or stream is not live
}



// Function to determine if points can be collected
async function canCollectPoints() {
  const isLive = await checkStreamLiveStatus();
  return isLive;  // Return true if live, meaning points can be collected
}

// Periodically check the stream status every minute (60000ms)
setInterval(async () => {
  try {
    const isLive = await checkStreamLiveStatus(); // Check if the stream is live
    console.log(`Stream live status: ${isLive ? 'Live' : 'Offline'}`); // Log stream status

    // Ensure notification only happens when transitioning to live
    const sendNotification = await shouldSendDiscordNotification(); // Check if notification should be sent
    console.log(`Should send notification: ${sendNotification}`);  // Debugging line

    if (sendNotification) {
      console.log('Sending Discord notification...');
      await sendDiscordNotification();  // Send the embedded message
      discordNotificationSent = true;  // Set flag to true, so notification won't be sent again until stream goes offline
    }

    if (!isLive && discordNotificationSent) {
      console.log('❌ Stream is offline');
      discordNotificationSent = false;  // Reset the flag when stream goes offline
    }

  } catch (error) {
    console.error('❌ Error checking stream status:', error.message);
  }
}, 60000);  // Check every minute (60000ms)



module.exports = { checkStreamLiveStatus, shouldSendDiscordNotification, canCollectPoints };
