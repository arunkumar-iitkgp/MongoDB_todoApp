const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Connect to an in-memory MongoDB instance before all tests.
 * Each test run gets a fresh, isolated database.
 */
const connect = async () => {
    const mongoServer = await MongoMemoryServer.create({
        binary: {
            version: '7.0.12'
        }
    });

    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
};

/**
 * Clear all data after each test so tests don't interfere with each other.
 */
const clearData = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect and stop the in-memory server after all tests.
 */
const close = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connect, clearData, close };

