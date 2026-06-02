const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const QueueState = sequelize.define('QueueState', {
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  currentServingNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalQueue: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageServiceTime: {
    type: DataTypes.INTEGER,
    defaultValue: 10 // in minutes
  }
}, {
  timestamps: true
});

module.exports = QueueState;
