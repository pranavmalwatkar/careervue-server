import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import GovernmentJob from '../models/GovernmentJob.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Message from '../models/Message.js';
import { adminAuth, checkPermission, requireRole } from '../middleware/adminAuth.js';
import { analyzeSentiment, getSentimentStats } from '../utils/sentimentAnalysis.js';
import crypto from 'crypto';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed login attempts' 
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' } // Shorter expiry for admin sessions
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get admin dashboard stats
router.get('/dashboard/stats', adminAuth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      recentUsers,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Job.find().sort({ createdAt: -1 }).limit(5).select('title company createdAt'),
      Application.find().sort({ createdAt: -1 }).limit(5)
        .populate('userId', 'name email')
        .populate('jobId', 'title company')
    ]);

    // Calculate growth rates (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      newUsersLast30,
      newUsersPrevious30,
      newJobsLast30,
      newJobsPrevious30
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      }),
      Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments({ 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      })
    ]);

    const userGrowthRate = newUsersPrevious30 > 0 
      ? ((newUsersLast30 - newUsersPrevious30) / newUsersPrevious30 * 100).toFixed(1)
      : 0;

    const jobGrowthRate = newJobsPrevious30 > 0 
      ? ((newJobsLast30 - newJobsPrevious30) / newJobsPrevious30 * 100).toFixed(1)
      : 0;

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        pendingApplications,
        userGrowthRate: parseFloat(userGrowthRate),
        jobGrowthRate: parseFloat(jobGrowthRate)
      },
      recent: {
        users: recentUsers,
        jobs: recentJobs,
        applications: recentApplications
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// Get all users with pagination and filters
router.get('/users', adminAuth, checkPermission('users', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .exec();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, checkPermission('users', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, role } = req.body;

    const updateData = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's applications
    await Application.deleteMany({ userId: id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Get all jobs with admin filters
router.get('/jobs', adminAuth, checkPermission('jobs', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

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
    console.error('Get admin jobs error:', error);
    res.status(500).json({
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Create new job
router.post('/jobs', adminAuth, checkPermission('jobs', 'create'), async (req, res) => {
  try {
    const jobData = req.body;

    // Set postedBy to admin's ID for admin-created jobs
    jobData.postedBy = req.adminId;

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Update job (full update)
router.put('/jobs/:id', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// Update job status
router.put('/jobs/:id/status', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, featured } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (featured !== undefined) updateData.featured = featured;

    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job status updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      message: 'Failed to update job status',
      error: error.message
    });
  }
});

// Delete job
router.delete('/jobs/:id', adminAuth, checkPermission('jobs', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Also delete all applications for this job
    await Application.deleteMany({ jobId: id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

// Get all applications with admin filters
router.get('/applications', adminAuth, checkPermission('applications', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      jobId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (jobId) filter.jobId = jobId;
    if (userId) filter.userId = userId;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate('userId', 'name email phone')
      .populate('jobId', 'title company type location')
      .sort(sort)
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
    console.error('Get admin applications error:', error);
    res.status(500).json({
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get current admin profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      message: 'Failed to get admin profile',
      error: error.message
    });
  }
});

// Update admin profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route
    delete updates.role; // Don't allow role updates through this route
    delete updates.permissions; // Don't allow permission updates through this route

    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      updates,
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Admin profile updated successfully',
      admin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      message: 'Failed to update admin profile',
      error: error.message
    });
  }
});

// Create new admin (super admin only)
router.post('/create', adminAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role: role || 'admin',
      department,
      permissions: permissions || {}
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      message: 'Failed to create admin',
      error: error.message
    });
  }
});

// Get all admins (super admin only)
router.get('/admins', adminAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
});

// Update admin permissions (super admin only)
router.put('/admins/:id/permissions', adminAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { permissions, role },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Admin permissions updated successfully',
      admin
    });
  } catch (error) {
    console.error('Update admin permissions error:', error);
    res.status(500).json({
      message: 'Failed to update admin permissions',
      error: error.message
    });
  }
});

// Get all messages/contracts
router.get('/messages', adminAuth, checkPermission('applications', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      jobId,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (jobId) filter.jobId = jobId;
    if (type) filter.type = type;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const messages = await Application.find(filter)
      .populate('userId', 'name email phone')
      .populate('jobId', 'title company')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(filter);

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

// Get activity logs
router.get('/activities', adminAuth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      resource,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // For now, we'll use a simple activity tracking based on existing data
    // In a real application, you'd have a dedicated Activity model
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get recent activities from users, jobs, and applications
    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Job.find(filter).sort({ createdAt: -1 }).limit(5).select('title company createdAt'),
      Application.find(filter).sort({ createdAt: -1 }).limit(10)
        .populate('userId', 'name email')
        .populate('jobId', 'title company')
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        id: user._id,
        type: 'user_created',
        description: `New user registered: ${user.name}`,
        user: user.name,
        email: user.email,
        createdAt: user.createdAt,
        resource: 'User'
      })),
      ...recentJobs.map(job => ({
        id: job._id,
        type: 'job_created',
        description: `New job posted: ${job.title} at ${job.company}`,
        user: job.company,
        createdAt: job.createdAt,
        resource: 'Job'
      })),
      ...recentApplications.map(app => ({
        id: app._id,
        type: 'application_submitted',
        description: `${app.userId.name} applied for ${app.jobId.title}`,
        user: app.userId.name,
        email: app.userId.email,
        createdAt: app.createdAt,
        resource: 'Application'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    res.json({
      activities: paginatedActivities,
      totalPages: Math.ceil(activities.length / limit),
      currentPage: page,
      total: activities.length
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get activity statistics
router.get('/activities/stats', adminAuth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [userCount, jobCount, applicationCount] = await Promise.all([
      User.countDocuments(dateFilter),
      Job.countDocuments(dateFilter),
      Application.countDocuments(dateFilter)
    ]);

    res.json({
      stats: {
        totalUsers: userCount,
        totalJobs: jobCount,
        totalApplications: applicationCount,
        totalActivities: userCount + jobCount + applicationCount
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
});

// Get all government jobs with admin filters
router.get('/government-jobs', adminAuth, checkPermission('jobs', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
        { ministry: new RegExp(search, 'i') }
      ];
    }

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const governmentJobs = await GovernmentJob.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await GovernmentJob.countDocuments(filter);

    res.json({
      jobs: governmentJobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get government jobs error:', error);
    res.status(500).json({
      message: 'Failed to fetch government jobs',
      error: error.message
    });
  }
});

// Create new government job
router.post('/government-jobs', adminAuth, checkPermission('jobs', 'create'), async (req, res) => {
  try {
    const jobData = req.body;
    jobData.createdBy = req.adminId;

    const governmentJob = new GovernmentJob(jobData);
    await governmentJob.save();

    res.status(201).json({
      message: 'Government job created successfully',
      job: governmentJob
    });
  } catch (error) {
    console.error('Create government job error:', error);
    res.status(500).json({
      message: 'Failed to create government job',
      error: error.message
    });
  }
});

// Update government job
router.put('/government-jobs/:id', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const governmentJob = await GovernmentJob.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!governmentJob) {
      return res.status(404).json({ message: 'Government job not found' });
    }

    res.json({
      message: 'Government job updated successfully',
      job: governmentJob
    });
  } catch (error) {
    console.error('Update government job error:', error);
    res.status(500).json({
      message: 'Failed to update government job',
      error: error.message
    });
  }
});

// Update government job status
router.put('/government-jobs/:id/status', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, featured } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (featured !== undefined) updateData.featured = featured;

    const governmentJob = await GovernmentJob.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!governmentJob) {
      return res.status(404).json({ message: 'Government job not found' });
    }

    res.json({
      message: 'Government job status updated successfully',
      job: governmentJob
    });
  } catch (error) {
    console.error('Update government job status error:', error);
    res.status(500).json({
      message: 'Failed to update government job status',
      error: error.message
    });
  }
});

// Delete government job
router.delete('/government-jobs/:id', adminAuth, checkPermission('jobs', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const governmentJob = await GovernmentJob.findByIdAndDelete(id);
    if (!governmentJob) {
      return res.status(404).json({ message: 'Government job not found' });
    }

    res.json({ message: 'Government job deleted successfully' });
  } catch (error) {
    console.error('Delete government job error:', error);
    res.status(500).json({
      message: 'Failed to delete government job',
      error: error.message
    });
  }
});

// Get all companies with admin filters
router.get('/companies', adminAuth, checkPermission('jobs', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sector,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (sector) filter.sector = sector;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const companies = await Company.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Company.countDocuments(filter);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Create new company
router.post('/companies', adminAuth, checkPermission('jobs', 'create'), async (req, res) => {
  try {
    const companyData = req.body;
    companyData.createdBy = req.adminId;

    const company = new Company(companyData);
    await company.save();

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      message: 'Failed to create company',
      error: error.message
    });
  }
});

// Update company
router.put('/companies/:id', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const company = await Company.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      message: 'Failed to update company',
      error: error.message
    });
  }
});

// Update company status
router.put('/companies/:id/status', adminAuth, checkPermission('jobs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, featured } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (featured !== undefined) updateData.featured = featured;

    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      message: 'Company status updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company status error:', error);
    res.status(500).json({
      message: 'Failed to update company status',
      error: error.message
    });
  }
});

// Delete company
router.delete('/companies/:id', adminAuth, checkPermission('jobs', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

// Get message statistics for admin dashboard
router.get('/messages/statistics', adminAuth, checkPermission('messages', 'view'), async (req, res) => {
  try {
    // Get total count of messages
    const totalMessages = await Message.countDocuments();
    
    // Get messages count by status
    const messagesByStatus = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get messages count by day for the last 30 days with sentiment
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMessages = await Message.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).select('subject message createdAt');

    // Analyze sentiment for each message and group by date
    const dailyMessagesMap = {};
    const dailySentimentMap = {};

    recentMessages.forEach(msg => {
      const dateStr = msg.createdAt.toISOString().split('T')[0];
      const sentiment = analyzeSentiment(`${msg.subject} ${msg.message}`);
      
      if (!dailyMessagesMap[dateStr]) {
        dailyMessagesMap[dateStr] = 0;
        dailySentimentMap[dateStr] = { positive: 0, negative: 0, neutral: 0 };
      }
      
      dailyMessagesMap[dateStr]++;
      dailySentimentMap[dateStr][sentiment.sentiment]++;
    });

    const dailyMessages = Object.keys(dailyMessagesMap)
      .sort()
      .map(date => ({
        date,
        count: dailyMessagesMap[date],
        positive: dailySentimentMap[date].positive,
        negative: dailySentimentMap[date].negative,
        neutral: dailySentimentMap[date].neutral
      }));

    // Get messages by priority
    const messagesByPriority = await Message.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          priority: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get all messages for sentiment analysis
    const allMessages = await Message.find().select('subject message');
    const sentimentStats = getSentimentStats(allMessages);

    res.json({
      success: true,
      data: {
        totalMessages,
        messagesByStatus,
        dailyMessages,
        messagesByPriority,
        sentimentStats
      }
    });
  } catch (error) {
    console.error('Error fetching message statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;