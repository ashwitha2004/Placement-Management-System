import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  coverLetter: String,
  notes: String
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
