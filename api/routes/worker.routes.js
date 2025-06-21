import express from "express";
import {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} from "../controllers/worker.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Admin: Add a new worker
router.post("/add", verifyToken, addWorker);

// Fetch all workers
router.get("/all", getWorkers);

// Admin: Update a worker
router.put("/update/:id", verifyToken, updateWorker);

// Admin: Delete a worker
router.delete("/delete/:id", verifyToken, deleteWorker);

export default router;