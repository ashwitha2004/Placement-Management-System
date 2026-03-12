import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  description: String,
  salary: {
    min: Number,
    max: Number
  },
  location: String,
  eligibility: {
    minCGPA: {
      type: Number,
      default: 0
    },
    allowedBranches: [String]
  },
  skills: [String],
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
    postedByRole: {
      type: String,
      enum: ['admin', 'hr', 'staff', 'recruiter'],
      required: true
    },
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Job', jobSchema);
