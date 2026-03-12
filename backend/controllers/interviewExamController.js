import InterviewExam from '../models/InterviewExam.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

// Create Interview Exam
export const createExam = async (req, res) => {
  try {
    const { title, description, durationMinutes, questions } = req.body;
    const createdBy = req.user.id;
    const exam = await InterviewExam.create({
      title,
      description,
      durationMinutes,
      questions,
      createdBy
    });
    res.status(201).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Interview Exams
export const getAllExams = async (req, res) => {
  try {
    const exams = await InterviewExam.find().populate('createdBy', 'name role');
    res.status(200).json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Interview Exam by ID
export const getExamById = async (req, res) => {
  try {
    const exam = await InterviewExam.findById(req.params.id).populate('createdBy', 'name role');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Interview Exam
export const updateExam = async (req, res) => {
  try {
    const { title, description, durationMinutes, questions, status } = req.body;
    const exam = await InterviewExam.findByIdAndUpdate(
      req.params.id,
      { title, description, durationMinutes, questions, status },
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Interview Exam
export const deleteExam = async (req, res) => {
  try {
    const exam = await InterviewExam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign Exam to Candidate (Student)
export const assignExamToCandidate = async (req, res) => {
  try {
      const { studentId } = req.body;
      const examId = req.params.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      if (!student.assignedExams) student.assignedExams = [];
      if (!student.assignedExams.includes(examId)) {
        student.assignedExams.push(examId);
        await student.save();
      }
      res.status(200).json({ success: true, message: 'Exam assigned to student', assignedExams: student.assignedExams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student submits Interview Exam
export const submitExam = async (req, res) => {
  try {
      const examId = req.params.id;
      const studentUserId = req.user.id;
      const { answers } = req.body;
      // Check if student is assigned this exam
      const student = await Student.findOne({ user: studentUserId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      if (!student.assignedExams || !student.assignedExams.includes(examId)) {
        return res.status(403).json({ success: false, message: 'Exam not assigned to this student' });
      }
      // Save submission
      const ExamSubmission = (await import('../models/ExamSubmission.js')).default;
      const submission = await ExamSubmission.create({
        exam: examId,
        studentUser: studentUserId,
        answers,
        status: 'submitted',
        submittedAt: new Date()
      });
      res.status(200).json({ success: true, message: 'Exam submitted', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
