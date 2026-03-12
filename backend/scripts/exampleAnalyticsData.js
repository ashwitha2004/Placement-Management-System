// Example analytics data for HR dashboard
// Place this in your backend/scripts/seedAnalytics.js or use in MongoDB Compass

const exampleAnalyticsData = {
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
};

module.exports = exampleAnalyticsData;

// To update directly in MongoDB, use this as a document in the PlacementStatistics collection.
// Or use the backend/scripts/seedAnalytics.js script to insert this data programmatically.
