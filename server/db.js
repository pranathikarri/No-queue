const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log // Temporary logging to debug slots
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Load models
    const Organization = require('./models/Organization');
    const Shop = require('./models/Shop');
    require('./models/Queue');
    require('./models/QueueState');
    require('./models/Slot');

    // Define Associations
    Shop.belongsTo(Organization, { foreignKey: 'orgId', as: 'organization' });
    Organization.hasMany(Shop, { foreignKey: 'orgId', as: 'shops' });

    await sequelize.sync({ alter: true });
    console.log('Successfully connected to SQLite database! 📂');
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
  }
};

module.exports = { sequelize, connectDB };
