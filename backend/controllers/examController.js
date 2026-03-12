import InterviewExam from '../models/InterviewExam.js';
import ExamSubmission from '../models/ExamSubmission.js';

export const createExam = async (req, res) => {
  try {
    const { title, description, durationMinutes, status, questions } = req.body;

    if (!title || !questions || !questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one question are required'
      });
    }

    const exam = await InterviewExam.create({
      title,
      description,
      durationMinutes,
      status: status || 'published',
      questions,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await InterviewExam.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await InterviewExam.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const examId = req.params.id;

    const exam = await InterviewExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const existing = await ExamSubmission.findOne({
      exam: examId,
      studentUser: req.user.id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this exam'
      });
    }

    const submission = await ExamSubmission.create({
      exam: examId,
      studentUser: req.user.id,
      answers,
      status: 'submitted',
      result: 'pending'
    });

    res.status(201).json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await ExamSubmission.find({ studentUser: req.user.id })
      .populate('exam')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { examId } = req.query;
    const query = examId ? { exam: examId } : {};

    const submissions = await ExamSubmission.find(query)
      .populate('exam')
      .populate('studentUser', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const reviewSubmission = async (req, res) => {
  try {
    const { score, result, feedback } = req.body;

    const submission = await ExamSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.score = score;
    submission.result = result || 'pending';
    submission.feedback = feedback;
    submission.status = 'reviewed';
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
