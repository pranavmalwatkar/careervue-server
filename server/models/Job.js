import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['government', 'private'],
    required: [true, 'Job type is required']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    remote: {
      type: Boolean,
      default: false
    }
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  experience: {
    min: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative']
    },
    max: {
      type: Number,
      default: 10,
      min: [0, 'Experience cannot be negative']
    }
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    required: true,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  benefits: [{
    type: String,
    maxlength: [200, 'Benefit cannot exceed 200 characters']
  }],
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  applicationFee: {
    type: Number,
    default: 0,
    min: [0, 'Application fee cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'Technology',
      'Government',
      'Banking',
      'Healthcare',
      'Education',
      'Marketing',
      'Sales',
      'Finance',
      'Engineering',
      'Design',
      'Operations',
      'HR',
      'Legal',
      'Consulting',
      'Other'
    ]
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Employment type is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ 'location.city': 1, 'location.state': 1 });
jobSchema.index({ category: 1, employmentType: 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model('Job', jobSchema);