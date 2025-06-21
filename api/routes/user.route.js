// routes/user.route.js
import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
} from "../controllers/user.controller.js";
import { verifyAdmin, verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Correct route order
router.get("/all", verifyAdmin, getAllUsers); // Must come first
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/:id", verifyToken, getUser); // Generic route last
router.put('/update/:id', updateUser);


export default router;