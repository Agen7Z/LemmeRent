// routes/booking.route.js
import express from "express";
import { 
  createBooking, 
  getUserBookings, 
  getLandlordBookings, 
  updateBookingStatus,
  softDeleteBookingUser,
  softDeleteBookingLandlord,
  softDeleteBookingAdmin,
  restoreBooking,
  getDeletedBookings,
  getAllBookings,
  updateBooking,       
  deleteBooking,        
  getBookingStats      
} from "../controllers/booking.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// User & Landlord routes
router.post("/create", createBooking);
router.get("/user/:userId", getUserBookings);
router.get("/landlord/:landlordId", getLandlordBookings);
router.put("/:id/status", updateBookingStatus);

// Soft delete routes for users and landlords
router.put("/user/:id/delete", verifyToken, softDeleteBookingUser);
router.put("/landlord/:id/delete", verifyToken, softDeleteBookingLandlord);

// Admin routes
router.get("/all", verifyAdmin, getAllBookings);
router.put("/admin/:id", verifyAdmin, updateBooking);
router.put("/admin/:id/delete", verifyAdmin, softDeleteBookingAdmin);
router.delete("/admin/:id", verifyAdmin, deleteBooking);
router.get("/stats", verifyAdmin, getBookingStats);

// Deleted bookings management
router.get("/deleted", verifyAdmin, getDeletedBookings);
router.put("/:id/restore", verifyToken, restoreBooking);

export default router;



