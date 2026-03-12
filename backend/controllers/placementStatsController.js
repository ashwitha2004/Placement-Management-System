import {
  getPlacementStatistics,
  getCompanyStatistics,
  getTopCompanies,
  getBranchPlacementStats,
  loadKagglePlacementData
} from '../utils/kaggleDataService.js';

// Get all placement statistics
export const getAllPlacementStats = async (req, res) => {
  try {
    const { branch, company, year } = req.query;
    
    const filters = {};
    if (branch) filters.branch = branch;
    if (company) filters.company = new RegExp(company, 'i');
    if (year) filters.year = parseInt(year);

    const result = await getPlacementStatistics(filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get company-specific statistics
export const getCompanyStats = async (req, res) => {
  try {
    const { company } = req.params;

    const result = await getCompanyStatistics(company);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top companies by package
export const getTopCompaniesStats = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await getTopCompanies(parseInt(limit));

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get branch-wise placement statistics
export const getBranchStats = async (req, res) => {
  try {
    const result = await getBranchPlacementStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Load Kaggle data (admin only)
export const loadKaggleData = async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'hr')) {
      const result = await loadKagglePlacementData();
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        count: result.count
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin/Staff/HR role required.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllPlacementStats,
  getCompanyStats,
  getTopCompaniesStats,
  getBranchStats,
  loadKaggleData
};
