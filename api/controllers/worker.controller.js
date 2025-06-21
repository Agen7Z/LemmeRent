import Worker from "../models/worker.model.js";
import { errorHandler } from "../utils/error.js";

// Add a new worker
export const addWorker = async (req, res, next) => {
  try {
    const { name, experience, rate, specialties, availability, rating } = req.body;

    // Validate required fields
    if (!name || !experience || !rate || !specialties || !availability) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Create a new worker
    const worker = new Worker({
      name,
      experience,
      rate,
      specialties,
      availability,
      rating: rating || 0, // Default rating to 0 if not provided
    });

    await worker.save();
    res.status(201).json({ success: true, worker });
  } catch (error) {
    next(errorHandler(500, "Failed to add worker"));
  }
};

// Get all workers
export const getWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find();
    res.status(200).json({ success: true, workers });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch workers"));
  }
};

// Update a worker
export const updateWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, experience, rate, specialties, availability, rating } = req.body;

    // Validate required fields
    if (!name || !experience || !rate || !specialties || !availability) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Find and update the worker
    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      {
        name,
        experience,
        rate,
        specialties,
        availability,
        rating,
      },
      { new: true } // Return the updated document
    );

    if (!updatedWorker) {
      return next(errorHandler(404, "Worker not found"));
    }

    res.status(200).json({ success: true, worker: updatedWorker });
  } catch (error) {
    next(errorHandler(500, "Failed to update worker"));
  }
};

// Delete a worker
export const deleteWorker = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find and delete the worker
    const deletedWorker = await Worker.findByIdAndDelete(id);

    if (!deletedWorker) {
      return next(errorHandler(404, "Worker not found"));
    }

    res.status(200).json({ success: true, message: "Worker deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Failed to delete worker"));
  }
};
