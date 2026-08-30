// Cleans up any broken user docs without a username (old email-only users)
// Usage: npx tsx src/scripts/cleanUsers.ts

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const clean = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.db!.collection('users').deleteMany({
    username: { $exists: false }
  });
  console.log(`✅ Deleted ${result.deletedCount} old user document(s) without a username`);

  await mongoose.disconnect();
  console.log('Done. Restart the backend now to seed fresh users.');
};

clean();
