const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ilyasmaracade_db_user:CoUvp0xInHuljTEu@cluster0.zsfuowp.mongodb.net/wadajir_institute_db?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const teachers = await mongoose.connection.collection('teachers').find({}).toArray();
  console.log('Found ' + teachers.length + ' teachers');
  for (let t of teachers) {
    if (!t.subjects || t.subjects.length === 0) {
      console.log('Updating teacher ' + t.fullName);
      await mongoose.connection.collection('teachers').updateOne(
        { _id: t._id },
        { $set: { subjects: ['Somali'] } }
      );
      await mongoose.connection.collection('subjects').updateOne(
        { name: 'Somali' },
        { $setOnInsert: { name: 'Somali', isActive: true } },
        { upsert: true }
      );
    }
  }
  process.exit(0);
});
