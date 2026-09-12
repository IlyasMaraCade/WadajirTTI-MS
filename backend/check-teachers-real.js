const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ilyasmaracade_db_user:CoUvp0xInHuljTEu@cluster0.zsfuowp.mongodb.net/wadajir_institute_db?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const teachers = await mongoose.connection.collection('teachers').find({}).toArray();
  console.log(JSON.stringify(teachers, null, 2));
  process.exit(0);
});
