import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import Student from '../models/Student.js';

// Schedule interview
import { v4 as uuidv4 } from 'uuid';
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, round, scheduledDate } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Generate unique roomId for WebRTC
    const roomId = uuidv4();

    const interview = await Interview.create({
      application: applicationId,
      student: application.student,
      job: application.job,
      round,
      scheduledDate,
      roomId
    });

    await interview.populate(['student', 'job', 'application']);

    res.status(201).json({
      success: true,
      message: 'Interview scheduled',
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my interviews
export const getMyInterviews = async (req, res) => {
  try {
    // Get student ID from params or from authenticated user (JWT token)
    let studentId = req.params.studentId;

    if (!studentId && req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      studentId = studentProfile?._id;
    }

    if (!studentId && req.user.role !== 'student') {
      const interviews = await Interview.find()
        .populate('job')
        .populate('application')
        .populate('student');

      return res.status(200).json({
        success: true,
        count: interviews.length,
        interviews
      });
    }

    if (!studentId) {
      return res.status(200).json({
        success: true,
        count: 0,
        interviews: []
      });
    }

    const interviews = await Interview.find({ student: studentId })
      .populate('job')
      .populate('application')
      .populate('student');

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update interview result
export const updateInterviewResult = async (req, res) => {
  try {
    const { result, feedback } = req.body;

    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    interview.result = result;
    interview.feedback = feedback;
    await interview.save();

    // If selected, update student placement
    if (result === 'passed' && interview.round === 'final') {
      await Student.findByIdAndUpdate(
        interview.student,
        { isPlaced: true, placedAt: interview.job },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Interview result updated',
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update interview roomId (not typically needed, but placeholder for future)
export const updateInterviewRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    let interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    interview.roomId = roomId;
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Room ID updated',
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all interviews for job
export const getJobInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ job: req.params.jobId })
      .populate('student')
      .populate('application');

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all interviews (for admin/hr/staff)
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('student')
      .populate('job')
      .populate('application')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
