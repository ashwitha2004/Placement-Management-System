import mongoose from 'mongoose';

const placementResultSchema = new mongoose.Schema({
  studentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  roleTitle: {
    type: String,
    required: true,
    trim: true
  },
  location: String,
  ctc: String,
  bond: String,
  offerType: {
    type: String,
    enum: ['internship', 'full-time', 'ppo', 'contract'],
    default: 'full-time'
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'accepted', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  resultDate: Date,
  joiningDate: Date,
  recruiterName: String,
  recruiterEmail: String,
  recruiterPhone: String,
  rounds: [
    {
      name: String,
      date: Date,
      status: String,
      feedback: String
    }
  ],
  eligibility: {
    minCgpa: Number,
    maxBacklogs: Number,
    branches: [String],
    batch: String
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PlacementResult', placementResultSchema);
