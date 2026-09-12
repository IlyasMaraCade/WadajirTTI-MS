const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://localhost:27017/wadajir_institute_db";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB.");
  
  const result = await mongoose.connection.collection('subjects').deleteMany({});
  console.log(`Deleted ${result.deletedCount} subjects.`);
  
  process.exit(0);
}

run().catch(console.error);