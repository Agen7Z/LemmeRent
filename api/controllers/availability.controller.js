// controllers/availability.controller.js
import Availability from "../models/availability.model.js";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import { errorHandler } from "../utils/error.js";

// Create or update availability for a listing
export const updateAvailability = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    
    // Verify the listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }
    
    // Verify the user is the owner of the listing or an admin
    if (listing.userRef !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, "You can only update availability for your own listings"));
    }
    
    // Find existing availability or create new one
    let availability = await Availability.findOne({ listingId });
    
    if (!availability) {
      availability = new Availability({
        listingId,
        // Set other fields from request
        ...req.body
      });
    } else {
      // Update fields from request
      Object.keys(req.body).forEach(key => {
        availability[key] = req.body[key];
      });
    }
    
    // Save the availability
    await availability.save();
    
    res.status(200).json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

// Get availability for a listing
export const getAvailability = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    
    // Find the availability
    const availability = await Availability.findOne({ listingId });
    
    if (!availability) {
      // If no availability record exists, create a default one
      const newAvailability = new Availability({ listingId });
      await newAvailability.save();
      
      return res.status(200).json({ success: true, availability: newAvailability });
    }
    
    res.status(200).json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

// Check if a listing is available on a specific date
export const checkAvailability = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return next(errorHandler(400, "Date parameter is required"));
    }
    
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return next(errorHandler(400, "Invalid date format"));
    }
    
    // Find the availability
    let availability = await Availability.findOne({ listingId });
    
    if (!availability) {
      // If no availability record exists, create a default one
      availability = new Availability({ listingId });
      await availability.save();
    }
    
    // Check if the date is available
    const isAvailable = availability.isAvailableOn(checkDate);
    
    // Also check if there are any approved bookings for this date
    const bookings = await Booking.find({
      listingId,
      status: "approved",
      preferredDate: {
        $gte: new Date(checkDate.setHours(0, 0, 0, 0)),
        $lte: new Date(checkDate.setHours(23, 59, 59, 999))
      }
    });
    
    const hasBooking = bookings.length > 0;
    
    res.status(200).json({
      success: true,
      isAvailable: isAvailable && !hasBooking,
      hasBooking,
      bookings: hasBooking ? bookings : []
    });
  } catch (error) {
    next(error);
  }
};

// Get all unavailable dates for a listing (for calendar display)
export const getUnavailableDates = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate date range if provided
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date(start);
    end.setMonth(end.getMonth() + 3); // Default to 3 months from start if not specified
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(errorHandler(400, "Invalid date format"));
    }
    
    // Find the availability
    let availability = await Availability.findOne({ listingId });
    
    if (!availability) {
      // If no availability record exists, create a default one
      availability = new Availability({ listingId });
      await availability.save();
    }
    
    // Get all unavailable dates in the range
    const unavailableDates = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (!availability.isAvailableOn(currentDate)) {
        unavailableDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Also get all booked dates
    const bookings = await Booking.find({
      listingId,
      status: "approved",
      preferredDate: { $gte: start, $lte: end }
    });
    
    const bookedDates = bookings.map(booking => booking.preferredDate);
    
    // Combine both lists
    const allUnavailableDates = [
      ...unavailableDates,
      ...bookedDates.filter(date => !unavailableDates.some(
        d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
      ))
    ].sort((a, b) => a - b);
    
    res.status(200).json({
      success: true,
      unavailableDates: allUnavailableDates
    });
  } catch (error) {
    next(error);
  }
};

// Update availability when a booking is created or updated
export const updateAvailabilityFromBooking = async (booking) => {
  try {
    // Only update for approved bookings
    if (booking.status !== "approved") {
      return true;
    }
    
    // Find the availability
    let availability = await Availability.findOne({ listingId: booking.listingId });
    
    if (!availability) {
      // If no availability record exists, create a default one
      availability = new Availability({ listingId: booking.listingId });
    }
    
    // Check if this booking already has an unavailable range
    const existingRangeIndex = availability.unavailableRanges.findIndex(
      range => range.bookingId && range.bookingId.toString() === booking._id.toString()
    );
    
    // Create date range for booking
    const bookingDate = new Date(booking.preferredDate);
    const rangeStart = new Date(bookingDate);
    rangeStart.setHours(0, 0, 0, 0);
    
    const rangeEnd = new Date(bookingDate);
    rangeEnd.setHours(23, 59, 59, 999);
    
    // Update or add the unavailable range
    if (existingRangeIndex >= 0) {
      availability.unavailableRanges[existingRangeIndex] = {
        startDate: rangeStart,
        endDate: rangeEnd,
        reason: "booking",
        bookingId: booking._id,
        notes: `Booking for ${booking.name}`
      };
    } else {
      availability.unavailableRanges.push({
        startDate: rangeStart,
        endDate: rangeEnd,
        reason: "booking",
        bookingId: booking._id,
        notes: `Booking for ${booking.name}`
      });
    }
    
    // Update the nextAvailableDate cache
    availability.nextAvailableDate = availability.getNextAvailableDate();
    availability.lastUpdated = new Date();
    
    // Save the updated availability
    await availability.save();
    
    return true;
  } catch (error) {
    console.error("Error updating availability from booking:", error);
    return false;
  }
};

// Remove availability restriction when a booking is deleted or rejected
export const removeAvailabilityRestriction = async (booking) => {
  try {
    // Find the availability
    const availability = await Availability.findOne({ listingId: booking.listingId });
    
    if (!availability) {
      return true; // No availability record to update
    }
    
    // Remove any unavailable range associated with this booking
    availability.unavailableRanges = availability.unavailableRanges.filter(
      range => !range.bookingId || range.bookingId.toString() !== booking._id.toString()
    );
    
    // Update the nextAvailableDate cache
    availability.nextAvailableDate = availability.getNextAvailableDate();
    availability.lastUpdated = new Date();
    
    // Save the updated availability
    await availability.save();
    
    return true;
  } catch (error) {
    console.error("Error removing availability restriction:", error);
    return false;
  }
};