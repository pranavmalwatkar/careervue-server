import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply for a job
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if application deadline has passed
    if (new Date() > job.deadline) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.userId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      jobId,
      userId: req.userId,
      coverLetter,
      resume,
      paymentStatus: job.isPremium ? 'pending' : 'not_required'
    });

    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title company type location')
      .populate('userId', 'name email');

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ 
      message: 'Failed to submit application', 
      error: error.message 
    });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId: req.userId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title company type location salary deadline')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// Get applications for a job (job owner only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const filter = { jobId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('userId', 'name email phone skills experience education')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch job applications', 
      error: error.message 
    });
  }
});

// Update application status (job owner only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job
    if (application.jobId.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    if (status !== 'pending') application.reviewedDate = new Date();

    await application.save();

    const updatedApplication = await Application.findById(id)
      .populate('jobId', 'title company')
      .populate('userId', 'name email');

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      message: 'Failed to update application status', 
      error: error.message 
    });
  }
});

// Get application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company type location salary')
      .populate('userId', 'name email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application or the job
    const isOwner = application.userId._id.toString() === req.userId;
    const isJobOwner = application.jobId.postedBy && 
                      application.jobId.postedBy.toString() === req.userId;

    if (!isOwner && !isJobOwner) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch application', 
      error: error.message 
    });
  }
});

export default router;