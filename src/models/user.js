const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  subscriptionTier: {
    type: DataTypes.STRING,
    defaultValue: 'none', // 'none', 'tier1', 'tier2', 'tier3'
  },
  profilePicture: {
    type: DataTypes.STRING, // Store the URL of the profile picture
    allowNull: true,
  },
});

(async () => {
  try {
    await sequelize.sync();
    console.log('✅ User table synced successfully');
  } catch (error) {
    console.error('❌ Error syncing User table:', error.message);
  }
})();

module.exports = User;
