import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { notifyNewJob } from '../utils/emailService.js';
import { createNotification } from './notificationController.js';

// Create job posting
export const createJob = async (req, res) => {
  try {
    const { company, position, description, salary, location, eligibility, skills, jobType, applicationDeadline } = req.body;

    // Validate required fields
    if (!company || !position || !location) {
      return res.status(400).json({
        success: false,
        message: 'Company, position, and location are required'
      });
    }

    // Check user authorization - must be admin or recruiter
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'recruiter' && req.user.role !== 'hr')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to post jobs. Only admins and recruiters can post jobs.'
      });
    }

    const job = await Job.create({
      company,
      position,
      description,
      salary: salary || {},
      location,
      eligibility: eligibility || {},
      skills: skills ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills) : [],
      jobType: jobType || 'Full-time',
      applicationDeadline: applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedBy: req.user.id,
        postedByRole: req.user.role,
      status: 'active'
    });

    // Send email and in-app notifications to students and staff
    try {
      const students = await User.find({ role: 'student' }).select('email _id');
      const staff = await User.find({ role: 'staff' }).select('email _id');
      const notifyUsers = [...students, ...staff];
      const notifyEmails = notifyUsers.map(u => u.email).filter(Boolean);

      if (notifyEmails.length > 0) {
        await notifyNewJob({
          position,
          company,
          location,
          salary: typeof salary === 'object' && salary.min && salary.max 
            ? `₹${salary.min} - ₹${salary.max}` 
            : salary || 'Not specified',
          jobType,
          description,
          skills
        }, notifyEmails);
        console.log(`Job notification sent to ${notifyEmails.length} students and staff`);
      }

      // Create in-app notifications for all students and staff
      try {
        for (const user of notifyUsers) {
          await createNotification(
            user._id,
            'job',
            `New Job: ${position}`,
            `${company} is hiring for ${position} in ${location}. Salary: ${typeof salary === 'object' && salary.min && salary.max ? `₹${salary.min} - ₹${salary.max}` : salary || 'Not specified'}`,
            job._id,
            'Job'
          );
        }
        console.log(`In-app notifications created for ${notifyUsers.length} students and staff`);
      } catch (notificationError) {
        console.error('Error creating in-app notifications:', notificationError);
      }
    } catch (emailError) {
      console.error('Error sending job notification emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating job'
    });
  }
};

// Get all jobs with advanced filtering
export const getAllJobs = async (req, res) => {
  try {
    const { status = 'active', search, company, location } = req.query;
    const userRole = req.user?.role;

    const filter = {};
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Visibility logic:
    // - HR posts: visible to students, HR, staff, admin, recruiter
    // - Staff posts: visible to students and staff only
    // - Admin/Recruiter posts: visible to all
    if (userRole === 'student') {
      // Students can see all active jobs - no additional filter
    } else if (userRole === 'hr') {
      // HR can see their own posts and admin/recruiter posts, but NOT staff posts
      filter.$or = [
        { postedByRole: 'hr' },
        { postedByRole: 'admin' },
        { postedByRole: 'recruiter' }
      ];
    } else if (userRole === 'staff') {
      // Staff can see HR posts, admin/recruiter posts, and their own posts
      filter.$or = [
        { postedByRole: 'hr' },
        { postedByRole: 'admin' },
        { postedByRole: 'recruiter' },
        { postedBy: req.user.id }
      ];
    } else if (userRole === 'admin' || userRole === 'recruiter') {
      // Admin and recruiters can see all jobs - no additional filter
    }

    // Search by position or company
    if (search) {
      const searchCondition = {
        $or: [
          { position: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchCondition];
        delete filter.$or;
      } else {
        Object.assign(filter, searchCondition);
      }
    }

    // Filter by company
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching jobs'
    });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email role');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching job'
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check authorization - only job poster or admin can update
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Handle skills as array
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map(s => s.trim());
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating job'
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check authorization - only job poster or admin can delete
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting job'
    });
  }
};
