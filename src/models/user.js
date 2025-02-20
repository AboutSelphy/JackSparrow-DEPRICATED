const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 📦 Define the User model
const User = sequelize.define('User', {
    twitchId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    discordId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    subscriptionTier: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0 = no sub, 1 = Tier 1, 2 = Tier 2, 3 = Tier 3
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true // Adds createdAt & updatedAt
});

// 🚀 Main function: Sync DB and create test user
(async () => {
    try {
        await sequelize.sync({ alter: true }); // ✅ Create table if not exists or update structure
        console.log('✅ User table synced successfully.');

        const [user, created] = await User.findOrCreate({
            where: { twitchId: '12345' },
            defaults: {
                discordId: '123456',
                username: 'testuser',
                subscriptionTier: 1,
                profilePicture: 'https://static-cdn.jtvnw.net/jtv_user_pictures/testuser-profile_image.png'
            }
        });

        if (created) {
            console.log('[🎉] User created:', user.toJSON());
        } else {
            console.log('[ℹ️] User already exists:', user.toJSON());
        }
    } catch (error) {
        console.error('❌ Error syncing User table:', error.message);
    }
})();

module.exports = User;
