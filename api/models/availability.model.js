// models/availability.model.js
import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  // Date ranges for when the property is unavailable
  unavailableRanges: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { 
        type: String, 
        enum: ["booking", "maintenance", "other"],
        default: "booking"
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
      },
      notes: { type: String }
    }
  ],
  // For properties that have custom availability calendars (like vacation rentals)
  customAvailability: {
    enabled: { type: Boolean, default: false },
    availableDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    },
    // Special exceptions like holidays
    exceptions: [
      {
        date: { type: Date, required: true },
        isAvailable: { type: Boolean, required: true },
        reason: { type: String }
      }
    ]
  },
  // Status can be used to temporarily mark a property as unavailable
  status: {
    type: String,
    enum: ["available", "temporarily_unavailable", "permanently_unavailable"],
    default: "available"
  },
  // For properties with limited availability (like new constructions)
  availableFrom: {
    type: Date
  },
  // Cache of next available date for quick queries
  nextAvailableDate: {
    type: Date
  },
  // Last time the availability was updated
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a method to check if a property is available on a specific date
AvailabilitySchema.methods.isAvailableOn = function(date) {
  // If property is not available at all
  if (this.status !== "available") {
    return false;
  }
  
  // If property isn't available yet
  if (this.availableFrom && date < this.availableFrom) {
    return false;
  }
  
  // Check if date falls within any unavailable ranges
  for (const range of this.unavailableRanges) {
    if (date >= range.startDate && date <= range.endDate) {
      return false;
    }
  }
  
  // Check custom availability if enabled
  if (this.customAvailability.enabled) {
    // Get day of week
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Check if this day is generally available
    if (!this.customAvailability.availableDays[dayOfWeek]) {
      return false;
    }
    
    // Check for exceptions
    const dateString = date.toISOString().split('T')[0];
    const exception = this.customAvailability.exceptions.find(
      e => e.date.toISOString().split('T')[0] === dateString
    );
    
    if (exception) {
      return exception.isAvailable;
    }
  }
  
  // If passed all checks, date is available
  return true;
};

// Add a method to get the next available date
AvailabilitySchema.methods.getNextAvailableDate = function(fromDate = new Date()) {
  // If property is permanently unavailable
  if (this.status === "permanently_unavailable") {
    return null;
  }
  
  // Start checking from the given date or availableFrom date, whichever is later
  let checkDate = fromDate;
  if (this.availableFrom && this.availableFrom > fromDate) {
    checkDate = new Date(this.availableFrom);
  }
  
  // Look forward up to 365 days
  let daysToCheck = 365;
  
  while (daysToCheck > 0) {
    if (this.isAvailableOn(checkDate)) {
      return checkDate;
    }
    
    // Move to next day
    checkDate.setDate(checkDate.getDate() + 1);
    daysToCheck--;
  }
  
  // If no availability found in the next year
  return null;
};

// Pre-save hook to update the cached nextAvailableDate
AvailabilitySchema.pre('save', function(next) {
  this.nextAvailableDate = this.getNextAvailableDate();
  this.lastUpdated = new Date();
  next();
});

// Create and export the model
const Availability = mongoose.model("Availability", AvailabilitySchema);
export default Availability;