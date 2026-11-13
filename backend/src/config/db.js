const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDb,
    serverSelectionTimeoutMS: 15000,
  });

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
