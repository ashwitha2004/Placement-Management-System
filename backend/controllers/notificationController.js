import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const ALLOWED_NOTIFICATION_TYPES = new Set([
  'email',
  'application',
  'interview',
  'placement',
  'system',
  'alert',
  'job',
  'internship'
]);

const normalizeNotificationType = (rawType) => {
  const normalized = String(rawType || '').toLowerCase();
  if (ALLOWED_NOTIFICATION_TYPES.has(normalized)) {
    return normalized;
  }
  if (['critical', 'warning', 'info'].includes(normalized)) {
    return 'alert';
  }
  return 'system';
};

const getRequestUserId = (req) => {
  const userId = req?.user?.id || req?.user?._id || req?.user?.userId;
  return typeof userId === 'string' ? userId : String(userId || '');
};

const parseLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 50;
  }
  return Math.min(parsed, 200);
};

// Send notification(s) to multiple users (STAFF/ADMIN ONLY)
export const sendBulkNotification = async (req, res) => {
  try {
    const { userIds, title, message, type = 'system' } = req.body;
    const safeTitle = String(title || '').trim();
    const safeMessage = String(message || '').trim();

    if (!Array.isArray(userIds) || userIds.length === 0 || !safeTitle || !safeMessage) {
      return res.status(400).json({ message: 'userIds (array), title, and message are required' });
    }

    const validUserIds = [...new Set(userIds
      .map((id) => String(id || '').trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id)))];

    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'No valid recipient user IDs were provided' });
    }

    const existingUsers = await User.find({ _id: { $in: validUserIds } }).select('_id');
    const existingUserIds = new Set(existingUsers.map((userDoc) => String(userDoc._id)));
    const deliverableUserIds = validUserIds.filter((id) => existingUserIds.has(id));

    if (deliverableUserIds.length === 0) {
      return res.status(404).json({ message: 'No matching users found for provided user IDs' });
    }

    const safeType = normalizeNotificationType(type);
    const docsToInsert = deliverableUserIds.map((userId) => ({
      userId,
      type: safeType,
      title: safeTitle,
      message: safeMessage
    }));

    let notifications = [];
    try {
      notifications = await Notification.insertMany(docsToInsert, { ordered: false });
    } catch (bulkError) {
      const inserted = Array.isArray(bulkError?.insertedDocs) ? bulkError.insertedDocs : [];
      if (inserted.length === 0) {
        throw bulkError;
      }
      notifications = inserted;
    }

    const sentCount = notifications.length;
    const skippedCount = userIds.length - sentCount;
    if (sentCount === 0) {
      return res.status(500).json({ message: 'Failed to send notifications' });
    }

    res.status(201).json({
      message: `Notifications sent to ${sentCount} users`,
      notifications,
      sentCount,
      skippedRecipients: skippedCount
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    const { limit = 50, unreadOnly = false } = req.query;

    const query = { userId };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseLimit(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({ 
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification request' });
    }

    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ message: 'No readable notifications for current user context' });
    }

    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification request' });
    }

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

// Create notification (utility function for other controllers)
export const createNotification = async (userId, type, title, message, relatedId, relatedModel) => {
  try {
    const payload = {
      userId,
      type,
      title,
      message
    };

    const hasRelatedModel = typeof relatedModel === 'string' && relatedModel.trim().length > 0;
    const hasValidRelatedId = relatedId && mongoose.Types.ObjectId.isValid(String(relatedId));

    if (hasRelatedModel && hasValidRelatedId) {
      payload.relatedModel = relatedModel;
      payload.relatedId = relatedId;
    }

    const notification = new Notification(payload);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// One-to-one notification utility
export const sendDirectNotification = async (req, res) => {
  try {
    const {
      recipientId,
      userId,
      recipientEmail,
      targetRole,
      title,
      message,
      type = 'system',
      relatedId,
      relatedModel
    } = req.body;

    const directRecipientId = String(recipientId || userId || '').trim();
    const emailRecipient = String(recipientEmail || '').trim().toLowerCase();
    const safeTitle = String(title || '').trim();
    const safeMessage = String(message || '').trim();

    if ((!directRecipientId && !emailRecipient) || !safeTitle || !safeMessage) {
      return res.status(400).json({ message: 'recipientId or recipientEmail, title, and message are required' });
    }

    let recipientUser = null;

    if (directRecipientId) {
      if (!mongoose.Types.ObjectId.isValid(directRecipientId)) {
        return res.status(400).json({ message: 'Invalid recipientId' });
      }
      recipientUser = await User.findById(directRecipientId).select('_id role email');
    } else {
      recipientUser = await User.findOne({ email: emailRecipient }).select('_id role email');
    }

    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    if (targetRole && String(targetRole).toLowerCase() !== String(recipientUser.role || '').toLowerCase()) {
      return res.status(400).json({ message: `Recipient is not in target role '${targetRole}'` });
    }

    const safeType = normalizeNotificationType(type);
    const notif = await createNotification(recipientUser._id, safeType, safeTitle, safeMessage, relatedId, relatedModel);
    res.status(201).json({ message: 'Direct notification sent', notification: notif });
  } catch (error) {
    console.error('Error sending direct notification:', error);
    res.status(500).json({ message: 'Failed to send direct notification', error: error.message });
  }
};
