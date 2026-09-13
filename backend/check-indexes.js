require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    const sIndexes = await mongoose.connection.db.collection('subjects').indexes();
    console.log('SUBJECT INDEXES:', sIndexes);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
