const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.STRING,
    defaultValue: () => Math.random().toString(36).substr(2, 9),
    primaryKey: true
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING, // YYYY-MM-DD
    allowNull: false
  },
  timeRange: {
    type: DataTypes.STRING, // e.g. "09:00 AM - 10:00 AM"
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  timestamps: true
});

module.exports = Slot;
