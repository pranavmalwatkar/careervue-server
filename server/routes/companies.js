import express from 'express';
import Company from '../models/Company.js';
import Admin from '../models/Admin.js';
import auth from '../middleware/auth.js';
import { adminAuth, requireRole } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all companies with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sector,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      featured
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (sector && sector !== 'All Sectors') {
      filter.sector = sector;
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { headquarters: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const companies = await Company.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');

    const total = await Company.countDocuments(filter);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
});

// Get single company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findOne({
      id: req.params.id,
      isActive: true
    }).populate('createdBy', 'name email');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
});

// Get all sectors
router.get('/meta/sectors', async (req, res) => {
  try {
    const sectors = await Company.distinct('sector', { isActive: true });
    res.json(['All Sectors', ...sectors.sort()]);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({ message: 'Error fetching sectors', error: error.message });
  }
});

// Get company statistics
router.get('/meta/stats', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments({ isActive: true });
    const sectors = await Company.distinct('sector', { isActive: true });
    const featuredCompanies = await Company.countDocuments({ isActive: true, featured: true });

    res.json({
      totalCompanies,
      totalSectors: sectors.length,
      featuredCompanies
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ message: 'Error fetching company stats', error: error.message });
  }
});

// Create new company (Admin only)
router.post('/', adminAuth, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const {
      id,
      name,
      sector,
      officialWebsite,
      careerLink,
      logo,
      description,
      headquarters,
      founded,
      employees,
      featured = false
    } = req.body;

    // Check if company ID already exists
    const existingCompany = await Company.findOne({ id });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company ID already exists' });
    }

    const company = new Company({
      id,
      name,
      sector,
      officialWebsite,
      careerLink,
      logo: logo || '',
      description: description || '',
      headquarters,
      founded,
      employees,
      featured,
      createdBy: req.user.id
    });

    const savedCompany = await company.save();
    await savedCompany.populate('createdBy', 'name email');

    res.status(201).json(savedCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
});

// Update company (Admin only)
router.put('/:id', adminAuth, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const {
      name,
      sector,
      officialWebsite,
      careerLink,
      logo,
      description,
      headquarters,
      founded,
      employees,
      featured,
      isActive
    } = req.body;

    const company = await Company.findOne({ id: req.params.id });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update fields
    if (name !== undefined) company.name = name;
    if (sector !== undefined) company.sector = sector;
    if (officialWebsite !== undefined) company.officialWebsite = officialWebsite;
    if (careerLink !== undefined) company.careerLink = careerLink;
    if (logo !== undefined) company.logo = logo;
    if (description !== undefined) company.description = description;
    if (headquarters !== undefined) company.headquarters = headquarters;
    if (founded !== undefined) company.founded = founded;
    if (employees !== undefined) company.employees = employees;
    if (featured !== undefined) company.featured = featured;
    if (isActive !== undefined) company.isActive = isActive;

    const updatedCompany = await company.save();
    await updatedCompany.populate('createdBy', 'name email');

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
});

// Delete company (Admin only) - Soft delete by setting isActive to false
router.delete('/:id', adminAuth, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const company = await Company.findOne({ id: req.params.id });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isActive = false;
    await company.save();

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
});

// Bulk operations for admin
router.post('/bulk', adminAuth, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { action, companyIds, updates } = req.body;

    if (!action || !companyIds || !Array.isArray(companyIds)) {
      return res.status(400).json({ message: 'Action and companyIds array are required' });
    }

    let result;
    switch (action) {
      case 'feature':
        result = await Company.updateMany(
          { id: { $in: companyIds } },
          { featured: true }
        );
        break;
      case 'unfeature':
        result = await Company.updateMany(
          { id: { $in: companyIds } },
          { featured: false }
        );
        break;
      case 'activate':
        result = await Company.updateMany(
          { id: { $in: companyIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Company.updateMany(
          { id: { $in: companyIds } },
          { isActive: false }
        );
        break;
      case 'update':
        if (!updates) {
          return res.status(400).json({ message: 'Updates object is required for update action' });
        }
        result = await Company.updateMany(
          { id: { $in: companyIds } },
          updates
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ message: 'Error in bulk operation', error: error.message });
  }
});

export default router;