import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  from: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'hr', 'staff', 'admin']
    }
  },
  to: {
    type: String,
    required: true,
    enum: ['all', 'students', 'hr', 'staff', 'admin', 'individual']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
emailSchema.index({ 'from.userId': 1, createdAt: -1 });
emailSchema.index({ toUser: 1, createdAt: -1 });
emailSchema.index({ to: 1, createdAt: -1 });
emailSchema.index({ 'readBy.userId': 1 });

export default mongoose.model('Email', emailSchema);
