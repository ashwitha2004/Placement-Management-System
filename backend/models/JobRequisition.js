import mongoose from 'mongoose';

const jobRequisitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  numberOfPositions: {
    type: Number,
    required: true,
    default: 1
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  location: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  requiredSkills: [String],
  experience: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      enum: ['months', 'years'],
      default: 'years'
    }
  },
  education: {
    type: String,
    enum: ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Any'],
    default: 'Bachelor'
  },
  reportingManager: String,
  deadline: Date,
  status: {
    type: String,
    enum: ['Open', 'In Review', 'Closed', 'On Hold'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('JobRequisition', jobRequisitionSchema);
