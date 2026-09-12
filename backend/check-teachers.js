const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wadajir_institute_db').then(async () => {
  const teachers = await mongoose.connection.collection('teachers').find({}).toArray();
  console.log(JSON.stringify(teachers, null, 2));
  process.exit(0);
});
