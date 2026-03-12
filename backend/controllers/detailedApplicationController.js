import DetailedApplicationForm from '../models/DetailedApplicationForm.js';
import Student from '../models/Student.js';

// Create or update detailed application form
export const saveDetailedApplicationForm = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      linkedIn,
      github,
      website,
      summary,
      workExperience,
      skills,
      education,
      certifications,
      coverLetter,
      appliedCompany,
      appliedPosition
    } = req.body;

    // Find student
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if form already exists
    let form = await DetailedApplicationForm.findOne({ student: student._id });

    if (form) {
      // Update existing form
      form.fullName = fullName;
      form.email = email;
      form.phone = phone;
      form.linkedIn = linkedIn;
      form.github = github;
      form.website = website;
      form.summary = summary;
      form.workExperience = workExperience || [];
      form.skills = skills || [];
      form.education = education || [];
      form.certifications = certifications || [];
      form.coverLetter = coverLetter;
      form.appliedCompany = appliedCompany;
      form.appliedPosition = appliedPosition;
      await form.save();
    } else {
      // Create new form
      form = await DetailedApplicationForm.create({
        student: student._id,
        fullName,
        email,
        phone,
        linkedIn,
        github,
        website,
        summary,
        workExperience: workExperience || [],
        skills: skills || [],
        education: education || [],
        certifications: certifications || [],
        coverLetter,
        appliedCompany,
        appliedPosition
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application form saved successfully',
      form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get student's detailed application form
export const getMyDetailedApplicationForm = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const form = await DetailedApplicationForm.findOne({ student: student._id });

    res.status(200).json({
      success: true,
      form: form || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get detailed application form by student ID (for staff/HR)
export const getDetailedApplicationFormByStudent = async (req, res) => {
  try {
    const form = await DetailedApplicationForm.findOne({ student: req.params.studentId }).populate('student');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application form not found'
      });
    }

    res.status(200).json({
      success: true,
      form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all detailed application forms (for staff/HR)
export const getAllDetailedApplicationForms = async (req, res) => {
  try {
    const forms = await DetailedApplicationForm.find()
      .populate('student')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: forms.length,
      forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
