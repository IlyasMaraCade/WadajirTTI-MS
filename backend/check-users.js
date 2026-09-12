const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wadajir_institute_db').then(async () => {
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
});
