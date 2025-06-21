// controllers/booking.controller.js
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import { updateAvailabilityFromBooking } from "./availability.controller.js";
import { errorHandler } from "../utils/error.js";
import mongoose from "mongoose";

// Create a booking
export const createBooking = async (req, res, next) => {
  try {
    const { listingId, userId, name, address, contact, preferredDate } = req.body;
    if (!listingId || !userId || !name || !address || !contact || !preferredDate) {
      return next(errorHandler(400, "All fields are required"));
    }
    const booking = new Booking({
      listingId,
      userId,
      name,
      address,
      contact,
      preferredDate,
    });
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Get bookings for a user
export const getUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(400, "Invalid user ID"));
    }
    const bookings = await Booking.find({ userId }).populate("listingId", "name address");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Get bookings for a landlord
export const getLandlordBookings = async (req, res, next) => {
  try {
    const { landlordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(landlordId)) {
      return next(errorHandler(400, "Invalid landlord ID"));
    }

    // Find all listings belonging to the landlord
    const listings = await Listing.find({ userRef: landlordId });
    const listingIds = listings.map((listing) => listing._id);

    // Find bookings for those listings and populate both listingId and userId
    const bookings = await Booking.find({ listingId: { $in: listingIds } })
      .populate("listingId", "name address") // Populate listing details
      .populate("userId", "username email"); // Populate user details

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching landlord bookings:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Update booking status
// Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // ✅ Call availability update if approved
    if (status === "approved") {
      try {
        await updateAvailabilityFromBooking(booking);
        console.log("Availability updated successfully for booking:", booking._id);
      } catch (error) {
        console.error("Failed to update availability from booking:", error);
      }
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    next(errorHandler(500, "Internal server error"));
  }
};


// Soft Delete booking (for user)
export const softDeleteBookingUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the booking exists and belongs to the current user
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    // Check if the user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return next(errorHandler(403, "You can only delete your own bookings"));
    }
    
    // Soft delete the booking
    await booking.softDelete("user");
    
    res.status(200).json({ 
      success: true, 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Soft Delete booking (for landlord)
export const softDeleteBookingLandlord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the booking exists
    const booking = await Booking.findById(id).populate("listingId");
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    // Check if the listing belongs to the landlord
    if (booking.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandler(403, "You can only delete bookings for your own listings"));
    }
    
    // Soft delete the booking
    await booking.softDelete("landlord");
    
    res.status(200).json({ 
      success: true, 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Restore a soft-deleted booking
export const restoreBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // For this endpoint, we need to include deleted bookings in our search
    const booking = await Booking.findOne({ _id: id, isDeleted: true });
    
    if (!booking) {
      return next(errorHandler(404, "Deleted booking not found"));
    }
    
    // Check permission: Only allow restore if current user is admin or the one who deleted it
    if (!req.user.isAdmin) {
      if (
        (booking.deletedBy === "user" && booking.userId.toString() !== req.user.id) ||
        (booking.deletedBy === "landlord" && 
         booking.listingId.userRef && 
         booking.listingId.userRef.toString() !== req.user.id)
      ) {
        return next(errorHandler(403, "You don't have permission to restore this booking"));
      }
    }
    
    // Restore the booking
    await booking.restore();
    
    res.status(200).json({ 
      success: true, 
      message: "Booking restored successfully",
      booking 
    });
  } catch (error) {
    console.error("Error restoring booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// View soft-deleted bookings (Admin only)
export const getDeletedBookings = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can view deleted bookings"));
    }
    
    // Find all soft-deleted bookings
    const deletedBookings = await Booking.find({ isDeleted: true })
      .populate("listingId", "name address")
      .populate("userId", "username email");
    
    res.status(200).json({ 
      success: true, 
      deletedBookings 
    });
  } catch (error) {
    console.error("Error fetching deleted bookings:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Additional Admin-specific controller functions

// Get all bookings (Admin only)
export const getAllBookings = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    // For admins, we can provide an option to include deleted bookings
    const includeDeleted = req.query.includeDeleted === 'true';
    
    let query = {};
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("listingId", "name address type price discountPrice")
      .populate("userId", "username email");
      
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Update booking (Admin only)
export const updateBooking = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const { id } = req.params;
    const { status, preferredDate, name, address, contact } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (preferredDate) updateData.preferredDate = preferredDate;
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    
    const booking = await Booking.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    ).populate("listingId", "name address type price discountPrice")
      .populate("userId", "username email");
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Soft Delete booking (Admin only)
export const softDeleteBookingAdmin = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    // Soft delete the booking with admin as the deleter
    await booking.softDelete("admin");
    
    res.status(200).json({ 
      success: true, 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Hard Delete booking (Admin only - Permanently removes the booking)
export const deleteBooking = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Booking permanently deleted" 
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Get booking statistics (Admin only)
export const getBookingStats = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    // Include deleted bookings in statistics if requested
    const includeDeleted = req.query.includeDeleted === 'true';
    
    let baseQuery = {};
    if (!includeDeleted) {
      baseQuery.isDeleted = { $ne: true };
    }
    
    // Get total count of bookings
    const totalBookings = await Booking.countDocuments(baseQuery);
    
    // Get count by status
    const pendingBookings = await Booking.countDocuments({ 
      ...baseQuery,
      status: "pending" 
    });
    
    const approvedBookings = await Booking.countDocuments({ 
      ...baseQuery,
      status: "approved" 
    });
    
    const rejectedBookings = await Booking.countDocuments({ 
      ...baseQuery,
      status: "rejected" 
    });
    
    // Get count of deleted bookings
    const deletedBookings = await Booking.countDocuments({ 
      isDeleted: true 
    });
    
    // Get bookings by month (for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          ...(includeDeleted ? {} : { isDeleted: { $ne: true } })
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    // Get top properties with most bookings
    const topProperties = await Booking.aggregate([
      {
        $match: includeDeleted ? {} : { isDeleted: { $ne: true } }
      },
      {
        $group: {
          _id: "$listingId",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "listings",
          localField: "_id",
          foreignField: "_id",
          as: "property"
        }
      },
      {
        $project: {
          count: 1,
          property: { $arrayElemAt: ["$property", 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        deletedBookings,
        bookingsByMonth,
        topProperties
      }
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    next(errorHandler(500, "Internal server error"));
  }
};