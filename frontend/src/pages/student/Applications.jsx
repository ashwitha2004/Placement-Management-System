import React, { useState, useEffect } from 'react';
import { applicationsAPI, jobAPI, studentAPI, detailedApplicationsAPI, notificationsAPI } from '../../services/api';
import { FileText, Clock, CheckCircle, XCircle, Star, Download, Eye, MessageCircle, Edit3, Save, User, Building2, Plus, Trash2, EyeIcon, FileJson, Briefcase, Zap, X, BookOpen, Award, Feather, Bell, AlertCircle, MapPin, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { generateApplicationPDF, previewApplicationHTML } from '../../utils/applicationPdfGenerator';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('all'); // all, applied, shortlisted, rejected, selected, withdrawn
  const [activeTab, setActiveTab] = useState('applications'); // applications, available-jobs
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    branch: '',
    cgpa: '',
    skills: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [applyJob, setApplyJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', notes: '' });
  const [applyError, setApplyError] = useState('');
  const [editApp, setEditApp] = useState(null);
  const [editForm, setEditForm] = useState({ coverLetter: '', notes: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Application Builder Form
  const [showApplicationBuilder, setShowApplicationBuilder] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    github: '',
    website: '',
    summary: '',
    workExperience: [{ position: '', company: '', duration: '', details: '' }],
    skills: [],
    education: [{ degree: '', school: '', year: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
    coverLetter: '',
    appliedCompany: '',
    appliedPosition: ''
  });
  const [selectedCompanyPreview, setSelectedCompanyPreview] = useState(null);
  const [showApplicationPreview, setShowApplicationPreview] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [savingApplication, setSavingApplication] = useState(false);
  const [applicationSaveError, setApplicationSaveError] = useState('');
  const [applicationSaveSuccess, setApplicationSaveSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Pre-fill application form with student data
    if (profile) {
      setApplicationForm(prev => ({
        ...prev,
        fullName: profile.user?.name || '',
        email: profile.user?.email || '',
        phone: profile.user?.phone || profile.phoneNumber || '',
        skills: profile.skills || []
      }));
    }
  }, [profile]);

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'number') return `₹${salary.toLocaleString('en-IN')}`;
    if (typeof salary === 'object') {
      const min = salary.min ? `₹${salary.min.toLocaleString('en-IN')}` : null;
      const max = salary.max ? `₹${salary.max.toLocaleString('en-IN')}` : null;
      if (min && max) return `${min} - ${max}`;
      return min || max || 'Not specified';
    }
    return 'Not specified';
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getMyApplications();
      const apps = res.data?.applications || [];
      const mapped = apps.map((app) => ({
        id: app._id,
        jobId: app.job?._id,
        jobTitle: app.job?.position || app.job?.title || 'Role',
        company: app.job?.company || 'Company',
        location: app.job?.location || 'Location',
          salary: formatSalary(app.job?.salary) || null,
        appliedDate: app.createdAt || new Date().toISOString(),
        updatedDate: app.updatedAt || app.createdAt || new Date().toISOString(),
        status: app.status === 'pending' ? 'applied' : (app.status || 'applied'),
        aiScore: app.aiScore || null,
        feedback: app.feedback || null,
        coverLetter: app.coverLetter || '',
        notes: app.notes || '',
        documents: app.documents || []
      }));

      const filtered = filter === 'all' ? mapped : mapped.filter(app => app.status === filter);
      setAllApplications(mapped);
      setApplications(filtered);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      const fallback = filter === 'all' ? mockApplications : mockApplications.filter(app => app.status === filter);
      setApplications(fallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await jobAPI.getAll();
      const jobList = res.data?.jobs || res.data || [];
      setJobs(jobList);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await studentAPI.getProfile();
      const student = res.data?.student || null;
      setProfile(student);

      const user = student?.user || {};
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || student?.phoneNumber || '',
        rollNumber: student?.rollNumber || '',
        branch: student?.branch || '',
        cgpa: student?.cgpa ?? '',
        skills: Array.isArray(student?.skills) ? student.skills.join(', ') : ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfileError('Failed to load profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await notificationsAPI.getNotifications();
      const notifs = res.data?.notifications || [];
      setNotifications(notifs);
      setUnreadNotificationCount(res.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mock data for development
  const mockApplications = [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Innovations',
      location: 'Bangalore, KA',
      salary: '₹12-18 LPA',
      appliedDate: '2026-01-20T10:30:00Z',
      status: 'shortlisted',
      aiScore: 92,
      feedback: 'Excellent React skills, strong portfolio. Advance to technical round.',
      documents: ['Resume.pdf', 'Portfolio.pdf']
    },
    {
      id: '2',
      jobTitle: 'Fullstack Engineer',
      company: 'FinTech Solutions',
      location: 'Remote',
      salary: '₹15-22 LPA',
      appliedDate: '2026-01-22T14:15:00Z',
      status: 'applied',
      aiScore: 78,
      feedback: null
    },
    {
      id: '3',
      jobTitle: 'React Developer',
      company: 'HealthAI Labs',
      location: 'Hyderabad, TS',
      salary: '₹8-12 LPA',
      appliedDate: '2026-01-19T09:45:00Z',
      status: 'rejected',
      aiScore: 65,
      feedback: 'Profile completeness low. Improve GitHub and add projects.',
      documents: ['Resume.pdf']
    },
    {
      id: '4',
      jobTitle: 'MERN Stack Developer',
      company: 'EduTech Startup',
      location: 'Pune, MH',
      salary: '₹10-15 LPA',
      appliedDate: '2026-01-24T16:20:00Z',
      status: 'shortlisted',
      aiScore: 88,
      feedback: 'Good match for requirements. Interview scheduled.',
      documents: ['Resume.pdf', 'CoverLetter.pdf']
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      applied: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Applied' },
      shortlisted: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Shortlisted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Not Selected' },
      selected: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Selected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Withdrawn' }
    };
    return configs[status] || configs.applied;
  };

  const handleAction = async (appId, action) => {
    try {
      if (action === 'withdraw') {
        await applicationsAPI.withdrawMyApplication(appId);
        setApplications(prev => prev.map(app => 
          app.id === appId ? { ...app, status: 'withdrawn' } : app
        ));
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleApplyForJob = (job) => {
    setApplyError('');
    setApplyForm({ coverLetter: '', notes: '' });
    setApplyJob(job);
  };

  const submitApplication = async () => {
    if (!applyJob) return;
    const jobId = applyJob._id || applyJob.id;
    setApplyingJobId(jobId);
    setApplyError('');

    try {
      await applicationsAPI.create({
        jobId,
        coverLetter: applyForm.coverLetter,
        notes: applyForm.notes
      });
      await fetchApplications();
      await fetchNotifications();
      setApplyJob(null);
    } catch (error) {
      console.error('Failed to apply:', error);
      setApplyError(error.response?.data?.message || 'Failed to apply for the job');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');
    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        phoneNumber: profileForm.phone,
        branch: profileForm.branch,
        cgpa: profileForm.cgpa === '' ? undefined : Number(profileForm.cgpa),
        skills: profileForm.skills
          ? profileForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : []
      };

      const res = await studentAPI.updateProfile(payload);
      setProfile(res.data?.student || profile);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone
        }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const openEditApplication = (application) => {
    setEditError('');
    setEditForm({
      coverLetter: application.coverLetter || '',
      notes: application.notes || ''
    });
    setEditApp(application);
  };

  const submitEditApplication = async () => {
    if (!editApp) return;
    setEditSaving(true);
    setEditError('');
    try {
      const res = await applicationsAPI.updateMyApplication(editApp.id, {
        coverLetter: editForm.coverLetter,
        notes: editForm.notes
      });

      const updated = res.data?.application;
      const updatedApp = {
        coverLetter: updated?.coverLetter ?? editForm.coverLetter,
        notes: updated?.notes ?? editForm.notes,
        updatedDate: updated?.updatedAt || new Date().toISOString()
      };

      setApplications((prev) => prev.map((app) => (
        app.id === editApp.id
          ? { ...app, ...updatedApp }
          : app
      )));
      setSelectedApp((prev) => (
        prev && prev.id === editApp.id ? { ...prev, ...updatedApp } : prev
      ));
      setEditApp(null);
    } catch (error) {
      console.error('Failed to update application:', error);
      setEditError(error.response?.data?.message || 'Failed to update application');
    } finally {
      setEditSaving(false);
    }
  };

  // Application Builder Functions
  const handleApplicationFormChange = (field, value) => {
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updated = [...applicationForm.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setApplicationForm(prev => ({ ...prev, workExperience: updated }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...applicationForm.education];
    updated[index] = { ...updated[index], [field]: value };
    setApplicationForm(prev => ({ ...prev, education: updated }));
  };

  const handleCertificationChange = (index, field, value) => {
    const updated = [...applicationForm.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setApplicationForm(prev => ({ ...prev, certifications: updated }));
  };

  const addWorkExperience = () => {
    setApplicationForm(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { position: '', company: '', duration: '', details: '' }]
    }));
  };

  const removeWorkExperience = (index) => {
    setApplicationForm(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setApplicationForm(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    setApplicationForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setApplicationForm(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }]
    }));
  };

  const removeCertification = (index) => {
    setApplicationForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setApplicationForm(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setApplicationForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSaveDetailedApplication = async () => {
    if (!applicationForm.fullName.trim()) {
      setApplicationSaveError('Please fill in your full name');
      return;
    }

    setSavingApplication(true);
    setApplicationSaveError('');
    setApplicationSaveSuccess('');

    try {
      await detailedApplicationsAPI.save(applicationForm);
      setApplicationSaveSuccess('Application form saved successfully!');
      setTimeout(() => setApplicationSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save application:', error);
      setApplicationSaveError(error.response?.data?.message || 'Failed to save application form');
    } finally {
      setSavingApplication(false);
    }
  };

  const handleDownloadApplication = () => {
    if (!applicationForm.fullName.trim()) {
      alert('Please fill in your full name');
      return;
    }
    generateApplicationPDF(applicationForm);
  };

  const appliedJobIds = new Set(applications.map(app => app.jobId).filter(Boolean));
  const openJobs = jobs.filter(job => !job.status || job.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header with Notifications */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            My Applications
          </h1>
          <p className="text-xl text-gray-600">
            Track your job applications and get AI-powered feedback
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
            <span>Total: {applications.length}</span>
            <span>• Shortlisted: {applications.filter(a => a.status === 'shortlisted').length}</span>
          </div>
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <Bell className="w-5 h-5 text-blue-600" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-14 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-xl flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications ({notifications.length})
                  </h3>
                  <button onClick={() => setShowNotifications(false)} className="hover:bg-blue-400 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No notifications yet</div>
                ) : (
                  <div className="divide-y">
                    {notifications.map(notif => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationRead(notif._id)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                      >
                        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                          {notif.type === 'job' ? <Briefcase className="w-4 h-4 text-blue-600" /> : <AlertCircle className="w-4 h-4 text-orange-600" />}
                          {notif.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Applications / Available Jobs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Applications ({allApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('available-jobs')}
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
            activeTab === 'available-jobs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Jobs ({jobs.filter(j => !allApplications.some(a => a.jobId === (j._id || j.id))).length})
        </button>
      </div>

      {/* Applications Tab Content */}
      {activeTab === 'applications' && (
        <>
          {/* Filters */}
          <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-3">
            {['all', 'applied', 'shortlisted', 'selected', 'rejected', 'withdrawn'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-2xl font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/50 hover:bg-white/70 backdrop-blur-xl border border-white/30 hover:shadow-xl'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Available Jobs Tab Content */}
      {activeTab === 'available-jobs' && (
        <>
          {jobsLoading ? (
            <div className="py-8 text-center text-gray-600">Loading available jobs...</div>
          ) : (
            (() => {
              const availableJobs = jobs.filter(j => !allApplications.some(a => a.jobId === (j._id || j.id)));
              if (availableJobs.length === 0) {
                return (
                  <div className="py-24 text-center">
                    <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No jobs available</h3>
                    <p className="text-lg text-gray-600 mb-4">Currently, there are no open jobs to apply for. Please check back later!</p>
                  </div>
                );
              }
              return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableJobs.map(job => (
                    <div
                      key={job._id || job.id}
                      className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{job.position || job.title}</h3>
                          <p className="text-sm text-blue-600 font-medium flex items-center mt-1">
                            <Building2 className="w-4 h-4 mr-1" />
                            {job.company}
                          </p>
                        </div>
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          {job.location || 'Not specified'}
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          {formatSalary(job.salary)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          {job.jobType || 'Full-time'}
                        </p>
                      </div>

                      {job.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleApplyForJob(job)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:to-blue-600 text-white py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </>
      )}
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              My Details
            </h2>
            <p className="text-gray-600">Keep your profile updated for each application</p>
          </div>
          <button
            onClick={saveProfile}
            disabled={profileSaving || profileLoading}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center ${
              profileSaving || profileLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {profileLoading ? (
          <div className="py-8 text-center text-gray-600">Loading profile...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
              <input
                type="text"
                value={profileForm.rollNumber}
                disabled
                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-100 text-gray-500"
                placeholder="Roll number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
              <select
                value={profileForm.branch}
                onChange={(e) => handleProfileChange('branch', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {['', 'CSE', 'ECE', 'ME', 'CE', 'EE'].map((branch) => (
                  <option key={branch} value={branch}>
                    {branch || 'Select branch'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={profileForm.cgpa}
                onChange={(e) => handleProfileChange('cgpa', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                value={profileForm.skills}
                onChange={(e) => handleProfileChange('skills', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="React, Node.js, SQL"
              />
            </div>
          </div>
        )}

        {profileError && (
          <p className="mt-4 text-sm text-red-600">{profileError}</p>
        )}
      </div>

      {/* Open Jobs - Only show for 'available-jobs' tab, but hidden due to new tab implementation */}
      {/* This section is now replaced by the available jobs tab above */}
        <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Open Jobs</h2>
            <p className="text-gray-600">Apply directly from your applications page</p>
          </div>
          <span className="text-sm font-medium text-gray-500">Total: {openJobs.length}</span>
        </div>

        {jobsLoading ? (
          <div className="py-10 text-center text-gray-600">Loading jobs...</div>
        ) : openJobs.length === 0 ? (
          <div className="py-10 text-center text-gray-600">No open jobs available right now</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {openJobs.map((job) => {
              const jobId = job._id || job.id;
              const isApplied = appliedJobIds.has(jobId);
              return (
                <div key={jobId} className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/40 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{job.position || job.title || 'Role'}</h3>
                      <p className="text-sm text-gray-600">{job.company || 'Company'} • {job.location || 'Location'}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {job.status || 'active'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Salary: <span className="font-semibold text-gray-900">{formatSalary(job.salary)}</span>
                  </div>
                  <button
                    onClick={() => handleApplyForJob(job)}
                    disabled={isApplied || applyingJobId === jobId}
                    className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                      isApplied
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isApplied ? 'Applied' : applyingJobId === jobId ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="glass-card p-20 rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="text-xl text-gray-600">Loading applications...</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-20 rounded-3xl text-center">
          <FileText className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-xl text-gray-600 mb-8">Your applications will appear here once you apply to jobs</p>
          <button
            onClick={() => setActiveTab('available-jobs')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl">
          <div className="grid gap-6">
            {applications.map((application) => {
              const StatusIcon = getStatusConfig(application.status).icon;
              return (
                <div
                  key={application.id}
                  className="group bg-white/40 backdrop-blur-xl p-8 rounded-3xl hover:shadow-2xl hover:scale-[1.02] transition-all border border-white/30 cursor-pointer hover:bg-white/60"
                  onClick={() => setSelectedApp(application)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/20">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{application.jobTitle}</h3>
                        <div className="flex items-center space-x-4 text-gray-700 mb-2">
                          <span className="font-semibold">{application.company}</span>
                          <span>•</span>
                          <span>{application.location}</span>
                          <span>•</span>
                          <span className="font-bold text-green-600">{formatSalary(application.salary)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Applied {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>
                            AI Match Score:{' '}
                            <span className="font-bold text-blue-600">{application.aiScore ? `${application.aiScore}%` : 'N/A'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`p-2 rounded-2xl shadow-lg ${getStatusConfig(application.status).color}`}>
                      <StatusIcon size={20} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Left: Feedback */}
                    <div>
                      <h4 className="font-bold text-lg mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Recruiter Feedback
                      </h4>
                      {application.feedback ? (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-l-4 border-blue-500">
                          <p className="text-gray-800 leading-relaxed">"{application.feedback}"</p>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Feedback pending</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Documents */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-lg mb-4">Documents</h4>
                        <div className="space-y-2">
                          {application.documents.length === 0 ? (
                            <div className="text-sm text-gray-500">No documents uploaded.</div>
                          ) : (
                            application.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-all">
                                <Download className="w-4 h-4 mr-3 text-gray-500" />
                                <span className="font-medium text-gray-900 mr-auto">{doc}</span>
                                <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3">
                          {application.status === 'applied' && (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(application.id, 'withdraw');
                                }}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all flex items-center"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Withdraw
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditApplication(application);
                                }}
                                className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-xl transition-all flex items-center"
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Application
                              </button>
                            </>
                          )}
                          {application.status === 'shortlisted' && (
                            <>
                              <button className="px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl transition-all flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Prepare Interview
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditApplication(application);
                                }}
                                className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-xl transition-all flex items-center"
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Application
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download this specific application
                              const appData = {
                                fullName: profile?.user?.name || applicationForm.fullName,
                                email: profile?.user?.email || applicationForm.email,
                                phone: profile?.user?.phone || profile?.phoneNumber || applicationForm.phone,
                                appliedCompany: application.company,
                                appliedPosition: application.jobTitle,
                                coverLetter: application.coverLetter || 'No cover letter provided',
                                notes: application.notes || '',
                                appliedDate: new Date(application.appliedDate).toLocaleDateString(),
                                status: application.status,
                                aiScore: application.aiScore,
                                feedback: application.feedback
                              };
                              generateApplicationPDF(appData);
                            }}
                            className="px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl transition-all flex items-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download this specific application
                              const appData = {
                                fullName: profile?.user?.name || applicationForm.fullName,
                                email: profile?.user?.email || applicationForm.email,
                                phone: profile?.user?.phone || profile?.phoneNumber || applicationForm.phone,
                                appliedCompany: application.company,
                                appliedPosition: application.jobTitle,
                                coverLetter: application.coverLetter || 'No cover letter provided',
                                notes: application.notes || '',
                                appliedDate: new Date(application.appliedDate).toLocaleDateString(),
                                status: application.status,
                                aiScore: application.aiScore,
                                feedback: application.feedback,
                                salary: formatSalary(application.salary),
                                location: application.location
                              };
                              generateApplicationPDF(appData);
                            }}
                            className="px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl transition-all flex items-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Save Job
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Builder Form */}
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileJson className="w-8 h-8 mr-3 text-blue-600" />
              Build Your Application
            </h2>
            <p className="text-gray-600 mt-1">Create a professional application with all your details, preview, and download as PDF</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Biographical Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Biographical Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={applicationForm.fullName}
                  onChange={(e) => handleApplicationFormChange('fullName', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => handleApplicationFormChange('email', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={applicationForm.phone}
                  onChange={(e) => handleApplicationFormChange('phone', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={applicationForm.linkedIn}
                  onChange={(e) => handleApplicationFormChange('linkedIn', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub</label>
                <input
                  type="url"
                  value={applicationForm.github}
                  onChange={(e) => handleApplicationFormChange('github', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website/Portfolio</label>
                <input
                  type="url"
                  value={applicationForm.website}
                  onChange={(e) => handleApplicationFormChange('website', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Summary</label>
                <textarea
                  rows="4"
                  value={applicationForm.summary}
                  onChange={(e) => handleApplicationFormChange('summary', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief summary of your professional background, skills, and career goals..."
                />
              </div>
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Work Experience
              </h3>
              <button
                onClick={addWorkExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {applicationForm.workExperience.map((exp, idx) => (
                <div key={idx} className="border border-gray-300 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">Experience #{idx + 1}</h4>
                    <button
                      onClick={() => removeWorkExperience(idx)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleWorkExperienceChange(idx, 'position', e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleWorkExperienceChange(idx, 'company', e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Company Name"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleWorkExperienceChange(idx, 'duration', e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Jan 2021 - Dec 2022"
                    />
                    <div></div>
                    <textarea
                      value={exp.details}
                      onChange={(e) => handleWorkExperienceChange(idx, 'details', e.target.value)}
                      className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
              {applicationForm.workExperience.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No work experiences added yet</p>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Skills
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a skill (press Enter or click Add)"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {applicationForm.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2 text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(idx)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Education
              </h3>
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {applicationForm.education.map((edu, idx) => (
                <div key={idx} className="border border-gray-300 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">Education #{idx + 1}</h4>
                    <button
                      onClick={() => removeEducation(idx)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Degree (e.g., B.Tech in Computer Science)"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Year (2024)"
                    />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                      className="md:col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Institution Name"
                    />
                  </div>
                </div>
              ))}
              {applicationForm.education.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No education added yet</p>
              )}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Certifications
              </h3>
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {applicationForm.certifications.map((cert, idx) => (
                <div key={idx} className="border border-gray-300 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">Certification #{idx + 1}</h4>
                    <button
                      onClick={() => removeCertification(idx)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(idx, 'name', e.target.value)}
                      className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Certification Name"
                    />
                    <input
                      type="text"
                      value={cert.year}
                      onChange={(e) => handleCertificationChange(idx, 'year', e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Year"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)}
                      className="md:col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Issuing Organization"
                    />
                  </div>
                </div>
              ))}
              {applicationForm.certifications.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No certifications added yet</p>
              )}
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Feather className="w-5 h-5 mr-2 text-blue-600" />
              Cover Letter
            </h3>
            <textarea
              rows="5"
              value={applicationForm.coverLetter}
              onChange={(e) => handleApplicationFormChange('coverLetter', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write a compelling cover letter explaining why you're a great fit for the position..."
            />
          </div>

          {/* Company Selection Section */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Target Company
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Company</label>
                <select
                  value={applicationForm.appliedCompany}
                  onChange={(e) => handleApplicationFormChange('appliedCompany', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a company...</option>
                  {[...new Set(openJobs.map(job => job.company || 'Unknown'))].map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Applied Position</label>
                <input
                  type="text"
                  value={applicationForm.appliedPosition}
                  onChange={(e) => handleApplicationFormChange('appliedPosition', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Job position title"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
            <button
              onClick={handleSaveDetailedApplication}
              disabled={savingApplication}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center shadow-lg ${
                savingApplication
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              {savingApplication ? 'Saving...' : 'Save Application Form'}
            </button>
            <button
              onClick={() => setShowApplicationPreview(true)}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center shadow-lg"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              Preview Application
            </button>
            <button
              onClick={handleDownloadApplication}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center shadow-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download as PDF
            </button>
            <button
              onClick={handleSaveDetailedApplication}
              disabled={savingApplication}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center shadow-lg ${
                savingApplication
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg'
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              {savingApplication ? 'Saving...' : 'Save Application'}
            </button>
          </div>

          {/* Success/Error Messages */}
          {applicationSaveError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 font-semibold">
              {applicationSaveError}
            </div>
          )}
          {applicationSaveSuccess && (
            <div className="mt-4 p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-700 font-semibold">
              {applicationSaveSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Application Preview Modal */}
      {showApplicationPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setShowApplicationPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div dangerouslySetInnerHTML={{ __html: previewApplicationHTML(applicationForm) }} />
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowApplicationPreview(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleDownloadApplication();
                    setShowApplicationPreview(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedApp.jobTitle} - {selectedApp.company}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusConfig(selectedApp.status).color}`}>
                    {getStatusConfig(selectedApp.status).label}
                  </span>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            {/* Full application details here */}
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                    Job Details
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div><span className="font-semibold">Role:</span> {selectedApp.jobTitle}</div>
                    <div><span className="font-semibold">Company:</span> {selectedApp.company}</div>
                    <div><span className="font-semibold">Location:</span> {selectedApp.location}</div>
                    <div><span className="font-semibold">Salary:</span> {formatSalary(selectedApp.salary)}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Application Info</h3>
                  <div className="space-y-2 text-gray-700">
                    <div><span className="font-semibold">Applied:</span> {new Date(selectedApp.appliedDate).toLocaleString()}</div>
                    <div><span className="font-semibold">Last Updated:</span> {new Date(selectedApp.updatedDate).toLocaleString()}</div>
                    <div><span className="font-semibold">Status:</span> {getStatusConfig(selectedApp.status).label}</div>
                    <div><span className="font-semibold">AI Match Score:</span> {selectedApp.aiScore ? `${selectedApp.aiScore}%` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Cover Letter</h3>
                  {selectedApp.coverLetter ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                  ) : (
                    <p className="text-gray-500">No cover letter provided.</p>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Notes</h3>
                  {selectedApp.notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.notes}</p>
                  ) : (
                    <p className="text-gray-500">No notes added.</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Recruiter Feedback
                </h3>
                {selectedApp.feedback ? (
                  <p className="text-gray-800">"{selectedApp.feedback}"</p>
                ) : (
                  <p className="text-gray-500">Feedback pending.</p>
                )}
              </div>

              {(selectedApp.status === 'applied' || selectedApp.status === 'shortlisted') && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openEditApplication(selectedApp)}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Application
                  </button>
                  <button
                    onClick={() => handleAction(selectedApp.id, 'withdraw')}
                    className="px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Withdraw
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Apply for {applyJob.position || applyJob.title || 'Role'}</h2>
                <p className="text-gray-600">{applyJob.company || 'Company'} • {applyJob.location || 'Location'}</p>
              </div>
              <button
                onClick={() => setApplyJob(null)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-blue-900 flex items-center mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Your Profile Information
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><span className="font-semibold">Name:</span> {profile?.user?.name || 'Not set'}</p>
                  <p><span className="font-semibold">Email:</span> {profile?.user?.email || 'Not set'}</p>
                  <p><span className="font-semibold">Phone:</span> {profile?.user?.phone || profile?.phoneNumber || 'Not set'}</p>
                  <p><span className="font-semibold">Branch:</span> {profile?.branch || 'N/A'} | <span className="font-semibold">CGPA:</span> {profile?.cgpa || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter *</label>
                <textarea
                  rows="5"
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a compelling cover letter explaining why you're perfect for this role..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  rows="3"
                  value={applyForm.notes}
                  onChange={(e) => setApplyForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any extra details for the recruiter - availability, expectations, etc..."
                />
              </div>
              {applyError && <p className="text-sm text-red-600">{applyError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setApplyJob(null)}
                  className="px-6 py-2 rounded-xl font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={applyingJobId === (applyJob._id || applyJob.id)}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    applyingJobId === (applyJob._id || applyJob.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {applyingJobId === (applyJob._id || applyJob.id) ? 'Applying...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
                <p className="text-gray-600">{editApp.jobTitle} • {editApp.company}</p>
              </div>
              <button
                onClick={() => setEditApp(null)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-amber-900 flex items-center mb-2">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Your Application
                </h3>
                <p className="text-sm text-amber-800">You can update your cover letter and notes below. Changes will be saved to this application.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
                <textarea
                  rows="5"
                  value={editForm.coverLetter}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Update your cover letter..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Update additional notes..."
                />
              </div>
              {editError && <p className="text-sm text-red-600">{editError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditApp(null)}
                  className="px-6 py-2 rounded-xl font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEditApplication}
                  disabled={editSaving}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    editSaving ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
