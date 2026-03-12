const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student').default || require('../models/Student');
const User = require('../models/User').default || require('../models/User');

const csvPath = path.join(__dirname, '../data/synthetic_btech_students.csv');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_system';

async function importStudentsAndUsers() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const data = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
  const header = data[0].split(',');
  const students = data.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = values[i] ? values[i].trim() : '';
    });
    if (obj.age) obj.age = Number(obj.age);
    if (obj.cgpa) obj.cgpa = Number(obj.cgpa);
    return obj;
  });
  await Student.deleteMany({});
  await User.deleteMany({ role: 'student' });
  let imported = 0;
  for (const s of students) {
    // Create user
    const email = `${s.rollNumber.toLowerCase()}@demo.edu`;
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: s.name,
      email,
      password,
      role: 'student'
    });
    // Create student
    const studentDoc = {
      user: user._id,
      rollNumber: s.rollNumber,
      branch: s.branch,
      cgpa: s.cgpa,
      age: s.age,
      gender: s.gender || 'Male',
      degree: 'B.Tech',
      placementStatus: s.placementStatus || (s.company !== 'None' ? 'Placed' : 'Not Placed'),
      isPlaced: s.placementStatus === 'Placed' || s.company !== 'None',
      ...s
    };
    await Student.create(studentDoc);
    imported++;
  }
  console.log('Imported', imported, 'students and users');
  await mongoose.disconnect();
}

importStudentsAndUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
