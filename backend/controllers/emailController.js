import Email from '../models/Email.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

const ROLE_BASED_TARGETS = {
  student: ['staff', 'hr'],
  staff: ['students', 'hr'],
  hr: ['staff', 'students', 'all']
};

const buildRecipientQuery = (recipient, senderId) => {
  if (recipient === 'all') {
    return { _id: { $ne: senderId } };
  }

  if (recipient === 'students') {
    return { role: 'student', _id: { $ne: senderId } };
  }

  return { role: recipient, _id: { $ne: senderId } };
};

// Send email to specific role or all users
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const senderId = req.user.id;
    
    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Validate and normalize recipients (supports single recipient or role array)
    const requestedRecipients = Array.isArray(to)
      ? [...new Set(to.map((entry) => String(entry).trim()))]
      : [String(to || '').trim()];

    const validRecipients = ['all', 'students', 'hr', 'staff', 'admin'];
    const invalidRecipient = requestedRecipients.find((recipient) => !validRecipients.includes(recipient));
    if (invalidRecipient) {
      return res.status(400).json({ message: `Invalid recipient: ${invalidRecipient}` });
    }

    const allowedTargets = ROLE_BASED_TARGETS[sender.role];
    if (allowedTargets) {
      const blockedRecipient = requestedRecipients.find((recipient) => !allowedTargets.includes(recipient));
      if (blockedRecipient) {
        return res.status(403).json({
          message: `As ${sender.role}, you can only send to: ${allowedTargets.join(', ')}`
        });
      }
    }

    const emailDocuments = requestedRecipients.map((recipient) => ({
      from: {
        userId: senderId,
        name: sender.name,
        role: sender.role
      },
      to: recipient,
      subject,
      message
    }));

    const savedEmails = await Email.insertMany(emailDocuments);

    const recipientGroups = await Promise.all(
      requestedRecipients.map((recipient) => User.find(buildRecipientQuery(recipient, senderId)).select('_id'))
    );

    const recipientMap = new Map();
    recipientGroups.flat().forEach((recipient) => {
      recipientMap.set(recipient._id.toString(), recipient._id);
    });

    const recipients = Array.from(recipientMap.values());

    // Create notification for each recipient
    const notifications = recipients.map((recipientId) => ({
      userId: recipientId,
      type: 'email',
      title: 'New Email',
      message: `${sender.name} sent you an email: ${subject}`,
      relatedId: savedEmails[0]._id,
      relatedModel: 'Email'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ 
      message: 'Email sent successfully',
      emails: savedEmails,
      emailCount: savedEmails.length,
      recipientCount: recipients.length
    });
  } catch (error) {
    console.error('🔥 Backend Error (sendEmail):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

// Send email to individual student
export const sendEmailToStudent = async (req, res) => {
  try {
    const { studentId, subject, message } = req.body;
    const senderId = req.user.id;
    
    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Get student
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create email document
    const email = new Email({
      from: {
        userId: senderId,
        name: sender.name,
        role: sender.role
      },
      to: 'individual',
      toUser: student.user._id,
      subject,
      message
    });

    await email.save();

    // Create notification for student
    const notification = new Notification({
      userId: student.user._id,
      type: 'email',
      title: 'New Email',
      message: `${sender.name} sent you an email: ${subject}`,
      relatedId: email._id,
      relatedModel: 'Email'
    });
    
    await notification.save();

    res.status(201).json({ 
      message: 'Email sent successfully',
      email,
      recipientCount: 1
    });
  } catch (error) {
    console.error('🔥 Backend Error (sendEmailToStudent):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

// Send bulk email to multiple students
export const sendBulkEmail = async (req, res) => {
  try {
    const { studentIds, subject, message } = req.body;
    const senderId = req.user.id;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Invalid student IDs' });
    }

    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Get all students
    const students = await Student.find({ _id: { $in: studentIds } }).populate('user');
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    // Create individual emails for each student
    const emails = students.map(student => ({
      from: {
        userId: senderId,
        name: sender.name,
        role: sender.role
      },
      to: 'individual',
      toUser: student.user._id,
      subject,
      message
    }));

    const savedEmails = await Email.insertMany(emails);

    // Create notifications for each student
    const notifications = students.map(student => ({
      userId: student.user._id,
      type: 'email',
      title: 'New Email',
      message: `${sender.name} sent you an email: ${subject}`,
      relatedId: savedEmails[0]._id,
      relatedModel: 'Email'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ 
      message: 'Emails sent successfully',
      emailCount: savedEmails.length,
      recipientCount: students.length
    });
  } catch (error) {
    console.error('🔥 Backend Error (sendBulkEmail):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to send emails', error: error.message });
  }
};

// Get all students for email selection
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('user').select('_id user branch cgpa').sort('user.name');
    
    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.user?.name || 'Unknown',
      email: student.user?.email || 'No email',
      branch: student.branch || 'N/A',
      cgpa: student.cgpa || 'N/A',
      image: student.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    }));

    res.status(200).json({ 
      students: formattedStudents,
      count: students.length
    });
  } catch (error) {
    console.error('🔥 Backend Error (getAllStudents):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Get inbox for current user
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find emails where:
    // 1. Recipient is 'all', OR
    // 2. Recipient matches user's role, OR
    // 3. User is direct individual recipient, OR
    // 4. User is the sender (sent emails)
    const emails = await Email.find({
      $or: [
        { to: 'all' },
        { to: user.role === 'student' ? 'students' : user.role },
        { toUser: userId },
        { 'from.userId': userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(100);

    // Mark which emails are read by this user
    const emailsWithReadStatus = emails.map(email => {
      const isRead = email.readBy.some(read => read.userId.toString() === userId);
      const isSender = email.from.userId.toString() === userId;
      
      return {
        _id: email._id,
        from: email.from,
        to: email.to,
        subject: email.subject,
        message: email.message,
        createdAt: email.createdAt,
        read: isRead,
        isSender
      };
    });

    res.status(200).json({ emails: emailsWithReadStatus });
  } catch (error) {
    console.error('🔥 Backend Error (getInbox):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch inbox', error: error.message });
  }
};

// Mark email as read
export const markAsRead = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userId = req.user.id;

    const email = await Email.findById(emailId);
    
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if already marked as read
    const alreadyRead = email.readBy.some(read => read.userId.toString() === userId);
    
    if (!alreadyRead) {
      email.readBy.push({ userId, readAt: new Date() });
      await email.save();

      // Mark related notification as read
      await Notification.updateMany(
        {
          userId,
          relatedId: emailId,
          type: 'email',
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );
    }

    res.status(200).json({ message: 'Email marked as read' });
  } catch (error) {
    console.error('🔥 Backend Error (markAsRead):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to mark email as read', error: error.message });
  }
};

// Get sent emails
export const getSentEmails = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentEmails = await Email.find({ 'from.userId': userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ emails: sentEmails });
  } catch (error) {
    console.error('🔥 Backend Error (getSentEmails):', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch sent emails', error: error.message });
  }
};
