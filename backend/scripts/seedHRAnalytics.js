// Seed PlacementStatistics for HR Analytics dashboard
import mongoose from 'mongoose';
import PlacementStatistics from '../models/PlacementStatistics.js';

async function seedHRAnalytics() {
  await mongoose.connect('mongodb://localhost:27017/your-db-name');

  const analyticsDoc = new PlacementStatistics({
    company: 'DemoGenAI',
    position: 'All',
    salary: 0,
    placementRate: 16.12,
    averagePackage: 0,
    highestPackage: 0,
    lowestPackage: 0,
    totalStudentsPlaced: 1470,
    year: 2026,
    branch: ['HR', 'Sales', 'R&D'],
    jobType: 'Full-time',
    avgAge: 36.92,
    avgWorkingYears: 0,
    attrition: 237,
    attritionRate: 16.12,
    attritionByEducation: {
      'Life Science': 89,
      'Medical': 69,
      'Marketing': 38,
      'Technical': 32,
      'Other': 17,
      'Human': 7
    },
    attritionByAge: {
      'Under 25': 38,
      '25-34': 112,
      '35-44': 51,
      '45-54': 25,
      'Over 55': 11
    },
    attritionBySalarySlab: {
      '8-10L': 60,
      '10-15L': 120,
      '15-20L': 67
    },
    attritionByYearsAtCompany: {
      '0-1': 90,
      '2-3': 110,
      '4+': 47
    },
    attritionByJobRole: {
      'Healthcare Representative': 131,
      'Human Resources': 131,
      'Laboratory Technician': 259,
      'Manager': 59,
      'Manufacturing Director': 145,
      'Research Director': 86,
      'Research Scientist': 83,
      'Sales Executive': 94,
      'Sales Representative': 83
    },
    jobSatisfaction: {
      'Healthcare Representative': [131, 0, 0, 0],
      'Human Resources': [131, 0, 0, 0],
      'Laboratory Technician': [259, 0, 0, 0],
      'Manager': [59, 0, 0, 0],
      'Manufacturing Director': [145, 0, 0, 0],
      'Research Director': [86, 0, 0, 0],
      'Research Scientist': [83, 0, 0, 0],
      'Sales Executive': [94, 0, 0, 0],
      'Sales Representative': [83, 0, 0, 0]
    },
    adthr: {
      detail1: 'ADTHR Value 1',
      detail2: 'ADTHR Value 2'
    }
  });

  await analyticsDoc.save();
  console.log('Seeded HR Analytics data!');
  await mongoose.disconnect();
}

seedHRAnalytics().catch(err => {
  console.error('Error seeding HR Analytics:', err);
});
