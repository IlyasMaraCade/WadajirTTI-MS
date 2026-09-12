const mongoose = require('mongoose');
mongoose.connect('').then(async () => {
  const teachers = await mongoose.connection.collection('teachers').find({}).toArray();
  for (let t of teachers) {
    console.log('Teacher: ' + t.fullName + ', Subjects: ' + JSON.stringify(t.subjects));
  }
  process.exit(0);
});
