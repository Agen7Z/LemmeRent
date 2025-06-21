import express from 'express';
import { 
  deleteUser, 
  deleteListing, 
  editUser, 
  editListing,
  getAllBookings,
  updateBooking,
  deleteBooking,
  getBookingStats 
} from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Delete a user
router.delete('/delete-user/:id', verifyToken, deleteUser);

// Delete a listing
router.delete('/delete-listing/:id', verifyToken, deleteListing);

// Edit a user
router.put('/edit-user/:id', verifyToken, editUser);

// Edit a listing
router.put('/edit-listing/:id', verifyToken, editListing);

// Admin booking routes
router.get("/all", verifyAdmin, getAllBookings);
router.put("/admin/:id", verifyAdmin, updateBooking);
router.delete("/admin/:id", verifyAdmin, deleteBooking);
router.get("/stats", verifyAdmin, getBookingStats);

export default router;