import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
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
  round: {
    type: String,
    enum: ['online-test', 'technical', 'hr', 'final'],
    required: true
  },
  scheduledDate: Date,
  // meetingLink removed; will use roomId for WebRTC
    roomId: {
      type: String,
      required: true
    },
  result: {
    type: String,
    enum: ['pending', 'passed', 'failed'],
    default: 'pending'
  },
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Interview', interviewSchema);
