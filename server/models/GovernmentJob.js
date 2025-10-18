import mongoose from 'mongoose';

const governmentJobSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  ministry: {
    type: String,
    required: [true, 'Ministry is required'],
    trim: true,
    maxlength: [100, 'Ministry name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    maxlength: [500, 'Qualification cannot exceed 500 characters']
  },
  ageLimit: {
    type: String,
    required: [true, 'Age limit is required'],
    trim: true
  },
  applicationFee: {
    type: Number,
    default: 0,
    min: [0, 'Application fee cannot be negative']
  },
  examDate: {
    type: String,
    required: [true, 'Exam date is required']
  },
  lastDate: {
    type: String,
    required: [true, 'Last date is required']
  },
  officialWebsite: {
    type: String,
    required: [true, 'Official website is required'],
    trim: true
  },
  notificationLink: {
    type: String,
    required: [true, 'Notification link is required'],
    trim: true
  },
  applyLink: {
    type: String,
    required: [true, 'Apply link is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Central Government',
      'State Government',
      'Banking',
      'Defence',
      'Education',
      'Railways',
      'Police',
      'Healthcare',
      'Engineering'
    ]
  },
  posts: {
    type: Number,
    default: 1,
    min: [1, 'Posts must be at least 1']
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
    }
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
governmentJobSchema.index({ title: 'text', department: 'text', ministry: 'text' });
governmentJobSchema.index({ category: 1 });
governmentJobSchema.index({ createdAt: -1 });

export default mongoose.model('GovernmentJob', governmentJobSchema);