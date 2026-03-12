import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['admin', 'hr', 'staff', 'student', 'recruiter'],
      required: true,
      unique: true
    },
    permissions: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const approvalItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['job-posting', 'kyc', 'offer-letter', 'onboarding'],
      required: true
    },
    referenceId: String,
    submittedBy: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const templateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    channel: { type: String, enum: ['email', 'notification'], default: 'email' },
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    updatedBy: String,
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const backupSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    sizeMb: { type: Number, default: 0 },
    location: { type: String, default: 'local://backups' },
    triggeredBy: { type: String, default: 'system' }
  },
  { _id: true }
);

const adminControlCenterSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'primary',
      unique: true
    },
    rolePermissions: {
      type: [rolePermissionSchema],
      default: []
    },
    approvals: {
      type: [approvalItemSchema],
      default: []
    },
    templates: {
      type: [templateSchema],
      default: []
    },
    featureToggles: {
      type: Map,
      of: Boolean,
      default: {}
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    backupHistory: {
      type: [backupSchema],
      default: []
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('AdminControlCenter', adminControlCenterSchema);
