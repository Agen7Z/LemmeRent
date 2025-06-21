import express from "express";
import { createListing, deleteListing, getListing, updateListing, getListings, rateListing, getAllListings } from "../controllers/listing.controller.js";
import { verifyAdmin, verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken, deleteListing);
router.post("/update/:id", verifyToken, updateListing);
router.get("/get/:id", getListing);
router.get("/get", getListings);
router.post("/rate/:listingId", verifyToken, rateListing);
router.get("/all", verifyAdmin, getAllListings); // Use verifyAdmin middleware

export default router;