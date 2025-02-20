// models/blacklist.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Ensure correct database connection

const Blacklist = sequelize.define('Blacklist', {
  twitchId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure each user is unique in the blacklist
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true, // Adds createdAt & updatedAt fields
});

// ✅ Sync the table if it doesn't exist
(async () => {
    try {
        await sequelize.sync({ alter: true }); // ✅ Create table if not exists or update structure
        console.log('✅ Blacklist table synced successfully.');

        const [blacklist, created] = await Blacklist.findOrCreate({
            where: { twitchId: '12345' },
            defaults: {
                username: 'testuser',
                reason: 'test user'
            }
        });

        if (created) {
            console.log('[🎉] Black list User created:', blacklist.toJSON());
        } else {
            console.log('[ℹ️] User already exists:', blacklist.toJSON());
        }
    } catch (error) {
        console.error('❌ Error syncing User table:', error.message);
    }
})();

module.exports = Blacklist;
