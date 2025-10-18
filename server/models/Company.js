import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    enum: [
      'IT & Software',
      'E-commerce',
      'Fintech',
      'Banking',
      'Automotive',
      'Telecommunications',
      'Pharmaceuticals',
      'FMCG',
      'Startups',
      'Government',
      'EdTech',
      'Healthcare',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Media',
      'Real Estate',
      'Energy',
      'Logistics'
    ]
  },
  officialWebsite: {
    type: String,
    required: [true, 'Official website is required'],
    trim: true
  },
  careerLink: {
    type: String,
    required: [true, 'Career link is required'],
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  headquarters: {
    type: String,
    required: [true, 'Headquarters location is required'],
    trim: true
  },
  founded: {
    type: String,
    required: [true, 'Founded year is required'],
    trim: true
  },
  employees: {
    type: String,
    required: [true, 'Employee count is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ sector: 1 });
companySchema.index({ createdAt: -1 });

export default mongoose.model('Company', companySchema);