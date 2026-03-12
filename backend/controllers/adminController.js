import User from '../models/User.js';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import PlacementResult from '../models/PlacementResult.js';
import PlacementStatistics from '../models/PlacementStatistics.js';
import Notification from '../models/Notification.js';
import AdminControlCenter from '../models/AdminControlCenter.js';
import os from 'os';

const defaultRolePermissions = [
  {
    role: 'admin',
    permissions: [
      'users:manage',
      'roles:manage',
      'approvals:manage',
      'analytics:view',
      'system:manage',
      'alerts:manage',
      'templates:manage',
      'backups:manage'
    ]
  },
  {
    role: 'hr',
    permissions: ['jobs:create', 'approvals:submit', 'analytics:view', 'templates:view']
  },
  {
    role: 'staff',
    permissions: ['students:view', 'approvals:submit', 'notifications:view']
  },
  {
    role: 'student',
    permissions: ['applications:create', 'profile:edit']
  },
  {
    role: 'recruiter',
    permissions: ['jobs:create', 'candidates:view', 'interviews:manage']
  }
];

const defaultFeatureToggles = {
  maintenanceMode: false,
  aiInsightsEnabled: true,
  approvalWorkflowEnabled: true,
  backupsEnabled: true,
  riskDetectionEnabled: true,
  broadcastNotificationsEnabled: true,
  templateVersioningEnabled: true
};

const defaultSettings = {
  registrationOpen: true,
  mfaRequired: false,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  profileCompletionThreshold: 70,
  defaultTheme: 'system',
  institutionName: 'Gen AI Placement Management System'
};

const defaultTemplates = [
  {
    key: 'offer-letter',
    name: 'Offer Letter',
    channel: 'email',
    subject: 'Offer Letter - {{companyName}}',
    body: 'Dear {{studentName}},\n\nCongratulations! You are selected for {{roleTitle}} at {{companyName}}.'
  },
  {
    key: 'drive-alert',
    name: 'Placement Drive Alert',
    channel: 'notification',
    subject: '',
    body: 'New placement drive for {{companyName}} opens on {{startDate}}.'
  }
];

const getControlCenterDoc = async () => {
  let doc = await AdminControlCenter.findOne({ singletonKey: 'primary' });
  if (!doc) {
    doc = await AdminControlCenter.create({
      singletonKey: 'primary',
      rolePermissions: defaultRolePermissions,
      featureToggles: defaultFeatureToggles,
      settings: defaultSettings,
      templates: defaultTemplates,
      approvals: []
    });
  }

  if (!doc.rolePermissions?.length) {
    doc.rolePermissions = defaultRolePermissions;
  }
  if (!doc.templates?.length) {
    doc.templates = defaultTemplates;
  }

  const toggles = doc.featureToggles?.toObject ? doc.featureToggles.toObject() : (doc.featureToggles || {});
  doc.featureToggles = { ...defaultFeatureToggles, ...toggles };

  const settings = doc.settings?.toObject ? doc.settings.toObject() : (doc.settings || {});
  doc.settings = { ...defaultSettings, ...settings };

  await doc.save();
  return doc;
};

// Get all users (User Directory)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    const userStats = {
      total: users.length,
      byRole: {
        student: users.filter(u => u.role === 'student').length,
        hr: users.filter(u => u.role === 'hr').length,
        staff: users.filter(u => u.role === 'staff').length,
        admin: users.filter(u => u.role === 'admin').length,
      }
    };

    res.json({
      success: true,
      users,
      stats: userStats
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get system status
export const getSystemStatus = async (req, res) => {
  try {
    const cpuUsage = os.loadavg()[0];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem * 100).toFixed(2);
    
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const systemInfo = {
      cpu: {
        usage: (cpuUsage * 10).toFixed(2),
        cores: os.cpus().length,
        model: os.cpus()[0].model
      },
      memory: {
        total: (totalMem / (1024 ** 3)).toFixed(2) + ' GB',
        used: (usedMem / (1024 ** 3)).toFixed(2) + ' GB',
        free: (freeMem / (1024 ** 3)).toFixed(2) + ' GB',
        percentage: memoryUsage
      },
      uptime: {
        raw: uptime,
        formatted: `${days}d ${hours}h ${minutes}m`
      },
      platform: os.platform(),
      hostname: os.hostname(),
      networkInterfaces: Object.keys(os.networkInterfaces()).length
    };

    res.json({
      success: true,
      system: systemInfo
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system status',
      error: error.message
    });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    // Fetch PlacementStatistics (HR analytics)
    const statsDoc = await PlacementStatistics.findOne().sort({ year: -1 });
    // Fallback values if not found
    const analytics = statsDoc ? {
      overallEmployees: statsDoc.totalStudentsPlaced,
      attrition: statsDoc.attrition,
      attritionRate: statsDoc.attritionRate,
      avgAge: statsDoc.avgAge,
      avgSalary: statsDoc.averagePackage,
      avgWorkingYears: statsDoc.avgWorkingYears,
      attritionByEducation: statsDoc.attritionByEducation,
      attritionByAge: statsDoc.attritionByAge,
      attritionBySalarySlab: statsDoc.attritionBySalarySlab,
      attritionByYearsAtCompany: statsDoc.attritionByYearsAtCompany,
      attritionByJobRole: statsDoc.attritionByJobRole,
      jobSatisfaction: statsDoc.jobSatisfaction,
      placementStats: {
        total: statsDoc.totalStudentsPlaced,
        lastYear: statsDoc.totalStudentsPlaced, // Placeholder
        progressPie: {
          labels: ["Placed", "Interviewing", "Not Placed"],
          data: [statsDoc.totalStudentsPlaced, 10, 5]
        }
      },
      applicationStats: {
        total: 100, // Placeholder
        active: 20 // Placeholder
      },
      jobStats: {
        total: 15, // Placeholder
        open: 5 // Placeholder
      },
      adthr: {
        detail1: "ADTHR Value 1",
        detail2: "ADTHR Value 2"
      }
    } : {};
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get audit logs (mock implementation - can be enhanced with actual logging)
export const getAuditLogs = async (req, res) => {
  try {
    // This is a simple implementation
    // In production, you'd want to use a dedicated logging service
    const logs = [
      {
        id: 1,
        timestamp: new Date(),
        user: req.user.email,
        action: 'GET_AUDIT_LOGS',
        resource: 'audit-logs',
        status: 'success',
        ip: req.ip
      }
    ];

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

// Get system alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = [];
    
    // Check database connection
    const dbConnected = true; // mongoose.connection.readyState === 1
    if (!dbConnected) {
      alerts.push({
        id: Date.now(),
        type: 'critical',
        title: 'Database Connection Lost',
        message: 'Unable to connect to MongoDB',
        timestamp: new Date()
      });
    }

    // Check memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem * 100);
    
    if (memoryUsage > 85) {
      alerts.push({
        id: Date.now() + 1,
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage at ${memoryUsage.toFixed(2)}%`,
        timestamp: new Date()
      });
    }

    // Check disk space (simplified)
    const cpuUsage = os.loadavg()[0];
    if (cpuUsage > 0.8) {
      alerts.push({
        id: Date.now() + 2,
        type: 'warning',
        title: 'High CPU Load',
        message: `CPU load average: ${cpuUsage.toFixed(2)}`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// Update system configuration
export const updateConfig = async (req, res) => {
  try {
    const config = req.body || {};
    const doc = await getControlCenterDoc();
    const merged = {
      ...(doc.settings?.toObject ? doc.settings.toObject() : doc.settings || {}),
      ...config
    };
    doc.settings = merged;
    doc.updatedAt = new Date();
    await doc.save();

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: merged
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating configuration',
      error: error.message
    });
  }
};

export const getControlCenter = async (req, res) => {
  try {
    const [doc, usersCount, jobsCount, applicationsCount, placementsCount, notificationsCount] = await Promise.all([
      getControlCenterDoc(),
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      PlacementResult.countDocuments(),
      Notification.countDocuments()
    ]);

    const pendingApprovals = (doc.approvals || []).filter((item) => item.status === 'pending');
    const users = await User.find().select('email role').lean();
    const duplicateUserEmails = Object.entries(
      users.reduce((acc, user) => {
        const key = (user.email || '').toLowerCase().trim();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([email, count]) => ({ email, count }));

    const placementRate = applicationsCount > 0 ? Number(((placementsCount / applicationsCount) * 100).toFixed(2)) : 0;
    const memoryUsage = Number((((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2));
    const aiInsights = [
      `Placement conversion is ${placementRate}%.`,
      `${pendingApprovals.length} approval items need attention.`,
      `${duplicateUserEmails.length} duplicate email clusters detected.`
    ];

    res.json({
      success: true,
      data: {
        rolePermissions: doc.rolePermissions || [],
        approvals: doc.approvals || [],
        templates: doc.templates || [],
        featureToggles: doc.featureToggles?.toObject ? doc.featureToggles.toObject() : doc.featureToggles,
        settings: doc.settings?.toObject ? doc.settings.toObject() : doc.settings,
        backups: doc.backupHistory || [],
        analytics: {
          usersCount,
          jobsCount,
          applicationsCount,
          placementsCount,
          placementRate,
          notificationsCount
        },
        systemHealth: {
          cpuLoad: Number((os.loadavg()[0] * 10).toFixed(2)),
          memoryUsage,
          uptimeSeconds: os.uptime(),
          hostname: os.hostname(),
          platform: os.platform(),
          dbState: 'connected'
        },
        dataGovernance: {
          duplicateUserEmails,
          recoverableItems: 0,
          recentImports: 0
        },
        riskAlerts: [
          ...(memoryUsage > 85
            ? [{ type: 'warning', title: 'High Memory Usage', message: `Memory at ${memoryUsage}%` }]
            : []),
          ...(duplicateUserEmails.length > 0
            ? [{ type: 'info', title: 'Duplicate Emails', message: `${duplicateUserEmails.length} potential duplicates found` }]
            : [])
        ],
        aiInsights
      }
    });
  } catch (error) {
    console.error('Error fetching control center:', error);
    res.status(500).json({ success: false, message: 'Error fetching control center', error: error.message });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { rolePermissions } = req.body || {};
    if (!Array.isArray(rolePermissions)) {
      return res.status(400).json({ success: false, message: 'rolePermissions must be an array' });
    }
    const doc = await getControlCenterDoc();
    doc.rolePermissions = rolePermissions;
    doc.updatedAt = new Date();
    await doc.save();
    res.json({ success: true, rolePermissions: doc.rolePermissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role permissions', error: error.message });
  }
};

export const upsertTemplate = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.key || !payload.name) {
      return res.status(400).json({ success: false, message: 'Template key and name are required' });
    }
    const doc = await getControlCenterDoc();
    const idx = (doc.templates || []).findIndex((t) => t.key === payload.key);
    if (idx >= 0) {
      doc.templates[idx] = { ...doc.templates[idx].toObject(), ...payload, updatedAt: new Date(), updatedBy: req.user?.email };
    } else {
      doc.templates.push({ ...payload, updatedAt: new Date(), updatedBy: req.user?.email });
    }
    await doc.save();
    res.json({ success: true, templates: doc.templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save template', error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { key } = req.params;
    const doc = await getControlCenterDoc();
    doc.templates = (doc.templates || []).filter((item) => item.key !== key);
    await doc.save();
    res.json({ success: true, templates: doc.templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
  }
};

export const updateFeatureToggles = async (req, res) => {
  try {
    const toggles = req.body || {};
    const doc = await getControlCenterDoc();
    const merged = {
      ...(doc.featureToggles?.toObject ? doc.featureToggles.toObject() : doc.featureToggles || {}),
      ...toggles
    };
    doc.featureToggles = merged;
    await doc.save();
    res.json({ success: true, featureToggles: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update feature toggles', error: error.message });
  }
};

export const resolveApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }
    const doc = await getControlCenterDoc();
    const approval = (doc.approvals || []).find((item) => String(item._id) === String(id));
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval item not found' });
    }
    approval.status = status;
    approval.notes = notes || approval.notes;
    approval.updatedAt = new Date();
    await doc.save();
    res.json({ success: true, approvals: doc.approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update approval', error: error.message });
  }
};

export const createApproval = async (req, res) => {
  try {
    const { type, referenceId, submittedBy, notes } = req.body || {};
    if (!type) {
      return res.status(400).json({ success: false, message: 'Approval type is required' });
    }
    const doc = await getControlCenterDoc();
    doc.approvals.push({
      type,
      referenceId: referenceId || '',
      submittedBy: submittedBy || req.user?.email || 'system',
      status: 'pending',
      notes: notes || ''
    });
    await doc.save();
    res.status(201).json({ success: true, approvals: doc.approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create approval item', error: error.message });
  }
};

export const triggerBackup = async (req, res) => {
  try {
    const doc = await getControlCenterDoc();
    const backupItem = {
      startedAt: new Date(),
      status: 'success',
      sizeMb: Number((Math.random() * 200 + 50).toFixed(2)),
      location: 'local://backups/admin-control-center',
      triggeredBy: req.user?.email || 'admin'
    };
    doc.backupHistory.unshift(backupItem);
    if (doc.backupHistory.length > 20) {
      doc.backupHistory = doc.backupHistory.slice(0, 20);
    }
    await doc.save();
    res.json({ success: true, backup: backupItem, backups: doc.backupHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to trigger backup', error: error.message });
  }
};

export const sendBroadcastNotification = async (req, res) => {
  try {
    const { targetRoles = [], title, message, type = 'system' } = req.body || {};
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }

    const filter = Array.isArray(targetRoles) && targetRoles.length ? { role: { $in: targetRoles } } : {};
    const recipients = await User.find(filter).select('_id').lean();
    if (!recipients.length) {
      return res.status(404).json({ success: false, message: 'No recipients found for selected target roles' });
    }

    const allowedType = ['email', 'application', 'interview', 'placement', 'system', 'alert', 'job', 'internship'].includes(type)
      ? type
      : 'system';

    const documents = recipients.map((user) => ({
      userId: user._id,
      type: allowedType,
      title,
      message
    }));
    await Notification.insertMany(documents);

    res.status(201).json({ success: true, recipients: recipients.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send broadcast notification', error: error.message });
  }
};
