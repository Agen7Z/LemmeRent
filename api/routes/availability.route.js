// routes/availability.route.js
import express from "express";
import { 
  updateAvailability, 
  getAvailability, 
  checkAvailability, 
  getUnavailableDates 
} from "../controllers/availability.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Update availability for a listing
router.put("/:listingId", verifyToken, updateAvailability);

// Get availability for a listing
router.get("/:listingId", getAvailability);

// Check if a listing is available on a specific date
router.get("/:listingId/check", checkAvailability);

// Get all unavailable dates for a listing
router.get("/:listingId/unavailable-dates", getUnavailableDates);

export default router;  