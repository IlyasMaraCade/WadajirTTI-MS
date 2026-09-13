const mongoose = require('mongoose');
const { User } = require('./dist/models/User.model.js');
const { env } = require('./dist/config/env.js');

async function fix() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to DB');
  
  await User.deleteMany({ username: { $in: ['wadajir', 'teacher', 'register'] } });
  console.log('Deleted old conflicting users');
  
  process.exit(0);
}
fix();
