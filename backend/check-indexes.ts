import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected');
    const indexes = await mongoose.connection.db.collection('teachers').indexes();
    console.log(indexes);
    const userIndexes = await mongoose.connection.db.collection('users').indexes();
    console.log(userIndexes);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
