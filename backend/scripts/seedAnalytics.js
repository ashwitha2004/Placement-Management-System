// backend/scripts/seedAnalytics.js
import mongoose from 'mongoose';
import PlacementStatistics from '../models/PlacementStatistics.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function seedAnalytics() {
  await mongoose.connect(MONGO_URI);

  const analyticsDoc = new PlacementStatistics({
    company: 'GenAI Corp',
    position: 'All',
    salary: 12,
    currency: 'INR',
    placementRate: 90,
    averagePackage: 13.5,
    highestPackage: 23,
    lowestPackage: 8,
    totalStudentsPlaced: 250,
    year: 2026,
    branch: ['CSE', 'IT', 'ECE'],
    jobType: 'Full-time',
    location: 'India',
    recruiter: 'HR Team',
    skills: ['Python', 'Java', 'React'],
    avgAge: 27,
    avgWorkingYears: 3,
    attrition: 5,
    attritionRate: 2.1,
    attritionByEducation: { Bachelors: 2, Masters: 3, PhD: 0 },
    attritionByAge: { '20-25': 1, '26-30': 3, '31-35': 1 },
    attritionBySalarySlab: { '0-5L': 1, '5-10L': 2, '10-15L': 2 },
    attritionByYearsAtCompany: { '0-1': 2, '2-3': 2, '4+': 1 },
    attritionByJobRole: { Developer: 2, Analyst: 1, Manager: 2 },
    jobSatisfaction: { Developer: [1,2,1,0], Analyst: [0,1,1,0], Manager: [0,0,1,1] }
  });

  await analyticsDoc.save();
  console.log('Seeded analytics data!');
  await mongoose.disconnect();
}

seedAnalytics().catch(err => {
  console.error(err);
  process.exit(1);
});
