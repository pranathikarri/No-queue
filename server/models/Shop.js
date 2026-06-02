const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Shop = sequelize.define('Shop', {
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  mapsUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  doctorName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  phoneNumber: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  ownerId: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  orgId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  ratingTotal: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxSlotsPerTimeSlot: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  timestamps: true
});

// Helper for average rating
Shop.prototype.getAvgRating = function() {
  return this.ratingCount > 0 
    ? (this.ratingTotal / this.ratingCount).toFixed(1) 
    : null;
};

module.exports = Shop;
