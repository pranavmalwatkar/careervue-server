import express from 'express';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      employmentType,
      location,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (location) {
      filter.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') }
      ];
    }

    if (salaryMin || salaryMax) {
      filter.salary = {};
      if (salaryMin) filter.salary.min = { $gte: parseInt(salaryMin) };
      if (salaryMax) filter.salary.max = { $lte: parseInt(salaryMax) };
    }

    if (experienceMin || experienceMax) {
      filter.experience = {};
      if (experienceMin) filter.experience.min = { $gte: parseInt(experienceMin) };
      if (experienceMax) filter.experience.max = { $lte: parseInt(experienceMax) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch jobs', 
      error: error.message 
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch job', 
      error: error.message 
    });
  }
});

// Create new job (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.userId
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email');

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ 
      message: 'Failed to create job', 
      error: error.message 
    });
  }
});

// Update job (requires authentication and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ 
      message: 'Failed to update job', 
      error: error.message 
    });
  }
});

// Delete job (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      message: 'Failed to delete job', 
      error: error.message 
    });
  }
});

// Get job categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Job.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
});

// Get job locations
router.get('/meta/locations', async (req, res) => {
  try {
    const locations = await Job.aggregate([
      {
        $group: {
          _id: {
            city: '$location.city',
            state: '$location.state'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          state: '$_id.state',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch locations', 
      error: error.message 
    });
  }
});

export default router;