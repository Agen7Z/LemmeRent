import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    method: {
      type: String,
      default: 'khalti',
    },
    bookingType: {
      type: String,
      enum: ['property', 'shifting'],
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'bookingModel',
    },
    bookingModel: {
      type: String,
      enum: ['Booking', 'ShiftingRequest'],
      required: true,
    },
    pidx: {
      type: String,
      required: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for faster queries
paymentHistorySchema.index({ userId: 1 });
paymentHistorySchema.index({ transactionId: 1 });
paymentHistorySchema.index({ pidx: 1 });

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

export default PaymentHistory;