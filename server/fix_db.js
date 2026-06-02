const { sequelize } = require('./db');
const Organization = require('./models/Organization');

async function fix() {
  try {
    await sequelize.authenticate();
    // Manual column addition for SQLite if alter failed
    try {
      await sequelize.getQueryInterface().addColumn('Organizations', 'adminPassword', {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
        defaultValue: 'admin'
      });
      console.log('Added adminPassword column successfully.');
    } catch (e) {
      console.log('Column might already exist or error:', e.message);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
