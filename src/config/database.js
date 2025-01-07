const { Sequelize } = require('sequelize');
const { database } = require('./config');

const sequelize = new Sequelize(
    database.database,  // Database name
    database.username,  // Username
    database.password,  // Password
    {
        host: database.host,          // Host
        port: database.port,          // Port
        dialect: 'mariadb',                  // Use MariaDB
        logging: console.log,                // Optional: Enable logging for debugging
    }
);

// Test the connection
async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to the database has been established successfully.' + database.database);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
    }
}

module.exports = { sequelize, connectDatabase };
