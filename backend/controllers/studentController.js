import Student from '../models/Student.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Create student profile
export const createStudentProfile = async (req, res) => {
  try {
    const { rollNumber, branch, cgpa, semester, section, phoneNumber, skills } = req.body;
    const userId = req.user.id;

    // Check if student already exists
    let student = await Student.findOne({ user: userId });
    if (student) {
      return res.status(400).json({
        success: false,
        message: 'Student profile already exists'
      });
    }

    student = await Student.create({
      user: userId,
      rollNumber,
      branch,
      cgpa,
      semester,
      section,
      phoneNumber,
      skills: skills ? skills.split(',').map(s => s.trim()) : []
    });

    await student.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Student profile created',
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id || req.user.id;

    if (req.user.role === 'student' && targetUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let student = await Student.findOne({ user: targetUserId })
      .populate('user', 'name email phone')
      .populate('placedAt');

    if (!student) {
      const user = await User.findById(targetUserId).select('name email phone');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      student = await Student.create({
        user: targetUserId,
        rollNumber: `AUTO-${targetUserId.slice(-6)}`,
        branch: 'CSE',
        cgpa: 0,
        semester: '',
        section: '',
        phoneNumber: '',
        skills: []
      });

      student = await Student.findById(student._id)
        .populate('user', 'name email phone')
        .populate('placedAt');
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { name, email, phone, branch, cgpa, semester, section, phoneNumber, skills, projects, resumeDraft, resumeTemplateId, avatar } = req.body;
    const targetUserId = req.params.id || req.user.id;
    const hasField = (field) => Object.prototype.hasOwnProperty.call(req.body, field);
    const resolvedPhone = hasField('phoneNumber') ? phoneNumber : (hasField('phone') ? phone : undefined);

    if (req.user.role === 'student' && targetUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update User model (name, email, phone)
    if (hasField('name') || hasField('email') || hasField('phone') || hasField('phoneNumber')) {
      const userUpdates = {};
      if (hasField('name')) userUpdates.name = name;
      if (hasField('email')) userUpdates.email = email;
      if (resolvedPhone !== undefined) userUpdates.phone = resolvedPhone || '';
      
      await User.findByIdAndUpdate(targetUserId, userUpdates);
    }

    // Update Student model
    let student = await Student.findOne({ user: targetUserId });
    if (!student) {
      student = await Student.create({
        user: targetUserId,
        rollNumber: `AUTO-${targetUserId.slice(-6)}`,
        branch: branch || 'CSE',
        cgpa: cgpa || 0,
        semester: semester || '',
        section: section || '',
        phoneNumber: resolvedPhone || '',
        avatar: avatar || '',
        skills: skills || []
      });
    } else {
      if (hasField('branch')) student.branch = branch;
      if (hasField('cgpa')) student.cgpa = cgpa;
      if (hasField('semester')) student.semester = semester;
      if (hasField('section')) student.section = section;
      if (resolvedPhone !== undefined) student.phoneNumber = resolvedPhone || '';
      if (hasField('avatar')) student.avatar = avatar;
      if (hasField('skills')) student.skills = skills;
      if (hasField('projects')) student.projects = projects;
      if (hasField('resumeDraft')) student.resumeDraft = resumeDraft;
      if (resumeTemplateId !== undefined) student.resumeTemplateId = resumeTemplateId;

      // Handle resume upload
      if (req.file) {
        // Delete old resume if exists
        if (student.resume) {
          const oldPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../', student.resume);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        student.resume = `uploads/${req.file.filename}`;
      }

      await student.save();
    }

    // Fetch updated data
    const updatedStudent = await Student.findOne({ user: targetUserId }).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email')
      .populate('placedAt');

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload CSV
export const uploadStudentsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    let createdCount = 0;
    for (const record of records) {
      // Check if user exists
      let user = await User.findOne({ email: record.email });
      if (!user) {
        user = await User.create({
          name: record.name,
          email: record.email,
          password: 'default123',
          role: 'student'
        });
      }

      // Create student profile
      await Student.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          rollNumber: record.rollNumber,
          branch: record.branch,
          cgpa: parseFloat(record.cgpa),
          phoneNumber: record.phoneNumber,
          skills: record.skills ? record.skills.split(';') : []
        },
        { upsert: true }
      );
      createdCount++;
    }

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `${createdCount} students imported successfully`,
      count: createdCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const mapCsvStudentRecord = (record) => {
  const studentId = String(record.Student_ID || record.student_id || record.id || '').trim();
  const skills = [];

  if (record.Coding_Skills) skills.push(`Coding: ${record.Coding_Skills}`);
  if (record.Communication_Skills) skills.push(`Communication: ${record.Communication_Skills}`);
  if (record.Soft_Skills_Rating) skills.push(`Soft Skills: ${record.Soft_Skills_Rating}`);
  if (record.Aptitude_Test_Score) skills.push(`Aptitude: ${record.Aptitude_Test_Score}`);
  if (record.Certifications) skills.push(`Certifications: ${record.Certifications}`);

  return {
    _id: studentId || undefined,
    studentId,
    name: studentId ? `Student ${studentId}` : 'Student',
    email: studentId ? `student${studentId}@college.edu` : 'student@college.edu',
    age: record.Age || null,
    gender: record.Gender || null,
    degree: record.Degree || null,
    branch: record.Branch || null,
    cgpa: record.CGPA || null,
    internships: record.Internships || null,
    projects: record.Projects || null,
    skills,
    backlogs: record.Backlogs || null,
    placementStatus: record.Placement_Status || null
  };
};

// Get students from bundled CSV dataset
export const getStudentsFromCSV = async (req, res) => {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'students.csv');
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'students.csv not found'
      });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const students = records.map(mapCsvStudentRecord);

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
