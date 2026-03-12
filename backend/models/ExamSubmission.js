import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewExam',
    required: true
  },
  studentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [
    {
      questionIndex: Number,
      answer: String
    }
  ],
  status: {
    type: String,
    enum: ['submitted', 'reviewed'],
    default: 'submitted'
  },
  score: Number,
  result: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending'
  },
  feedback: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ExamSubmission', examSubmissionSchema);
