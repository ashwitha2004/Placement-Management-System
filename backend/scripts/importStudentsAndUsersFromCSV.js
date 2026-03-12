const fs = require('fs');
const path = require('path');

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student').default || require('../models/Student');
const User = require('../models/User').default || require('../models/User');

const csvPath = path.join(__dirname, '../data/students.csv');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_system';

async function importStudentsAndUsersFromCSV() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const data = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
  const header = data[0].split(',');
  const students = data.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = values[i] ? values[i].trim() : '';
    });
    // Map and convert fields as needed
    if (obj.Age) obj.age = Number(obj.Age);
    if (obj.CGPA) obj.cgpa = Number(obj.CGPA);
    if (obj.Internships) obj.internships = Number(obj.Internships);
    if (obj.Projects) obj.projects = Number(obj.Projects);
    if (obj.Coding_Skills) obj.codingSkills = Number(obj.Coding_Skills);
    if (obj.Communication_Skills) obj.communicationSkills = Number(obj.Communication_Skills);
    if (obj.Aptitude_Test_Score) obj.aptitudeTestScore = Number(obj.Aptitude_Test_Score);
    if (obj.Soft_Skills_Rating) obj.softSkillsRating = Number(obj.Soft_Skills_Rating);
    if (obj.Certifications) obj.certifications = Number(obj.Certifications);
    if (obj.Backlogs) obj.backlogs = Number(obj.Backlogs);
    obj.placementStatus = obj.Placement_Status || 'Not Placed';
    obj.degree = obj.Degree || 'B.Tech';
    obj.branch = obj.Branch;
    obj.gender = obj.Gender;
    obj.rollNumber = obj.Student_ID;
    return obj;
  });
  await Student.deleteMany({});
  await User.deleteMany({ role: 'student' });
  let imported = 0;
  for (const s of students) {
    const _id = s.rollNumber; // Use Student_ID as _id
    const email = `student${s.rollNumber}@demo.edu`;
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: `Student ${s.rollNumber}`,
      email,
      password,
      role: 'student'
    });
    const studentDoc = {
      _id, // Student_ID as _id
      user: user._id,
      rollNumber: s.rollNumber,
      branch: s.branch,
      cgpa: s.cgpa,
      age: s.age,
      gender: s.gender || 'Male',
      degree: s.degree,
      internships: s.internships,
      projects: [],
      codingSkills: s.codingSkills,
      communicationSkills: s.communicationSkills,
      aptitudeTestScore: s.aptitudeTestScore,
      softSkillsRating: s.softSkillsRating,
      certifications: s.certifications,
      backlogs: s.backlogs,
      placementStatus: s.placementStatus,
      isPlaced: s.placementStatus === 'Placed',
    };
    await Student.create(studentDoc);
    imported++;
  }
  console.log('Imported', imported, 'students and users from students.csv using Student_ID as _id');
  await mongoose.disconnect();
}

importStudentsAndUsersFromCSV().catch(err => {
  console.error(err);
  process.exit(1);
});
