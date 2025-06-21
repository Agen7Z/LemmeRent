import mongoose from 'mongoose';

const shiftingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    shiftingDate: {
      type: Date,
      required: true,
    },
    shiftingAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'initiated', 'completed', 'failed'],
        default: 'pending',
      },
      method: {
        type: String,
        default: 'khalti',
      },
      pidx: String,
      transactionId: String,
      verifiedAt: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: null
    },
    completedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Add a method to soft delete this shifting request
shiftingRequestSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Add a method to restore a soft-deleted shifting request
shiftingRequestSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// Modify all queries to exclude soft-deleted documents by default
// This is a pre-find hook that will be applied to all find queries
shiftingRequestSchema.pre(/^find/, function(next) {
  // Check if the query has a condition for isDeleted
  if (!this._conditions.hasOwnProperty('isDeleted')) {
    // If not, add a condition to exclude deleted documents
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Indexes for faster queries
shiftingRequestSchema.index({ userId: 1 });
shiftingRequestSchema.index({ workerId: 1 });
shiftingRequestSchema.index({ status: 1 });
shiftingRequestSchema.index({ 'payment.status': 1 });
shiftingRequestSchema.index({ isDeleted: 1 });

const ShiftingRequest = mongoose.model('ShiftingRequest', shiftingRequestSchema);

export default ShiftingRequest;