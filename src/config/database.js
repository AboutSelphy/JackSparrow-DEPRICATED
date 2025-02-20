const { Sequelize } = require('sequelize');
const { database } = require('./config'); // Ensure this is correct

// Debug the database URL
if (!database || !database.url) {
  console.error('❌ Database URL is missing in the configuration.');
  process.exit(1); // Exit the application if the configuration is incorrect
}

// Create a Sequelize instance using the DATABASE_URL from the .env file
const sequelize = new Sequelize(database.url, {
  dialect: 'mariadb',
  logging: false, // Disable logging; set to true for debugging queries
  define: {
    timestamps: true, // Adds createdAt and updatedAt fields to tables
  },
});
// Test the connection
async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error; // Ensure the error is thrown so the bot stops if DB connection fails
  }
}


module.exports = { connectDatabase, sequelize }; 