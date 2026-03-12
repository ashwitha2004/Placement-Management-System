// ✅ Stats Controller - Provides mock/real data for dashboards
import User from '../models/User.js';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Interview from '../models/Interview.js';
import PlacementResult from '../models/PlacementResult.js';

const defaultHRConfig = {
  autoResumeScreening: true,
  aiInterviewAssistant: true,
  autoArchiveOldJobs: true,
  emailNotifications: true,
  pushNotifications: true,
  weeklyHiringReports: true,
  securityAlerts: true,
  twoFactorAuth: false,
  apiKeyManagement: false
};

export const getStudentStats = (req, res) => {
  try {
    const userId = req.user?.id;
    
    const stats = {
      applications: 12,
      interviews: 3,
      profileComplete: 85,
      cgpa: 8.5,
      attendance: 92,
      offers: 2,
      resumeViews: 156,
      interviewsCompleted: 2,
      offersRejected: 1,
      averageScore: 7.8,
      studyStreak: 15,
      certificatesEarned: 5,
      documentsDownloaded: 23,
      attendancePercentage: 92,
      skills: 5,
      certifications: 5,
      classes: 3,
      companies: 5
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeStatus = (status = '') => String(status).trim().toLowerCase();

export const getStudentInsights = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const student = await Student.findOne({ user: userId }).lean();

    const [applications, activeJobs, notifications, examSubmissions, interviews, placements] = await Promise.all([
      student
        ? Application.find({ student: student._id })
            .populate('job', 'company position skills eligibility location status createdAt')
            .sort({ updatedAt: -1 })
            .lean()
        : [],
      Job.find({ status: 'active' }).select('company position skills eligibility location createdAt').lean(),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      ExamSubmission.find({ studentUser: userId }).populate('exam', 'title').sort({ submittedAt: -1 }).lean(),
      student ? Interview.find({ student: student._id }).sort({ createdAt: -1 }).lean() : [],
      PlacementResult.find({ studentUser: userId }).sort({ createdAt: -1 }).lean()
    ]);

    const studentSkills = Array.isArray(student?.skills) ? student.skills : [];
    const checklist = [
      { label: 'Full name added', done: true },
      { label: 'Primary email added', done: true },
      { label: 'Phone number added', done: Boolean(student?.phoneNumber) },
      { label: 'Branch selected', done: Boolean(student?.branch) },
      { label: 'At least 3 skills listed', done: studentSkills.filter(Boolean).length >= 3 },
      { label: 'Resume uploaded', done: Boolean(student?.resume) },
      { label: 'Resume summary written', done: Boolean(student?.resumeDraft?.summary) },
      { label: 'LinkedIn or GitHub added', done: Boolean(student?.resumeDraft?.links?.linkedin || student?.resumeDraft?.links?.github) }
    ];

    const completedChecklistItems = checklist.filter((item) => item.done).length;
    const profileCompletionPercent = checklist.length ? Math.round((completedChecklistItems / checklist.length) * 100) : 0;

    const recommendations = activeJobs
      .map((job) => {
        const requiredSkills = Array.isArray(job.skills) ? job.skills.filter(Boolean) : [];
        const matchedSkills = requiredSkills.filter((skill) =>
          studentSkills.some((studentSkill) => String(studentSkill).toLowerCase() === String(skill).toLowerCase())
        );

        const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 70 : 50;
        const minCgpa = Number(job?.eligibility?.minCGPA || 0);
        const cgpaScore = Number(student?.cgpa || 0) >= minCgpa ? 30 : 10;
        const score = Math.max(0, Math.min(100, Math.round(skillScore + cgpaScore)));

        return {
          id: String(job._id),
          company: job.company || 'Company',
          role: job.position || 'Role',
          score,
          matchedSkillsCount: matchedSkills.length,
          totalSkillsCount: requiredSkills.length
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const stageMap = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      selected: 'Offer',
      rejected: 'Not Selected',
      withdrawn: 'Withdrawn'
    };

    const timeline = applications.slice(0, 10).map((application) => ({
      id: String(application._id),
      company: application.job?.company || 'Company',
      role: application.job?.position || 'Role',
      stage: stageMap[normalizeStatus(application.status)] || 'Applied',
      date: application.updatedAt || application.createdAt || new Date().toISOString()
    }));

    const shortlistedCount = applications.filter((application) => ['shortlisted', 'selected'].includes(normalizeStatus(application.status))).length;
    const shortlistRate = applications.length ? Math.round((shortlistedCount / applications.length) * 100) : 0;
    const offersCount = placements.filter((placement) => ['offered', 'accepted'].includes(normalizeStatus(placement.status))).length;

    const averageScore = examSubmissions.length
      ? Number(
          (
            examSubmissions.reduce((sum, submission) => {
              const score = Number(submission?.score);
              return sum + (Number.isFinite(score) ? score : 0);
            }, 0) / examSubmissions.length
          ).toFixed(1)
        )
      : 0;

    const activityFeed = [
      ...notifications.slice(0, 8).map((notification) => ({
        id: `notif-${notification._id}`,
        title: notification.title || 'Notification',
        subtitle: notification.message || '',
        date: notification.createdAt || new Date().toISOString(),
        type: 'notification'
      })),
      ...applications.slice(0, 8).map((application) => ({
        id: `app-${application._id}`,
        title: `Application ${normalizeStatus(application.status) || 'applied'}`,
        subtitle: `${application.job?.company || 'Company'} • ${application.job?.position || 'Role'}`,
        date: application.updatedAt || application.createdAt || new Date().toISOString(),
        type: 'application'
      })),
      ...examSubmissions.slice(0, 8).map((submission) => ({
        id: `exam-${submission._id}`,
        title: `Exam submitted: ${submission.exam?.title || 'Interview Exam'}`,
        subtitle: Number.isFinite(Number(submission.score)) ? `Score: ${submission.score}` : 'Awaiting score',
        date: submission.submittedAt || submission.createdAt || new Date().toISOString(),
        type: 'exam'
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        metrics: {
          applications: applications.length,
          interviews: interviews.length,
          offers: offersCount,
          shortlistRate,
          averageScore,
          examParticipation: examSubmissions.length
        },
        profileCompletion: {
          percent: profileCompletionPercent,
          completedItems: completedChecklistItems,
          totalItems: checklist.length,
          checklist
        },
        recommendations,
        timeline,
        activityFeed
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminStats = (req, res) => {
  try {
    const stats = {
      totalUsers: 250,
      totalStudents: 180,
      activeJobs: 12,
      completedPlacements: 45,
      pendingInterviews: 8,
      companiesRegistered: 15,
      averageCGPA: 7.5,
      placementRate: 92,
      avgPackage: 22,
      systemStatus: 'Healthy',
      securityScore: 98,
      performances: 85
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRStats = (req, res) => {
  try {
    const stats = {
      activeJobPostings: 12,
      applicationsReceived: 450,
      interviewsScheduled: 25,
      offersExtended: 8,
      acceptanceRate: 85,
      pendingApprovals: 5,
      talentPoolSize: 120,
      nextInterviewDate: '2026-02-10',
      companies: 5,
      analytics: 8
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role hrSettings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!['hr', 'admin', 'staff', 'recruiter'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Not authorized to access HR settings' });
    }

    return res.json({
      success: true,
      data: {
        theme: user.hrSettings?.theme || 'system',
        config: {
          ...defaultHRConfig,
          ...(user.hrSettings?.config || {})
        },
        updatedAt: user.hrSettings?.updatedAt || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHRSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role hrSettings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!['hr', 'admin', 'staff', 'recruiter'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update HR settings' });
    }

    const incomingTheme = ['light', 'dark', 'system'].includes(req.body?.theme)
      ? req.body.theme
      : (user.hrSettings?.theme || 'system');

    const incomingConfig = (req.body?.config && typeof req.body.config === 'object')
      ? req.body.config
      : {};

    user.hrSettings = {
      theme: incomingTheme,
      config: {
        ...defaultHRConfig,
        ...(user.hrSettings?.config || {}),
        ...incomingConfig
      },
      updatedAt: new Date()
    };

    await user.save();

    return res.json({
      success: true,
      message: 'HR settings updated successfully',
      data: {
        theme: user.hrSettings.theme,
        config: user.hrSettings.config,
        updatedAt: user.hrSettings.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffStats = (req, res) => {
  try {
    const stats = {
      totalStudents: 180,
      verifiedProfiles: 165,
      resumesPending: 15,
      interviewsScheduled: 18,
      studentsPlaced: 45,
      averageAttendance: 88,
      classes: 3,
      companies: 5,
      performance: 87,
      analytics: 92
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSkills = (req, res) => {
  try {
    const skills = [
      { name: 'Java', level: 'Advanced', proficiency: 90, certifications: ['Oracle Java Associate'] },
      { name: 'Python', level: 'Intermediate', proficiency: 75, certifications: ['Google Python'] },
      { name: 'SQL', level: 'Advanced', proficiency: 88, certifications: ['MySQL Certified'] },
      { name: 'React', level: 'Beginner', proficiency: 65, certifications: [] },
      { name: 'AWS', level: 'Intermediate', proficiency: 72, certifications: ['AWS Associate'] }
    ];

    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertifications = (req, res) => {
  try {
    const certifications = [
      { id: 1, name: 'Oracle Java Associate', issuer: 'Oracle', date: '2024-06-15', status: 'Verified' },
      { id: 2, name: 'Google Cloud Professional', issuer: 'Google', date: '2024-07-20', status: 'Verified' },
      { id: 3, name: 'AWS Certified Solutions Architect', issuer: 'AWS', date: '2024-05-10', status: 'Verified' },
      { id: 4, name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', date: '2024-08-05', status: 'Verified' },
      { id: 5, name: 'CompTIA Security+', issuer: 'CompTIA', date: '2024-09-12', status: 'Pending' }
    ];

    res.json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplications = (req, res) => {
  try {
    const applications = [
      { id: 1, company: 'Google', role: 'SDE', status: 'Interview', date: '20 Sep', salary: '32 LPA', location: 'Bangalore', appliedDate: 'Sep 10' },
      { id: 2, company: 'Amazon', role: 'SDE-1', status: 'Shortlisted', date: '22 Sep', salary: '28 LPA', location: 'Hyderabad', appliedDate: 'Sep 12' },
      { id: 3, company: 'Infosys', role: 'System Engineer', status: 'Offer', date: '24 Sep', salary: '18 LPA', location: 'Pune', appliedDate: 'Sep 5' },
      { id: 4, company: 'TechCorp', role: 'Junior Developer', status: 'Applied', date: '26 Sep', salary: '20 LPA', location: 'Mumbai', appliedDate: 'Sep 15' },
      { id: 5, company: 'Microsoft', role: 'SDE', status: 'Interview', date: '28 Sep', salary: '44 LPA', location: 'Bangalore', appliedDate: 'Sep 8' }
    ];

    res.json({ success: true, data: applications, count: applications.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviews = (req, res) => {
  try {
    const interviews = [
      { id: 1, company: 'Google', role: 'SDE-1', date: '18 Sep', status: 'Live', time: '10:00 AM', hrName: 'Priya Sharma' },
      { id: 2, company: 'Microsoft', role: 'Software Engineer', date: '25 Sep', status: 'Upcoming', time: '2:30 PM', hrName: 'Rahul Verma', videoLink: null },
      { id: 3, company: 'Amazon', role: 'SDE-1', date: '01 Oct', status: 'Scheduled', time: '11:00 AM', hrName: 'Neha Singh' }
    ];

    res.json({ success: true, data: interviews, count: interviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [user, student] = await Promise.all([
      User.findById(userId).select('name email phone avatar role').lean(),
      Student.findOne({ user: userId }).select('branch cgpa phoneNumber').lean()
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = {
      id: user._id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || student?.phoneNumber || '',
      avatar: user.avatar || '',
      role: user.role,
      branch: student?.branch || '',
      cgpa: student?.cgpa ?? null
    };

    res.json({ success: true, user: profile, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    const userData = user.toObject();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData,
      data: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClasses = (req, res) => {
  try {
    const classes = [
      { id: 1, name: 'Advanced Algorithms', status: 'Active', time: '10:00 AM - 11:30 AM', instructor: 'Dr. Smith', room: '101', attendance: 95 },
      { id: 2, name: 'Web Development', status: 'Active', time: '12:00 PM - 1:30 PM', instructor: 'Prof. Johnson', room: '204', attendance: 88 },
      { id: 3, name: 'Database Management', status: 'Upcoming', time: '2:00 PM - 3:30 PM', instructor: 'Dr. Williams', room: '305', attendance: 92 }
    ];

    res.json({ success: true, data: classes, count: classes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanies = (req, res) => {
  try {
    const companies = [
      { id: 1, name: 'Google', openJobs: 5, location: 'Bangalore', salary: '32 LPA', status: 'Hiring' },
      { id: 2, name: 'Microsoft', openJobs: 8, location: 'Hyderabad', salary: '44 LPA', status: 'Hiring' },
      { id: 3, name: 'Amazon', openJobs: 12, location: 'Bangalore', salary: '28 LPA', status: 'Hiring' },
      { id: 4, name: 'Apple', openJobs: 3, location: 'Bangalore', salary: '38 LPA', status: 'Hiring' },
      { id: 5, name: 'Meta', openJobs: 6, location: 'Mumbai', salary: '35 LPA', status: 'Active' }
    ];

    res.json({ success: true, data: companies, count: companies.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import PlacementStatistics from '../models/PlacementStatistics.js';

export const getAnalytics = async (req, res) => {
  try {
    // Get the latest analytics document (by year or createdAt)
    const analyticsDoc = await PlacementStatistics.findOne({}, {}, { sort: { year: -1, createdAt: -1 } });
    if (!analyticsDoc) {
      return res.status(404).json({ success: false, message: 'No analytics data found' });
    }
    res.json({ success: true, data: analyticsDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
