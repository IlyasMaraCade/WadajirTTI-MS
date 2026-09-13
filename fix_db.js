const mongoose = require('mongoose');
const { User } = require('./backend/dist/models/User.model.js');
const { Teacher } = require('./backend/dist/models/Teacher.model.js');
const { env } = require('./backend/dist/config/env.js');

async function fix() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to DB');
  
  await User.deleteMany({ username: { $in: ['wadajir', 'teacher', 'register'] } });
  console.log('Deleted old conflicting users');
  
  process.exit(0);
}
fix();
