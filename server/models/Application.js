import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'not_required'],
    default: 'not_required'
  },
  paymentId: {
    type: String
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

// Index for better query performance
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);