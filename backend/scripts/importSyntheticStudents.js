const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const csvPath = path.join(__dirname, '../data/synthetic_btech_students.csv');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_system';

async function importStudents() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const data = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
  const header = data[0].split(',');
  const students = data.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = values[i] ? values[i].trim() : '';
    });
    // Convert _id to ObjectId
    if (obj._id) obj._id = new mongoose.Types.ObjectId(obj._id);
    if (obj.age) obj.age = Number(obj.age);
    if (obj.cgpa) obj.cgpa = Number(obj.cgpa);
    return obj;
  });
  await Student.deleteMany({});
  await Student.insertMany(students);
  console.log('Imported', students.length, 'students');
  await mongoose.disconnect();
}

importStudents().catch(err => {
  console.error(err);
  process.exit(1);
});
