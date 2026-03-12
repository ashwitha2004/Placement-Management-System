import PlacementStatistics from '../models/PlacementStatistics.js';

// Sample Kaggle Placement Dataset
const kagglePlacementData = [
  {
    company: 'TechCorp',
    position: 'Software Engineer',
    salary: 12,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 95,
    totalStudentsPlaced: 45,
    averagePackage: 12.5,
    highestPackage: 20,
    lowestPackage: 10,
    location: 'Bangalore',
    skills: ['Python', 'Java', 'React', 'AWS'],
    year: 2024
  },
  {
    company: 'FinTech Solutions',
    position: 'Backend Developer',
    salary: 14,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 88,
    totalStudentsPlaced: 32,
    averagePackage: 14.2,
    highestPackage: 18,
    lowestPackage: 12,
    location: 'Mumbai',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
    year: 2024
  },
  {
    company: 'Cloud First Inc',
    position: 'Cloud Architect',
    salary: 16,
    branch: ['CSE', 'IT', 'ECE'],
    jobType: 'Full-time',
    placementRate: 82,
    totalStudentsPlaced: 28,
    averagePackage: 15.8,
    highestPackage: 22,
    lowestPackage: 13,
    location: 'Hyderabad',
    skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform'],
    year: 2024
  },
  {
    company: 'DataDriven Analytics',
    position: 'Data Scientist',
    salary: 13,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 78,
    totalStudentsPlaced: 24,
    averagePackage: 13.5,
    highestPackage: 19,
    lowestPackage: 11,
    location: 'Delhi',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    year: 2024
  },
  {
    company: 'MobileFirst Apps',
    position: 'Mobile Developer',
    salary: 11,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 85,
    totalStudentsPlaced: 38,
    averagePackage: 11.8,
    highestPackage: 16,
    lowestPackage: 9,
    location: 'Pune',
    skills: ['React Native', 'Flutter', 'Java', 'Swift'],
    year: 2024
  },
  {
    company: 'LinkedServices',
    position: 'Full Stack Developer',
    salary: 12,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 90,
    totalStudentsPlaced: 42,
    averagePackage: 12.3,
    highestPackage: 18,
    lowestPackage: 10,
    location: 'Bangalore',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    year: 2024
  },
  {
    company: 'SecurityFirst',
    position: 'Cybersecurity Analyst',
    salary: 15,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 75,
    totalStudentsPlaced: 18,
    averagePackage: 15.2,
    highestPackage: 21,
    lowestPackage: 12,
    location: 'Bangalore',
    skills: ['Network Security', 'Penetration Testing', 'Python', 'Linux'],
    year: 2024
  },
  {
    company: 'AIGenius Labs',
    position: 'AI/ML Engineer',
    salary: 14,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 80,
    totalStudentsPlaced: 26,
    averagePackage: 14.8,
    highestPackage: 23,
    lowestPackage: 12,
    location: 'Mumbai',
    skills: ['Python', 'Deep Learning', 'PyTorch', 'NLP'],
    year: 2024
  },
  {
    company: 'TechVentures',
    position: 'DevOps Engineer',
    salary: 13,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 87,
    totalStudentsPlaced: 35,
    averagePackage: 13.5,
    highestPackage: 17,
    lowestPackage: 11,
    location: 'Gurgaon',
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'CI/CD'],
    year: 2024
  },
  {
    company: 'WebScale Systems',
    position: 'Frontend Developer',
    salary: 11,
    branch: ['CSE', 'IT'],
    jobType: 'Full-time',
    placementRate: 92,
    totalStudentsPlaced: 50,
    averagePackage: 11.5,
    highestPackage: 15,
    lowestPackage: 9,
    location: 'Bangalore',
    skills: ['React', 'Vue.js', 'TypeScript', 'CSS'],
    year: 2024
  }
];

// Load Kaggle data into database
export const loadKagglePlacementData = async () => {
  try {
    // Check if data already exists
    const existingCount = await PlacementStatistics.countDocuments({ source: 'kaggle' });
    
    if (existingCount > 0) {
      console.log(`✅ Kaggle placement data already loaded (${existingCount} records)`);
      return { success: true, message: 'Data already loaded', count: existingCount };
    }

    // Insert Kaggle data
    const placements = kagglePlacementData.map(item => ({
      ...item,
      source: 'kaggle',
      currency: 'LPA'
    }));

    const result = await PlacementStatistics.insertMany(placements);
    console.log(`✅ Loaded ${result.length} Kaggle placement records`);
    return { success: true, message: 'Data loaded successfully', count: result.length };
  } catch (error) {
    console.error('Error loading Kaggle data:', error);
    return { success: false, message: error.message };
  }
};

// Get placement statistics
export const getPlacementStatistics = async (filters = {}) => {
  try {
    const query = filters;
    const stats = await PlacementStatistics.find(query).sort({ salary: -1 });

    // Calculate aggregated statistics
    const totalPlacements = stats.reduce((sum, item) => sum + (item.totalStudentsPlaced || 0), 0);
    const avgPackage = stats.length > 0 
      ? (stats.reduce((sum, item) => sum + (item.averagePackage || 0), 0) / stats.length).toFixed(2)
      : 0;
    const highestPackage = stats.length > 0 
      ? Math.max(...stats.map(item => item.highestPackage || 0))
      : 0;
    const companiesCount = stats.length;

    return {
      success: true,
      data: {
        placements: stats,
        summary: {
          totalPlacements,
          companiesCount,
          averagePackage: parseFloat(avgPackage),
          highestPackage,
          placementRate: stats.length > 0 
            ? (stats.reduce((sum, item) => sum + (item.placementRate || 0), 0) / stats.length).toFixed(2)
            : 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching placement statistics:', error);
    return { success: false, message: error.message };
  }
};

// Get company-wise statistics
export const getCompanyStatistics = async (companyName) => {
  try {
    const stats = await PlacementStatistics.find({ company: new RegExp(companyName, 'i') });
    
    if (stats.length === 0) {
      return { success: false, message: 'Company not found' };
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error fetching company statistics:', error);
    return { success: false, message: error.message };
  }
};

// Get top companies by package
export const getTopCompanies = async (limit = 10) => {
  try {
    const stats = await PlacementStatistics.find()
      .sort({ averagePackage: -1 })
      .limit(limit);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error fetching top companies:', error);
    return { success: false, message: error.message };
  }
};

// Get branch-wise placement statistics
export const getBranchPlacementStats = async () => {
  try {
    const stats = await PlacementStatistics.aggregate([
      { $unwind: '$branch' },
      {
        $group: {
          _id: '$branch',
          totalPlacements: { $sum: '$totalStudentsPlaced' },
          avgPackage: { $avg: '$averagePackage' },
          companies: { $sum: 1 }
        }
      },
      { $sort: { totalPlacements: -1 } }
    ]);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error fetching branch statistics:', error);
    return { success: false, message: error.message };
  }
};

export default {
  loadKagglePlacementData,
  getPlacementStatistics,
  getCompanyStatistics,
  getTopCompanies,
  getBranchPlacementStats
};
