import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

// Edit a user (Admin only)

export const editUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Edit a listing (Admin only)
export const editListing = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const { 
      name, address, description, type, bedrooms, bathrooms,
      price, discountPrice, offer, parking, furnished, imageURL 
    } = req.body;
    
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        address, 
        description, 
        type, 
        bedrooms, 
        bathrooms,
        price, 
        discountPrice, 
        offer, 
        parking, 
        furnished, 
        imageURL 
      },
      { new: true }
    );
    
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};
// Delete a user (Admin only)
export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// Delete a listing (Admin only)
export const deleteListing = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (error) {
    next(error);
  }
};
// Add Booking Management Functions
// Get all bookings (admin only)
export const getAllBookings = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    const bookings = await Booking.find()
      .populate("listingId", "name address type price discountPrice")
      .populate("userId", "username email");
      
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Update booking (admin only)
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
    next(error);
  }
};

// Delete booking (admin only)
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
    
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get booking statistics (admin only)
export const getBookingStats = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to perform this action."));
  }

  try {
    // Get total count of bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get count by status
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const approvedBookings = await Booking.countDocuments({ status: "approved" });
    const rejectedBookings = await Booking.countDocuments({ status: "rejected" });
    
    // Get bookings by month (for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
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
        bookingsByMonth,
        topProperties
      }
    });
  } catch (error) {
    next(error);
  }
};
