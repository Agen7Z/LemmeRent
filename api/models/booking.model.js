// models/booking.model.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
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
    enum: ["user", "landlord", "admin"],
    default: null
  }
}, { timestamps: true });

// Add a method to soft delete this booking
BookingSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Add a method to restore a soft-deleted booking
BookingSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// Modify all queries to exclude soft-deleted documents by default
// This is a pre-find hook that will be applied to all find queries
BookingSchema.pre(/^find/, function(next) {
  // Check if the query has a condition for isDeleted
  if (!this._conditions.hasOwnProperty('isDeleted')) {
    // If not, add a condition to exclude deleted documents
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

export default mongoose.model("booking", BookingSchema);