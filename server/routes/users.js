import express from 'express';
import User from '../models/User.js';
import Application from '../models/Application.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get application statistics
    const totalApplications = await Application.countDocuments({ userId });
    const pendingApplications = await Application.countDocuments({ 
      userId, 
      status: 'pending' 
    });
    const reviewingApplications = await Application.countDocuments({ 
      userId, 
      status: 'reviewing' 
    });
    const shortlistedApplications = await Application.countDocuments({ 
      userId, 
      status: 'shortlisted' 
    });
    const acceptedApplications = await Application.countDocuments({ 
      userId, 
      status: 'accepted' 
    });

    // Get recent applications
    const recentApplications = await Application.find({ userId })
      .populate('jobId', 'title company type location')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalApplications,
        pendingApplications,
        reviewingApplications,
        shortlistedApplications,
        acceptedApplications,
        responseRate: totalApplications > 0 ? 
          Math.round(((reviewingApplications + shortlistedApplications + acceptedApplications) / totalApplications) * 100) : 0
      },
      recentApplications
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard stats', 
      error: error.message 
    });
  }
});

// Update user skills
router.put('/skills', auth, async (req, res) => {
  try {
    const { skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { skills },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Skills updated successfully',
      skills: user.skills
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ 
      message: 'Failed to update skills', 
      error: error.message 
    });
  }
});

// Update user education
router.put('/education', auth, async (req, res) => {
  try {
    const { education } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { education },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Education updated successfully',
      education: user.education
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ 
      message: 'Failed to update education', 
      error: error.message 
    });
  }
});

export default  router;