import JobRequisition from '../models/JobRequisition.js';
import User from '../models/User.js';
import { notifyJobRequisition } from '../utils/emailService.js';

// Create job requisition
export const createJobRequisition = async (req, res) => {
  try {
    const {
      title,
      department,
      description,
      numberOfPositions,
      salary,
      location,
      employmentType,
      requiredSkills,
      experience,
      education,
      reportingManager,
      deadline,
      priority
    } = req.body;

    // Validate required fields
    if (!title || !department || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, department, description, and location are required'
      });
    }

    const jobRequisition = await JobRequisition.create({
      title,
      department,
      description,
      numberOfPositions: numberOfPositions || 1,
      salary: salary || {},
      location,
      employmentType: employmentType || 'Full-time',
      requiredSkills: requiredSkills || [],
      experience: experience || {},
      education: education || 'Bachelor',
      reportingManager: reportingManager || '',
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: priority || 'Medium',
      createdBy: req.user.id,
      status: 'Open'
    });

    // Send email notifications to admins
    try {
      const admins = await User.find({ role: 'admin' }).select('email');
      const adminEmails = admins.map(a => a.email).filter(Boolean);
      
      if (adminEmails.length > 0) {
        await notifyJobRequisition({
          title,
          department,
          location,
          numberOfPositions,
          priority
        }, adminEmails);
        console.log(`Job requisition notification sent to ${adminEmails.length} admins`);
      }
    } catch (emailError) {
      console.error('Error sending job requisition notification emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Job requisition created successfully',
      jobRequisition
    });
  } catch (error) {
    console.error('Create job requisition error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating job requisition'
    });
  }
};

// Get all job requisitions
export const getAllJobRequisitions = async (req, res) => {
  try {
    const jobRequisitions = await JobRequisition.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobRequisitions.length,
      jobRequisitions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get job requisition by ID
export const getJobRequisitionById = async (req, res) => {
  try {
    const jobRequisition = await JobRequisition.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!jobRequisition) {
      return res.status(404).json({
        success: false,
        message: 'Job requisition not found'
      });
    }

    res.status(200).json({
      success: true,
      jobRequisition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update job requisition
export const updateJobRequisition = async (req, res) => {
  try {
    const { title, department, description, numberOfPositions, salary, location, employmentType, requiredSkills, experience, education, reportingManager, deadline, status, priority } = req.body;

    let jobRequisition = await JobRequisition.findById(req.params.id);

    if (!jobRequisition) {
      return res.status(404).json({
        success: false,
        message: 'Job requisition not found'
      });
    }

    if (title) jobRequisition.title = title;
    if (department) jobRequisition.department = department;
    if (description) jobRequisition.description = description;
    if (numberOfPositions) jobRequisition.numberOfPositions = numberOfPositions;
    if (salary) jobRequisition.salary = salary;
    if (location) jobRequisition.location = location;
    if (employmentType) jobRequisition.employmentType = employmentType;
    if (requiredSkills) jobRequisition.requiredSkills = requiredSkills;
    if (experience) jobRequisition.experience = experience;
    if (education) jobRequisition.education = education;
    if (reportingManager) jobRequisition.reportingManager = reportingManager;
    if (deadline) jobRequisition.deadline = deadline;
    if (status) jobRequisition.status = status;
    if (priority) jobRequisition.priority = priority;
    jobRequisition.updatedAt = new Date();

    await jobRequisition.save();

    res.status(200).json({
      success: true,
      message: 'Job requisition updated successfully',
      jobRequisition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete job requisition
export const deleteJobRequisition = async (req, res) => {
  try {
    const jobRequisition = await JobRequisition.findByIdAndDelete(req.params.id);

    if (!jobRequisition) {
      return res.status(404).json({
        success: false,
        message: 'Job requisition not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job requisition deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
