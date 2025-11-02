import express from 'express';
import Message from '../models/Message.js';
import { adminAuth, checkPermission } from '../middleware/adminAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Public route: Create a new contact message (no auth required)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, subject, and message' 
      });
    }

    // Create new message
    const newMessage = new Message({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
      priority: 'medium'
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message sent successfully! We will get back to you soon.',
      success: true
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({
      message: 'Failed to send message. Please try again later.',
      error: error.message
    });
  }
});

// Get all messages with admin filters
router.get('/', adminAuth, checkPermission('applications', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const messages = await Message.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Message.countDocuments(filter);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get single message by ID (auto-mark as read)
router.get('/:id', adminAuth, checkPermission('applications', 'view'), async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Auto-change status from 'unread' to 'read' when viewing details
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      message: 'Failed to fetch message',
      error: error.message
    });
  }
});

// Update message status
router.put('/:id/status', adminAuth, checkPermission('applications', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const message = await Message.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message status updated successfully',
      message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      message: 'Failed to update message status',
      error: error.message
    });
  }
});

// Add admin response to message
router.put('/:id/response', adminAuth, checkPermission('applications', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response message is required' });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        status: 'replied',
        adminResponse: {
          message: response,
          respondedBy: req.adminId,
          respondedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate('adminResponse.respondedBy', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Response sent successfully',
      message
    });
  } catch (error) {
    console.error('Add admin response error:', error);
    res.status(500).json({
      message: 'Failed to send response',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:id', adminAuth, checkPermission('applications', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Get message statistics
router.get('/stats/overview', adminAuth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const [
      totalMessages,
      unreadMessages,
      repliedMessages,
      todayMessages
    ] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ status: 'unread' }),
      Message.countDocuments({ status: 'replied' }),
      Message.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    res.json({
      stats: {
        totalMessages,
        unreadMessages,
        repliedMessages,
        todayMessages,
        readRate: totalMessages > 0 ? Math.round((repliedMessages / totalMessages) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
});

export default router;