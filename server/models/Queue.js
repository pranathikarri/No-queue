const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Queue = sequelize.define('Queue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('waiting', 'serving', 'completed', 'skipped'),
    defaultValue: 'waiting'
  },
  scheduledDate: {
    type: DataTypes.STRING, // Format YYYY-MM-DD
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'joinedAt'
});

module.exports = Queue;
