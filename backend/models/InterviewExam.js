import mongoose from 'mongoose';

const interviewExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      maxMarks: {
        type: Number,
        default: 10
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('InterviewExam', interviewExamSchema);
