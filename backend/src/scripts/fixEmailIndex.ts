// Run this once to fix the email index issue
// Usage: npx tsx src/scripts/fixEmailIndex.ts

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const fixIndex = async () => {
  const uri = process.env.MONGODB_URI!;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  try {
    // Drop the old unique email index so null emails are allowed
    await db.collection('users').dropIndex('email_1');
    console.log('✅ Dropped old unique email index');
  } catch (err: any) {
    if (err.codeName === 'IndexNotFound') {
      console.log('⚠️  Index email_1 not found — already dropped or never existed');
    } else {
      console.error('❌ Error dropping index:', err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done. You can now restart the backend.');
};

fixIndex();
