const axios = require('axios');
const { twitch } = require('../config/config'); // Configuration for Twitch API
const User = require('../models/User'); // User model
const { isBlacklisted } = require('../utils/blacklist'); // Import blacklist functions

// Fetches the user ID and profile picture URL for a given username using Twitch Helix API
async function fetchUserInfo(username, token) {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': twitch.clientId,
        'Authorization': `Bearer ${twitch.accessToken}`, // Use the correct OAuth token
      },
      params: { login: username }, // Query the user's ID by their username
    });

    const userInfo = response.data.data[0];
    console.log(`Fetched user info for ${username}:`, userInfo);

    return {
      userId: userInfo.id,
      profilePicture: userInfo.profile_image_url, // Fetch the profile picture URL
    };
  } catch (error) {
    console.error(`❌ Error fetching user info for ${username}:`, error.response?.data || error.message);
    throw error; // Re-throw to allow upstream error handling
  }
}

// Modify this function to prevent point updates for blacklisted users
async function updateSubscriptionTier(username, user) {
  try {
    // Check if the user is blacklisted before proceeding with points and subscription updates
    if (await isBlacklisted(username)) {
      console.log(`❌ ${username} is blacklisted. Skipping point updates and subscription tier.`);
      return; // Skip the processing for blacklisted users
    }

    const [broadcasterInfo, userInfo] = await Promise.all([
      fetchUserInfo(twitch.channel, twitch.accessToken),
      fetchUserInfo(username, twitch.accessToken),
    ]);

    console.log(`Checking subscription for broadcaster ID: ${broadcasterInfo.userId} and user ID: ${userInfo.userId}`);

    const response = await axios.get('https://api.twitch.tv/helix/subscriptions', {
      headers: {
        'Client-ID': twitch.clientId,
        'Authorization': `Bearer ${twitch.accessToken}`,
      },
      params: {
        broadcaster_id: broadcasterInfo.userId,
        user_id: userInfo.userId,
      },
    });

    // Check if the response data is an array or an object
    if (Array.isArray(response.data.data)) {
      // Handle if it's an array
      if (response.data.data.length > 0) {
        const subscription = response.data.data[0];
        user.subscriptionTier = subscription.tier;
        console.log(`✅ ${username} is a subscriber. Subscription tier: ${subscription.tier}`);
      } else {
        user.subscriptionTier = 'none';
        console.log(`❌ ${username} is not a subscriber. Subscription tier set to 'none'`);
      }
    } else if (response.data.data && typeof response.data.data === 'object') {
      // Handle if it's an object and potentially has subscription data
      const subscription = response.data.data;
      user.subscriptionTier = subscription.tier || 'none';
      console.log(`✅ ${username} is a subscriber. Subscription tier: ${user.subscriptionTier}`);
    } else {
      // Handle unexpected response structure
      user.subscriptionTier = 'none';
      console.log(`❌ Unexpected subscription response for ${username}. Subscription tier set to 'none'`);
    }

    user.profilePicture = userInfo.profilePicture;
    await user.save();
    console.log(`✅ Subscription tier and profile picture updated for ${username}: ${user.subscriptionTier}`);
  } catch (error) {
    console.error(`❌ Error updating subscription tier for ${username}:`, error.message);
  }
}


// Fetch the list of active chatters in the channel and update the user table
async function fetchChatters() {
  try {
    // Fetch broadcaster and bot user IDs dynamically
    const [broadcasterInfo, botInfo] = await Promise.all([
      fetchUserInfo(twitch.channel, twitch.accessToken), // Broadcaster's info
      fetchUserInfo(twitch.botUsername, twitch.oauthToken), // Bot ID for moderator
    ]);

    console.log('Fetching chatters...');
    const response = await axios.get('https://api.twitch.tv/helix/chat/chatters', {
      headers: {
        'Client-ID': twitch.clientId,
        'Authorization': `Bearer ${twitch.oauthToken}`, // Bot's OAuth token
      },
      params: {
        broadcaster_id: broadcasterInfo.userId,
        moderator_id: botInfo.userId, // Pass bot ID for correct permissions
      },
    });

    console.table(`Fetched chatters:`, response.data.data);

    // Extract usernames from the API response
    const chatters = response.data.data.map(chatter => chatter.user_name);

    // Update user table with chatters
    for (const username of chatters) {
      const [user, created] = await User.findOrCreate({
        where: { username },
        defaults: { points: 0, subscriptionTier: 'none', profilePicture: '' }, // Default empty profile picture
      });

      // Update subscription tier and profile picture for the user
      await updateSubscriptionTier(username, user);
    }

    return chatters;
  } catch (error) {
    console.error('❌ Error fetching or updating chatters:', error.response?.data || error.message);
    return [];
  }
}

module.exports = { fetchChatters, updateSubscriptionTier };
