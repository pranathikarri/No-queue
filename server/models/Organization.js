const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Organization = sequelize.define('Organization', {
  orgId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  logoUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  adminPassword: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin'
  },
  accessCode: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Organization;
