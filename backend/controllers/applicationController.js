import Application from '../models/Application.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { notifyNewApplication, notifyApplicationStatus } from '../utils/emailService.js';
import { createNotification } from './notificationController.js';

// Apply for job
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, notes } = req.body;

    // Find student
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      student: student._id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Already applied for this job'
      });
    }

    const application = await Application.create({
      student: student._id,
      job: jobId,
      coverLetter,
      notes
    });

    await application.populate(['student', 'job']);

    const studentName = application.student.user?.name || application.student.name || 'Student';
    const studentEmail = application.student.user?.email || application.student.email || 'N/A';
    const jobTitle = application.job?.position || application.job?.title || 'Position';
    const company = application.job?.company || 'Company';

    // Send email notifications to HR and Staff
    try {
      const hrStaff = await User.find({ role: { $in: ['hr', 'staff', 'admin'] } }).select('_id email');
      const hrEmails = hrStaff.map(u => u.email).filter(Boolean);
      
      if (hrEmails.length > 0 && application.job && application.student) {
        await notifyNewApplication({
          studentName,
          studentEmail,
          jobTitle,
          company
        }, hrEmails);
        console.log(`Application notification sent to ${hrEmails.length} HR/Staff members`);
      }

      const hrNotifications = hrStaff.map((user) => createNotification(
        user._id,
        'application',
        'New job application',
        `${studentName} applied for ${jobTitle} at ${company}.`,
        application._id,
        'Application'
      ));

      const studentUserId = application.student?.user || null;
      const studentNotification = studentUserId
        ? createNotification(
            studentUserId,
            'application',
            'Application submitted',
            `You applied for ${jobTitle} at ${company}.`,
            application._id,
            'Application'
          )
        : null;

      await Promise.allSettled([
        ...hrNotifications,
        ...(studentNotification ? [studentNotification] : [])
      ]);
    } catch (emailError) {
      console.error('Error sending application notification emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my applications
export const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const applications = await Application.find({ student: student._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get applications for a job
export const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('student');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all applications (for HR/Admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student')
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await application.save();

    // Populate to get student and job details for email
    await application.populate(['student', 'job']);

    // Send email notification to student about status change
    try {
      if (application.student && application.student.user) {
        const studentUser = await User.findById(application.student.user);
        if (studentUser && studentUser.email) {
          await notifyApplicationStatus({
            jobTitle: application.job?.position || application.job?.title || 'Position',
            company: application.job?.company || 'Company',
            status: status,
            feedback: application.feedback || null
          }, studentUser.email);
          console.log(`Status update notification sent to ${studentUser.email}`);
        }
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Status updated',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update my application (student)
export const updateMyApplication = async (req, res) => {
  try {
    const { coverLetter, notes } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id
    }).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (['rejected', 'selected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application can no longer be updated'
      });
    }

    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    if (notes !== undefined) application.notes = notes;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Withdraw my application (student)
export const withdrawMyApplication = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id
    }).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Application already withdrawn'
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
