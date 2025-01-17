// event/pointTracking.js
const { fetchChatters } = require('../utils/fetchChatters'); // Import the fetchChatters function
const User = require('../models/user'); // Import the User model
const { canCollectPoints } = require('../event/livestatus'); // Check if stream is live
const { isBlacklisted } = require('../utils/blacklist'); // Import the blacklist check function

/**
 * Updates points for chatters in the database.
 * @param {string[]} chatters - Array of usernames currently in the chat.
 */
async function updatePoints(chatters) {
  try {
    for (const username of chatters) {
      // Check if the user is blacklisted before updating points
      const blacklisted = await isBlacklisted(username);
      if (blacklisted) {
        console.log(`❌ Skipping points update for blacklisted user: ${username}`);
        continue; // Skip blacklisted users
      }

      // Fetch or create the user
      const [user, created] = await User.findOrCreate({
        where: { username },
        defaults: { points: 0, subscriptionTier: 'none' },
      });

      // Calculate points multiplier based on subscription tier
      let multiplier = 1;
      if (user.subscriptionTier === 'tier1') multiplier = 1.2;
      if (user.subscriptionTier === 'tier2') multiplier = 1.5;
      if (user.subscriptionTier === 'tier3') multiplier = 2;

      // Update user points
      user.points += Math.ceil(10 * multiplier); // 10 points per minute with multiplier
      await user.save();
    }

    console.log('✅ Points updated successfully for all chatters.');
  } catch (error) {
    console.error('❌ Error updating points:', error.message);
  }
}

/**
 * Periodically tracks points for chatters every minute.
 */
async function trackPoints() {
  try {
    // Check if stream is live
    const isLive = await canCollectPoints();
    if (!isLive) {
      console.log('❌ Stream is offline. Points collection skipped.');
      return;
    }

    // Fetch active chatters
    const chatters = await fetchChatters();
    if (chatters.length === 0) {
      console.log('❌ No active chatters found.');
      return;
    }

    console.log(`✅ Active chatters: ${chatters.join(', ')}`);
    await updatePoints(chatters); // Update points for the chatters
  } catch (error) {
    console.error('❌ Error tracking points:', error.message);
  }
}

// Run point tracking every minute (60000ms)
setInterval(trackPoints, 60000); // 1-minute interval

module.exports = { trackPoints };
