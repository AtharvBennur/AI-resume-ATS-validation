const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }
  await mongoose.connect(uri);

  const database = mongoose.connection.db;
  const existingCollections = await database.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = new Set(existingCollections.map(({ name }) => name));
  for (const name of ['users', 'resumes', 'atsreports']) {
    if (!collectionNames.has(name)) {
      await database.createCollection(name);
    }
  }

  console.log(`MongoDB connected to database "${mongoose.connection.name}"`);
}

module.exports = connectDatabase;
