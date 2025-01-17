// utils/blacklist.js
const { Blacklist } = require('../models/blacklist'); // Import the Blacklist model

/**
 * Checks if a user is blacklisted.
 * @param {string} username - The username to check.
 * @returns {boolean} - Returns true if the user is blacklisted, otherwise false.
 */
async function isBlacklisted(username) {
  try {
    // Check if user exists in the blacklist
    const blacklistedUser = await Blacklist.findOne({ where: { username } });

    if (blacklistedUser) {
      console.log(`❌ ${username} is blacklisted.`);
      return true; // User is blacklisted
    }

    return false; // User is not blacklisted
  } catch (error) {
    console.error(`❌ Error checking blacklist for ${username}:`, error.message);
    return false; // Default to not blacklisted if error occurs
  }
}

async function addStreamElementsToBlacklist() {
  try {
    // Create an entry for StreamElements in the blacklist
    const blacklistedUser = await Blacklist.create({
      username: 'StreamElements',
    });
    console.log('✅ StreamElements added to the blacklist:', blacklistedUser.username);
  } catch (error) {
    console.error('❌ Error adding StreamElements to blacklist:', error.message);
  }
}

// Call this function to add StreamElements to the blacklist
addStreamElementsToBlacklist();

module.exports = { isBlacklisted };
