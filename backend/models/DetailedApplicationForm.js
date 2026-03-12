import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  position: String,
  company: String,
  duration: String,
  details: String
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: String,
  school: String,
  year: String
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  year: String
}, { _id: false });

const detailedApplicationFormSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  fullName: String,
  email: String,
  phone: String,
  linkedIn: String,
  github: String,
  website: String,
  summary: String,
  workExperience: [workExperienceSchema],
  skills: [String],
  education: [educationSchema],
  certifications: [certificationSchema],
  coverLetter: String,
  appliedCompany: String,
  appliedPosition: String
}, { timestamps: true });

// Prevent duplicate detailed forms per student
detailedApplicationFormSchema.index({ student: 1 }, { unique: true });

export default mongoose.model('DetailedApplicationForm', detailedApplicationFormSchema);
