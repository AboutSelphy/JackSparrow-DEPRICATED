// models/Blacklist.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Ensure correct database connection

const Blacklist = sequelize.define('Blacklist', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure each user is unique in the blacklist
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = { Blacklist };
