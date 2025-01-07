const { Sequelize } = require('sequelize');
const { database } = require('./config');

// Create a Sequelize instance using the DATABASE_URL from the .env file
const sequelize = new Sequelize(database.url, {
  dialect: 'mysql',
  protocol: 'mysql',
  logging: false // Set to `true` for debugging queries
});

module.exports = sequelize;
