import mongoose from 'mongoose';

const placementStatisticsSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  placementRate: {
    type: Number,
    default: 0
  },
  averagePackage: {
    type: Number,
    default: 0
  },
  highestPackage: {
    type: Number,
    default: 0
  },
  lowestPackage: {
    type: Number,
    default: 0
  },
  totalStudentsPlaced: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  branch: [String],
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  location: String,
  recruiter: String,
  skills: [String],
  // --- HR Analytics Details ---
  avgAge: { type: Number, default: 27 }, // Example: 27
  avgWorkingYears: { type: Number, default: 3 }, // Example: 3
  attrition: { type: Number, default: 5 }, // Example: 5
  attritionRate: { type: Number, default: 2.1 }, // Example: 2.1
  attritionByEducation: {
    type: Object,
    default: () => ({ Bachelors: 2, Masters: 3, PhD: 0 })
  },
  attritionByAge: {
    type: Object,
    default: () => ({ '20-25': 1, '26-30': 3, '31-35': 1 })
  },
  attritionBySalarySlab: {
    type: Object,
    default: () => ({ '0-5L': 1, '5-10L': 2, '10-15L': 2 })
  },
  attritionByYearsAtCompany: {
    type: Object,
    default: () => ({ '0-1': 2, '2-3': 2, '4+': 1 })
  },
  attritionByJobRole: {
    type: Object,
    default: () => ({ 'Developer': 2, 'Analyst': 1, 'Manager': 2 })
  },
  jobSatisfaction: {
    type: Object,
    default: () => ({ 'Developer': [1,2,1,0], 'Analyst': [0,1,1,0], 'Manager': [0,0,1,1] })
  },
  // ---
  source: {
    type: String,
    enum: ['kaggle', 'manual', 'import'],
    default: 'manual'
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
placementStatisticsSchema.index({ company: 1, year: 1 });
placementStatisticsSchema.index({ year: 1 });
placementStatisticsSchema.index({ source: 1 });

export default mongoose.model('PlacementStatistics', placementStatisticsSchema);