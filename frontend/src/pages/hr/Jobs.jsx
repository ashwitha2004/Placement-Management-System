import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from "../../utils/api";
import { applicationsAPI, notificationsAPI } from '../../services/api';
import jsPDF from 'jspdf';
import { 
  Briefcase, Plus, Search, Filter, Eye, Edit3, Trash2, Download, 
  CheckCircle, Clock, Star, Users, Award, XCircle, AlertCircle, CheckCheck, FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const HRJobs = ({ jobs, setJobs }) => {
  const userRoleFromStorage = localStorage.getItem('userRole') || localStorage.getItem('role') || 'hr_manager';
  const normalizedRole = String(userRoleFromStorage).toLowerCase();
  const defaultRole = normalizedRole.includes('recruit') ? 'Recruiter' : 'HR Manager';

  // Only declare each state once
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterDeadlineDays, setFilterDeadlineDays] = useState('all');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');
  const [filterSalaryMax, setFilterSalaryMax] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [savedViewName, setSavedViewName] = useState('');
  const [savedViews, setSavedViews] = useState(() => {
    try {
      const stored = localStorage.getItem('hr_jobs_saved_views_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const stored = localStorage.getItem('hr_jobs_activity_log_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [actorRole, setActorRole] = useState(defaultRole);
  const [notifyStudentsOnCreate, setNotifyStudentsOnCreate] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [jobApplications, setJobApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const importInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hr_jobs_saved_views_v1', JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    localStorage.setItem('hr_jobs_activity_log_v1', JSON.stringify(activityLog.slice(0, 100)));
  }, [activityLog]);
  
  // Form state
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    description: '',
    salary: '',
    location: '',
    jobType: 'Full-time',
    skills: '',
    eligibility: '',
    applicationDeadline: ''
  });

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addActivity = (action, details = '') => {
    const entry = {
      id: Date.now(),
      action,
      details,
      role: actorRole,
      at: new Date().toISOString()
    };
    setActivityLog((prev) => [entry, ...prev].slice(0, 100));
  };

  const parseSalaryValue = (salary) => {
    if (salary == null) return null;
    if (typeof salary === 'number') return salary;
    if (typeof salary === 'object') {
      const min = typeof salary.min === 'number' ? salary.min : null;
      const max = typeof salary.max === 'number' ? salary.max : null;
      return max ?? min;
    }

    const text = String(salary);
    const nums = text.match(/[\d,.]+/g);
    if (!nums || nums.length === 0) return null;
    const first = Number(nums[0].replace(/,/g, ''));
    return Number.isFinite(first) ? first : null;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      description: '',
      salary: '',
      location: '',
      jobType: 'Full-time',
      skills: '',
      eligibility: '',
      applicationDeadline: ''
    });
    setFormError('');
    setFormSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.company.trim() || !formData.position.trim() || !formData.location.trim()) {
      setFormError('Company, position, and location are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company: formData.company,
        position: formData.position,
        description: formData.description,
        salary: formData.salary || {},
        location: formData.location,
        jobType: formData.jobType,
        skills: formData.skills,
        eligibility: formData.eligibility || {},
        applicationDeadline: formData.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      if (editingJob) {
        // Update existing job
        const res = await api.put(`/jobs/${editingJob._id || editingJob.id}`, payload);
        setJobs(prev => prev.map(job => 
          (job._id || job.id) === (editingJob._id || editingJob.id) ? res.data.job : job
        ));
        addActivity('Updated job', payload.position || payload.company || 'Job');
        setFormSuccess('Job updated successfully!');
      } else {
        // Create new job
        const res = await api.post('/jobs', payload);
        setJobs(prev => [...prev, res.data.job]);
        addActivity('Created job', payload.position || payload.company || 'Job');

        if (notifyStudentsOnCreate) {
          try {
            await notificationsAPI.sendBulk({
              title: 'New Job Posted',
              message: `A new role is open: ${payload.position || 'Job opening'} at ${payload.company || 'Company'}`,
              type: 'job-alert'
            });
            addActivity('Triggered notification', payload.position || 'Job opening');
          } catch (notifyError) {
            console.warn('Job notification trigger failed:', notifyError?.message || notifyError);
          }
        }
        setFormSuccess('Job posted successfully!');
      }

      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
        setEditingJob(null);
      }, 1500);
    } catch (error) {
      console.error('Error posting job:', error);
      setFormError(
        error.response?.data?.message || 
        error.message || 
        'Error posting job. Please check your permissions and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal for editing
  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      company: job.company || '',
      position: job.position || job.title || '',
      description: job.description || '',
      salary: job.salary || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      eligibility: job.eligibility || '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingJob(null);
    resetForm();
    setShowCreateModal(true);
  };

  // Mock data for development
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer (React)',
      company: 'TechCorp Innovations',
      location: 'Bangalore, KA',
      salary: '₹12-18 LPA',
      applications: 47,
      status: 'active',
      postedDate: '2026-01-20',
      expiryDate: '2026-02-20',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Node.js'],
      views: 1247,
      bookmarks: 23
    },
    {
      id: '2',
      title: 'Fullstack Engineer (MERN)',
      company: 'FinTech Solutions',
      location: 'Remote',
      salary: '₹15-22 LPA',
      applications: 23,
      status: 'active',
      postedDate: '2026-01-22',
      expiryDate: '2026-02-15',
      skills: ['MongoDB', 'Express', 'React', 'Node.js'],
      views: 892,
      bookmarks: 15
    },
    {
      id: '3',
      title: 'Backend Developer (Python/Django)',
      company: 'HealthAI Labs',
      location: 'Hyderabad, TS',
      salary: '₹10-15 LPA',
      applications: 12,
      status: 'draft',
      postedDate: '2026-01-25',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      views: 156,
      bookmarks: 8
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      company: 'CloudScale Inc',
      location: 'Pune, MH',
      salary: '₹14-20 LPA',
      applications: 89,
      status: 'closed',
      postedDate: '2025-12-10',
      expiryDate: '2026-01-10',
      skills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
      views: 2345,
      bookmarks: 67
    }
  ];

  // Use jobs prop directly, filter as needed
  const jobsSource = Array.isArray(jobs) && jobs.length ? jobs : [];

  const normalizeSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return String(skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'number') return `₹${salary.toLocaleString('en-IN')}`;
    if (typeof salary === 'object') {
      const min = salary.min ? `₹${salary.min.toLocaleString('en-IN')}` : '';
      const max = salary.max ? `₹${salary.max.toLocaleString('en-IN')}` : '';
      if (min && max) return `${min} - ${max}`;
      if (min) return min;
      if (max) return max;
      return 'Not specified';
    }
    return 'Not specified';
  };

  const formatDateSafe = (dateValue) => {
    if (!dateValue) return 'TBD';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString('en-IN');
  };

  const formatDistanceSafe = (dateValue) => {
    if (!dateValue) return 'date unavailable';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'date unavailable';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getDaysLeft = (dateValue) => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getLocationType = (location) => {
    const value = (location || '').toLowerCase();
    if (value.includes('remote')) return 'Remote';
    if (value.includes('hybrid')) return 'Hybrid';
    return 'Onsite';
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) {
        setFormError('CSV file has no data rows to import.');
        event.target.value = '';
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1);
      const createdJobs = [];

      for (const row of rows) {
        const cols = row.split(',').map((c) => c.trim());
        const mapValue = (key, fallback = '') => {
          const idx = headers.indexOf(key);
          return idx >= 0 ? (cols[idx] || fallback) : fallback;
        };

        const payload = {
          position: mapValue('position', mapValue('title', '')),
          company: mapValue('company', ''),
          location: mapValue('location', ''),
          jobType: mapValue('jobtype', 'Full-time'),
          salary: mapValue('salary', ''),
          skills: mapValue('skills', ''),
          description: mapValue('description', ''),
          eligibility: mapValue('eligibility', ''),
          applicationDeadline: mapValue('applicationdeadline', '') || undefined
        };

        if (!payload.position || !payload.company || !payload.location) continue;

        try {
          const res = await api.post('/jobs', payload);
          if (res?.data?.job) createdJobs.push(res.data.job);
        } catch (rowError) {
          console.warn('Failed to import row:', payload.position, rowError?.message || rowError);
        }
      }

      if (createdJobs.length > 0) {
        setJobs((prev) => [...prev, ...createdJobs]);
        addActivity('Imported jobs from CSV', `${createdJobs.length} records`);
        setFormSuccess(`Imported ${createdJobs.length} job(s) from ${file.name}.`);
      } else {
        setFormError('No valid rows were imported from the CSV.');
      }
    } catch (error) {
      setFormError('Failed to import CSV file.');
    }
    event.target.value = '';
  };

  const openApplicationsModal = async (job) => {
    const jobId = job?._id || job?.id;
    if (!jobId) return;
    setSelectedJob(job);
    setShowApplicationsModal(true);
    setApplicationsLoading(true);
    setApplicationsError('');
    try {
      const res = await applicationsAPI.getJobApplications(jobId);
      const apps = res.data?.applications || [];
      const mapped = apps.map((app) => ({
        id: app._id,
        studentName: app.student?.user?.name || app.student?.name || 'Student',
        studentEmail: app.student?.user?.email || app.student?.email || 'No email',
        status: app.status || 'pending',
        appliedDate: app.createdAt || null
      }));
      setJobApplications(mapped);
    } catch (error) {
      console.error('Failed to fetch job applications:', error);
      setApplicationsError(error.response?.data?.message || 'Failed to load applications');
      setJobApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setJobApplications([]);
    setApplicationsError('');
  };

  // Download job requisition as PDF
  const downloadJobPDF = (job) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Job Details', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('GenAI Placement System', 105, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    let yPos = 50;
    
    // Job Position
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(job.position || job.title || 'N/A', 20, yPos);
    yPos += 8;
    
    // Company
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Company: ${job.company || 'N/A'}`, 20, yPos);
    yPos += 10;
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Job Details Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Job Information', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Location: ${job.location || 'N/A'}`, 20, yPos);
    yPos += 6;
    doc.text(`Job Type: ${job.jobType || job.employmentType || 'Full-time'}`, 20, yPos);
    yPos += 6;
    doc.text(`Salary: ${formatSalary(job.salary)}`, 20, yPos);
    yPos += 6;
    doc.text(`Status: ${job.status || 'active'}`, 20, yPos);
    yPos += 6;
    doc.text(`Applications: ${job.applications || 0}`, 20, yPos);
    yPos += 6;
    doc.text(`Views: ${job.views || 0}`, 20, yPos);
    yPos += 6;
    doc.text(`Posted: ${formatDateSafe(job.createdAt || job.postedDate)}`, 20, yPos);
    yPos += 10;
    
    // Required Skills
    if (job.skills) {
      doc.setFont(undefined, 'bold');
      doc.text('Required Skills:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const skillLines = doc.splitTextToSize(job.skills, 170);
      doc.text(skillLines, 20, yPos);
      yPos += (skillLines.length * 6) + 4;
    }
    
    // Eligibility
    if (job.eligibility) {
      doc.setFont(undefined, 'bold');
      doc.text('Eligibility Criteria:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const eligLines = doc.splitTextToSize(job.eligibility, 170);
      doc.text(eligLines, 20, yPos);
      yPos += (eligLines.length * 6) + 4;
    }
    
    // Job Description
    if (job.description) {
      doc.setFont(undefined, 'bold');
      doc.text('Job Description:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(job.description, 170);
      doc.text(descLines, 20, yPos);
      yPos += (descLines.length * 6);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('GenAI Placement System - Confidential', 105, 285, { align: 'center' });
    
    // Save the PDF
    const fileName = `Job_${(job.position || job.title || 'Details').replace(/\\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  const filteredJobs = jobsSource.filter(job => {
    const title = (job.position || job.title || '').toLowerCase();
    const company = (job.company || '').toLowerCase();
    const location = (job.location || '').toLowerCase();
    const jobType = (job.jobType || job.employmentType || '').toLowerCase();
    const skills = normalizeSkills(job.skills).map((skill) => skill.toLowerCase());
    const salaryValue = parseSalaryValue(job.salary);
    const daysLeft = getDaysLeft(job.applicationDeadline || job.expiryDate);

    const matchesSearch = title.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || location.includes(filterLocation.toLowerCase());
    const matchesJobType = filterJobType === 'all' || jobType === filterJobType.toLowerCase();
    const matchesSkill = !filterSkill.trim() || skills.some((skill) => skill.includes(filterSkill.toLowerCase()));

    const minSalary = filterSalaryMin ? Number(filterSalaryMin) : null;
    const maxSalary = filterSalaryMax ? Number(filterSalaryMax) : null;
    const matchesSalaryMin = minSalary == null || (salaryValue != null && salaryValue >= minSalary);
    const matchesSalaryMax = maxSalary == null || (salaryValue != null && salaryValue <= maxSalary);

    let matchesDeadline = true;
    if (filterDeadlineDays !== 'all') {
      const days = Number(filterDeadlineDays);
      matchesDeadline = daysLeft != null && daysLeft >= 0 && daysLeft <= days;
    }

    return matchesSearch && matchesStatus && matchesLocation && matchesJobType && matchesSkill && matchesSalaryMin && matchesSalaryMax && matchesDeadline;
  });

  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'latest') {
      const aDate = new Date(a.createdAt || a.postedDate || 0).getTime();
      const bDate = new Date(b.createdAt || b.postedDate || 0).getTime();
      return bDate - aDate;
    }
    if (sortBy === 'applications') {
      return (b.applications ?? b.applicants ?? 0) - (a.applications ?? a.applicants ?? 0);
    }
    if (sortBy === 'salary') {
      return (parseSalaryValue(b.salary) || 0) - (parseSalaryValue(a.salary) || 0);
    }
    if (sortBy === 'deadline') {
      const aDays = getDaysLeft(a.applicationDeadline || a.expiryDate);
      const bDays = getDaysLeft(b.applicationDeadline || b.expiryDate);
      return (aDays ?? 9999) - (bDays ?? 9999);
    }
    return 0;
  });

  const uniqueLocations = useMemo(
    () => Array.from(new Set(jobsSource.map((job) => (job.location || '').trim()).filter(Boolean))),
    [jobsSource]
  );

  const uniqueJobTypes = useMemo(
    () => Array.from(new Set(jobsSource.map((job) => (job.jobType || job.employmentType || '').trim()).filter(Boolean))),
    [jobsSource]
  );

  const totalViews = jobsSource.reduce((sum, job) => sum + (job.views || 0), 0);
  const totalApplications = jobsSource.reduce((sum, job) => sum + (job.applications || job.applicants || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0.0';
  const closedJobs = jobsSource.filter((job) => (job.status || '').toLowerCase() === 'closed');
  const avgTimeToFillDays = closedJobs.length
    ? Math.round(
        closedJobs.reduce((sum, job) => {
          const created = new Date(job.createdAt || job.postedDate || Date.now()).getTime();
          const closed = new Date(job.updatedAt || Date.now()).getTime();
          return sum + Math.max(0, Math.round((closed - created) / (1000 * 60 * 60 * 24)));
        }, 0) / closedJobs.length
      )
    : 0;

  const sourceTracking = jobsSource.reduce(
    (acc, job) => {
      const type = getLocationType(job.location);
      if (type === 'Remote') acc.remote += 1;
      else if (type === 'Hybrid') acc.hybrid += 1;
      else acc.onsite += 1;
      return acc;
    },
    { remote: 0, hybrid: 0, onsite: 0 }
  );

  const toggleSelectJob = (jobId) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const selectAllFiltered = () => {
    const ids = sortedFilteredJobs.map((job) => job._id || job.id).filter(Boolean);
    setSelectedJobIds(ids);
  };

  const clearSelection = () => setSelectedJobIds([]);

  const exportJobsToCsv = (jobsToExport, fileName = 'jobs-export.csv') => {
    const header = ['position', 'company', 'location', 'status', 'jobType', 'salary', 'applications', 'views', 'skills'];
    const rows = jobsToExport.map((job) => [
      job.position || job.title || '',
      job.company || '',
      job.location || '',
      job.status || '',
      job.jobType || job.employmentType || '',
      formatSalary(job.salary),
      job.applications ?? job.applicants ?? 0,
      job.views ?? 0,
      normalizeSkills(job.skills).join('; ')
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = () => {
    const selected = jobsSource.filter((job) => selectedJobIds.includes(job._id || job.id));
    if (selected.length === 0) {
      setFormError('Select at least one job to export.');
      return;
    }
    exportJobsToCsv(selected, `jobs-selected-${Date.now()}.csv`);
    addActivity('Exported selected jobs', `${selected.length} records`);
  };

  const handleBulkClose = async () => {
    if (actorRole === 'Recruiter') {
      setFormError('Recruiter role cannot close jobs.');
      return;
    }
    const selected = jobsSource.filter((job) => selectedJobIds.includes(job._id || job.id));
    if (selected.length === 0) {
      setFormError('Select at least one job to close.');
      return;
    }

    await Promise.allSettled(
      selected.map((job) => api.put(`/jobs/${job._id || job.id}`, { ...job, status: 'closed' }))
    );

    setJobs((prev) =>
      prev.map((job) =>
        selectedJobIds.includes(job._id || job.id) ? { ...job, status: 'closed' } : job
      )
    );
    addActivity('Bulk closed jobs', `${selected.length} records`);
    setFormSuccess(`Closed ${selected.length} selected job(s).`);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    if (actorRole === 'Recruiter') {
      setFormError('Recruiter role cannot delete jobs.');
      return;
    }
    const selected = jobsSource.filter((job) => selectedJobIds.includes(job._id || job.id));
    if (selected.length === 0) {
      setFormError('Select at least one job to delete.');
      return;
    }
    if (!window.confirm(`Delete ${selected.length} selected job(s)? This cannot be undone.`)) return;

    await Promise.allSettled(selected.map((job) => api.delete(`/jobs/${job._id || job.id}`)));
    setJobs((prev) => prev.filter((job) => !selectedJobIds.includes(job._id || job.id)));
    addActivity('Bulk deleted jobs', `${selected.length} records`);
    setFormSuccess(`Deleted ${selected.length} selected job(s).`);
    clearSelection();
  };

  const buildCurrentViewPayload = () => ({
    searchTerm,
    filterStatus,
    filterLocation,
    filterJobType,
    filterSkill,
    filterDeadlineDays,
    filterSalaryMin,
    filterSalaryMax,
    sortBy
  });

  const saveCurrentView = () => {
    if (!savedViewName.trim()) {
      setFormError('Enter a name for the saved view.');
      return;
    }
    const id = `view-${Date.now()}`;
    const next = [...savedViews, { id, name: savedViewName.trim(), payload: buildCurrentViewPayload() }];
    setSavedViews(next);
    setSavedViewName('');
    setActiveSavedViewId(id);
    addActivity('Saved filter view', savedViewName.trim());
  };

  const applySavedView = (viewId) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;
    const p = view.payload;
    setSearchTerm(p.searchTerm || '');
    setFilterStatus(p.filterStatus || 'all');
    setFilterLocation(p.filterLocation || 'all');
    setFilterJobType(p.filterJobType || 'all');
    setFilterSkill(p.filterSkill || '');
    setFilterDeadlineDays(p.filterDeadlineDays || 'all');
    setFilterSalaryMin(p.filterSalaryMin || '');
    setFilterSalaryMax(p.filterSalaryMax || '');
    setSortBy(p.sortBy || 'latest');
    setActiveSavedViewId(viewId);
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: 'bg-emerald-100 text-emerald-800', label: 'Active', icon: CheckCircle },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: Edit3 },
      closed: { color: 'bg-gray-200 text-gray-700', label: 'Closed', icon: Clock },
      expired: { color: 'bg-orange-100 text-orange-800', label: 'Expired', icon: Clock }
    };
    return configs[status] || configs.active;
  };

  const handleAction = async (jobId, action) => {
    if (action === 'delete') {
      if (actorRole === 'Recruiter') {
        setFormError('Recruiter role cannot delete jobs.');
        return;
      }
      if (confirm('Delete this job? This cannot be undone.')) {
        try {
          await api.delete(`/jobs/${jobId}`);
          setJobs(prev => prev.filter(job => (job._id || job.id) !== jobId));
          addActivity('Deleted job', String(jobId));
          setFormSuccess('Job deleted successfully!');
        } catch (error) {
          console.error('Delete failed:', error);
          setFormError('Failed to delete job. ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  const JobCard = ({ job }) => {
    const StatusIcon = getStatusConfig(job.status).icon;
    const title = job.position || job.title || 'Role';
    const salaryLabel = formatSalary(job.salary);
    const skills = normalizeSkills(job.skills);
    const daysLeft = getDaysLeft(job.applicationDeadline || job.expiryDate);
    const applicants = job.applications ?? job.applicants ?? 0;
    const views = job.views ?? 0;
    const bookmarks = job.bookmarks ?? 0;

    return (
      <div 
        className="group bg-white p-7 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200/80 cursor-pointer"
        onClick={() => setSelectedJob(job)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">{title}</h3>
              <div className="flex items-center space-x-4 mb-2">
                <span className="font-bold text-xl text-emerald-700">{salaryLabel}</span>
                <span className="text-slate-400">•</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">{job.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-sky-50 text-sky-700 text-sm rounded-full font-medium border border-sky-100">
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full font-medium">
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Status */}
          <div className={`p-3 rounded-2xl shadow-lg flex-shrink-0 ${getStatusConfig(job.status).color}`}>
            <StatusIcon size={20} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">{applicants}</div>
            <p className="text-sm font-semibold text-slate-600">Applications</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">{views}</div>
            <p className="text-sm font-semibold text-slate-600">Views</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">{bookmarks}</div>
            <p className="text-sm font-semibold text-slate-600">Bookmarks</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-black ${daysLeft && daysLeft > 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-orange-600 to-red-600'} bg-clip-text text-transparent mb-1`}>
              {daysLeft && daysLeft > 0 ? `+${daysLeft}` : 'TBD'}
            </div>
            <p className="text-sm font-semibold text-slate-600">Days Left</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 opacity-100 transition-all">
          <div className="flex items-center space-x-3 text-sm font-medium text-slate-500">
            Posted {formatDistanceSafe(job.createdAt || job.postedDate)}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => { e.stopPropagation(); openEditModal(job); }}
              className="p-2 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-xl transition-all"
              title="Edit"
            >
              <Edit3 size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAction(job.id || job._id, 'delete'); }}
              className="p-2 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete"
              disabled={actorRole === 'Recruiter'}
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); openApplicationsModal(job); }}
              className="p-2 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-xl transition-all"
              title="View Applications"
            >
              <Users size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); downloadJobPDF(job); }}
              className="p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-xl transition-all"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hr-dashboard space-y-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent mb-2">
            Job Management
          </h1>
          <p className="text-2xl font-semibold text-slate-200">Create, manage, and track job postings</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center p-6 bg-white rounded-3xl border border-slate-200 shadow-md">
          <div>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{jobsSource.length}</div>
            <p className="text-sm font-semibold text-slate-600">Total Jobs</p>
          </div>
          <div>
            <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{conversionRate}%</div>
            <p className="text-sm font-semibold text-slate-600">View to Apply</p>
          </div>
          <div>
            <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{avgTimeToFillDays}d</div>
            <p className="text-sm font-semibold text-slate-600">Avg Time to Fill</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Source Tracking</p>
          <p className="text-sm text-slate-800 mt-2">Remote: <span className="font-bold">{sourceTracking.remote}</span></p>
          <p className="text-sm text-slate-800">Hybrid: <span className="font-bold">{sourceTracking.hybrid}</span></p>
          <p className="text-sm text-slate-800">Onsite: <span className="font-bold">{sourceTracking.onsite}</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Role Access</p>
          <div className="mt-2 flex items-center gap-2">
            <label className="text-sm text-slate-600 font-semibold">Acting as</label>
            <select
              value={actorRole}
              onChange={(e) => setActorRole(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800"
            >
              <option value="HR Manager">HR Manager</option>
              <option value="Recruiter">Recruiter</option>
            </select>
          </div>
          <p className="text-xs text-slate-600 mt-2">Recruiter cannot close or delete jobs.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Saved Views</p>
          <div className="mt-2 flex gap-2">
            <input
              value={savedViewName}
              onChange={(e) => setSavedViewName(e.target.value)}
              placeholder="View name"
              className="flex-1 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-sm text-slate-800 placeholder:text-slate-500"
            />
            <button onClick={saveCurrentView} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">Save</button>
          </div>
          <select
            value={activeSavedViewId}
            onChange={(e) => applySavedView(e.target.value)}
            className="mt-2 w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-sm text-slate-800"
          >
            <option value="">Select saved view</option>
            {savedViews.map((view) => (
              <option key={view.id} value={view.id}>{view.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl flex flex-col gap-4 border border-slate-300 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-6 h-6 text-blue-700" />
            <input
              type="text"
              placeholder="Search job titles, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-50 outline-none text-lg text-slate-800 placeholder-slate-500 font-medium px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-700" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl font-semibold text-slate-800">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl text-slate-800 font-semibold">
            <option value="latest">Sort: Latest</option>
            <option value="applications">Sort: Most Applications</option>
            <option value="salary">Sort: Highest Salary</option>
            <option value="deadline">Sort: Expiring Soon</option>
          </select>
          <button
            onClick={() => openCreateModal()}
            className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all ml-auto lg:ml-0 flex items-center"
          >
            <Plus className="mr-2 w-6 h-6" />
            Post New Job
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800">
            <option value="all">All Locations</option>
            {uniqueLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)} className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800">
            <option value="all">All Job Types</option>
            {uniqueJobTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <input value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} placeholder="Skill tag" className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-500" />
          <select value={filterDeadlineDays} onChange={(e) => setFilterDeadlineDays(e.target.value)} className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800">
            <option value="all">Any Deadline</option>
            <option value="7">Due in 7 days</option>
            <option value="15">Due in 15 days</option>
            <option value="30">Due in 30 days</option>
          </select>
          <input type="number" value={filterSalaryMin} onChange={(e) => setFilterSalaryMin(e.target.value)} placeholder="Min salary" className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-500" />
          <input type="number" value={filterSalaryMax} onChange={(e) => setFilterSalaryMax(e.target.value)} placeholder="Max salary" className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-500" />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={handleImportClick} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Import CSV</button>
          <button onClick={() => exportJobsToCsv(sortedFilteredJobs, `jobs-filtered-${Date.now()}.csv`)} className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-semibold">Export Filtered CSV</button>
          <button onClick={selectAllFiltered} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-sm font-semibold">Select Filtered</button>
          <button onClick={clearSelection} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">Clear Selection</button>
          <label className="flex items-center gap-2 text-sm text-slate-800 font-medium ml-auto">
            <input type="checkbox" checked={notifyStudentsOnCreate} onChange={(e) => setNotifyStudentsOnCreate(e.target.checked)} />
            Notify students on new post
          </label>
        </div>

        <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportChange} />
      </div>

      {selectedJobIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <p className="font-semibold">{selectedJobIds.length} selected</p>
          <button onClick={handleBulkClose} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-bold">Close Selected</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold">Delete Selected</button>
          <button onClick={handleBulkExport} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-900 text-sm font-bold">Export Selected</button>
          <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm font-bold">Clear</button>
        </div>
      )}

      {/* Jobs Grid */}
      {sortedFilteredJobs.length === 0 ? (
        <div className="glass-card p-20 rounded-3xl text-center">
          <Briefcase className="w-24 h-24 text-gray-400 mx-auto mb-8" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No jobs found</h3>
          <p className="text-lg text-gray-600 mb-8">Try adjusting your search or filters</p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl">
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-8 rounded-3xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {sortedFilteredJobs.map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Activity Log</h3>
        {activityLog.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {activityLog.slice(0, 12).map((entry) => (
              <div key={entry.id} className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-semibold">{entry.action}</span>
                {entry.details ? <span> - {entry.details}</span> : null}
                <span className="text-slate-500"> ({new Date(entry.at).toLocaleString()})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job Requisition' : 'Create New Job Requisition'}
                </h2>
                <p className="text-gray-600 mt-1">Post job opportunities in your Talent Pool</p>
              </div>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-200 rounded-2xl transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Error Message */}
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Error</p>
                  <p className="text-red-800">{formError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {formSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">Success</p>
                  <p className="text-emerald-800">{formSuccess}</p>
                </div>
              </div>
            )}
            
            {/* Job Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase size={20} />
                  Job Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Job Position *
                    </label>
                    <input 
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Frontend Developer"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input 
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. TechCorp Innovations"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input 
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangalore, KA"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select 
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Compensation & Requirements */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Compensation & Requirements
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input 
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. ₹12-18 LPA"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input 
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Required Skills
                    </label>
                    <input 
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Eligibility Criteria
                    </label>
                    <input 
                      type="text"
                      name="eligibility"
                      value={formData.eligibility}
                      onChange={handleInputChange}
                      placeholder="e.g. Minimum CGPA: 7.0, CS/IT Branch"
                      className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Job Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Job Description
                </h3>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the role, responsibilities, and what makes your company great..."
                  rows="6"
                  className="w-full p-3 border border-gray-300 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingJob ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {editingJob ? 'Update Job' : 'Post Job'}
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-8 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Requisitions Section */}
      <div className="space-y-6 mt-12 pt-8 border-t border-gray-200">
        {/* Custom Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-12 w-12 opacity-90 drop-shadow-lg" />
              <div className="text-right">
                <p className="text-sm font-extrabold opacity-95 tracking-wide">Active Jobs</p>
                <p className="text-4xl font-black">{jobs.filter(j => j.status === 'active').length}</p>
              </div>
            </div>
            <div className="h-2 bg-white/40 rounded-full mt-4">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl p-6 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-12 w-12 opacity-90 drop-shadow-lg" />
              <div className="text-right">
                <p className="text-sm font-extrabold opacity-95 tracking-wide">Total Applications</p>
                <p className="text-4xl font-black">{jobs.reduce((sum, j) => sum + (j.applications || 0), 0)}</p>
              </div>
            </div>
            <div className="h-2 bg-white/40 rounded-full mt-4">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl p-6 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-12 w-12 opacity-90 drop-shadow-lg" />
              <div className="text-right">
                <p className="text-sm font-extrabold opacity-95 tracking-wide">Total Views</p>
                <p className="text-4xl font-black">{jobs.reduce((sum, j) => sum + (j.views || 0), 0)}</p>
              </div>
            </div>
            <div className="h-2 bg-white/40 rounded-full mt-4">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-12 w-12 opacity-90 drop-shadow-lg" />
              <div className="text-right">
                <p className="text-sm font-extrabold opacity-95 tracking-wide">Companies</p>
                <p className="text-4xl font-black">{new Set(jobs.map(j => j.company)).size}</p>
              </div>
            </div>
            <div className="h-2 bg-white/40 rounded-full mt-4">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Job Requisitions & Offer Management
          </h2>
          <p className="text-xl font-bold text-gray-700">Manage all open positions and applicant pipelines</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:shadow-cyan-500/50 transition-all flex items-center transform hover:scale-105"
          >
            <Plus className="mr-2 w-6 h-6" />
            Create Job
          </button>
          <button
            onClick={handleImportClick}
            className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center transform hover:scale-105"
          >
            <Download className="mr-2 w-6 h-6" />
            Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportChange}
          />
        </div>

        {/* Requisitions Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Pending Approvals</h3>
              <Clock className="w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="text-5xl font-black mb-2">12</div>
            <p className="text-sm font-bold opacity-90">Awaiting HR approval</p>
            <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">In Recruitment</h3>
              <Users className="w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="text-5xl font-black mb-2">34</div>
            <p className="text-sm font-bold opacity-90">Active recruitment pipeline</p>
            <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 rounded-3xl p-6 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Offer Extended</h3>
              <CheckCircle className="w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="text-5xl font-black mb-2">28</div>
            <p className="text-sm font-bold opacity-90">Pending candidate acceptance</p>
            <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Talent Pool</h3>
              <Star className="w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="text-5xl font-black mb-2">156</div>
            <p className="text-sm font-bold opacity-90">Qualified candidates</p>
            <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full shadow-lg" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        {/* Requisition Details Table */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl border-2 border-purple-200 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-2 border-gradient-to-r from-blue-300 to-purple-300">
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Briefcase size={28} />
              Active Job Requisitions
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={sortedFilteredJobs.length > 0 && selectedJobIds.length === sortedFilteredJobs.length}
                      onChange={(e) => {
                        if (e.target.checked) selectAllFiltered();
                        else clearSelection();
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Applicants</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Active</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Onsite</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Posted</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedFilteredJobs.map((req) => (
                  <tr key={req._id || req.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.includes(req._id || req.id)}
                        onChange={() => toggleSelectJob(req._id || req.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{req.position || req.title || 'Role'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{req.applications ?? req.applicants ?? 0}</span>
                        <Users size={16} className="text-gray-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{req.views ?? 0}</span>
                        <Eye size={16} className="text-gray-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (req.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(req.status || 'inactive').toString().toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{formatSalary(req.salary)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{req.location || 'Not specified'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {getLocationType(req.location)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{formatDateSafe(req.createdAt || req.postedDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedJob(req)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => openApplicationsModal(req)}
                          className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all" 
                          title="View Applications"
                        >
                          <Users size={16} />
                        </button>
                        <button 
                          onClick={() => downloadJobPDF(req)}
                          className="p-2 hover:bg-purple-100 text-purple-600 rounded-lg transition-all" 
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offer Management Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award size={24} />
            Offer Management & Talent Pool
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pending Offers */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-lg">Pending Offers</h4>
              <div className="space-y-3">
                {[
                  { candidate: 'Rajesh Kumar', position: 'Senior Frontend Developer', date: 'Feb 5, 2026', status: 'Awaiting Response' },
                  { candidate: 'Priya Sharma', position: 'Data Scientist', date: 'Feb 3, 2026', status: 'Negotiating' },
                  { candidate: 'Amit Singh', position: 'DevOps Engineer', date: 'Feb 1, 2026', status: 'Offer Sent' }
                ].map((offer, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{offer.candidate}</p>
                        <p className="text-sm text-gray-600">{offer.position}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Sent: {offer.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Talent */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-lg">Top Talents in Pool</h4>
              <div className="space-y-3">
                {[
                  { name: 'Neha Gupta', skills: 'React, Node.js, MongoDB', rating: 4.8 },
                  { name: 'Vikas Patel', skills: 'Python, AWS, Docker', rating: 4.7 },
                  { name: 'Sneha Iyer', skills: 'Java, Spring Boot, SQL', rating: 4.9 }
                ].map((talent, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{talent.name}</p>
                        <p className="text-sm text-gray-600">{talent.skills}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-800">{talent.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Talent Pool Resumes */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star size={22} />
              Talent Pool - ATS Scores & Resumes
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ATS Score</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    name: 'Aditya Verma',
                    role: 'Frontend Developer',
                    atsScore: 92,
                    resumeUrl: 'https://www.bing.com/images/search?view=detailV2&ccid=DaBBgrJs&id=4636FF50B11AC1C3E2C2E2B6347C6100ABFFD8D5&thid=OIP.DaBBgrJsITH2zPtDi2bQPwHaLh&mediaurl=https%3a%2f%2fs3.ap-south-1.amazonaws.com%2fmployee.me%2fwebsite%2fresume-scan-new%2fsuccess%2bstories%2fats%2bresume%2bwith%2b4%2byears%2bexperience.webp&exph=3300&expw=2121&q=resume+online+with+ats+score&FORM=IRPRST&ck=3C15D885F3BD56E90B8305D8DAE16600&selectedIndex=1&itb=0'
                  },
                  {
                    name: 'Kavya Nair',
                    role: 'Data Analyst',
                    atsScore: 58,
                    resumeUrl: 'https://codewithcurious.com/wp-content/uploads/2025/10/Yadnyeyesh_Raut_Resume_page-0001.jpg'
                  },
                  {
                    name: 'Siddharth Rao',
                    role: 'DevOps Engineer',
                    atsScore: 74,
                    resumeUrl: 'https://imgv2-1-f.scribdassets.com/img/document/810627675/original/5c980df5bb/1?v=1'
                  }
                ].map((talent) => (
                  <tr key={talent.name} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{talent.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{talent.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        talent.atsScore >= 85 ? 'bg-emerald-100 text-emerald-800' :
                        talent.atsScore >= 70 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {talent.atsScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={talent.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-bold"
                      >
                        View Resume
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showApplicationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Applications</h3>
                <p className="text-sm text-gray-600">
                  {selectedJob?.position || selectedJob?.title || 'Job'}
                </p>
              </div>
              <button
                onClick={closeApplicationsModal}
                className="text-gray-500 hover:text-gray-700 font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {applicationsLoading ? (
                <div className="py-10 text-center text-gray-600">Loading applications...</div>
              ) : applicationsError ? (
                <div className="py-10 text-center text-red-600">{applicationsError}</div>
              ) : jobApplications.length === 0 ? (
                <div className="py-10 text-center text-gray-600">No applications found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{app.studentName}</td>
                          <td className="px-4 py-3 text-gray-600">{app.studentEmail}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatDateSafe(app.appliedDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRJobs;
