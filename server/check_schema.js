const { sequelize } = require('./db');
const Organization = require('./models/Organization');

async function check() {
  try {
    const columns = await sequelize.getQueryInterface().describeTable('Organizations');
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
