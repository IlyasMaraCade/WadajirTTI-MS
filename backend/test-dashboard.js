const mongoose = require('mongoose');
const { Teacher } = require('./src/models/Teacher.model');
const User = require('./src/models/User.model').default;
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect('mongodb+srv://ilyasmaracade_db_user:CoUvp0xInHuljTEu@cluster0.zsfuowp.mongodb.net/wadajir_institute_db?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const teacher = await Teacher.findOne({});
  if (!teacher) return console.log('No teacher');
  const user = await User.findById(teacher.user);
  
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, status: user.status },
    process.env.ACCESS_TOKEN_SECRET || 'wadajir_dev_access_secret_change_in_production_32ch',
    { expiresIn: '15m' }
  );
  
  const http = require('http');
  const req = http.request('http://localhost:5000/api/v1/teacher/dashboard', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  });
  req.on('error', e => console.error(e));
  req.end();
});
