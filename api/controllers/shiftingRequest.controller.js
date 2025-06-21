import ShiftingRequest from "../models/shiftingRequest.model.js";
import Worker from "../models/worker.model.js"; // Import Worker model to get rate
import { errorHandler } from "../utils/error.js";

// Create a new shifting request
export const createShiftingRequest = async (req, res, next) => {
  try {
    const { customerName, customerPhone, shiftingDate, shiftingAddress, workerId, userId } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !shiftingDate || !shiftingAddress || !workerId || !userId) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Get worker details to determine totalAmount based on worker's rate
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return next(errorHandler(404, "Worker not found"));
    }

    // Use worker's rate or a default amount
    const totalAmount = worker.rate ? parseFloat(worker.rate) : 500;

    // Create a new shifting request
    const shiftingRequest = new ShiftingRequest({
      customerName,
      customerPhone,
      shiftingDate,
      shiftingAddress,
      workerId, // Use workerId as per the model
      userId,   // Use userId as per the model
      totalAmount, // Set the required totalAmount field
      status: 'pending'
    });

    const savedRequest = await shiftingRequest.save(); // Save to the database
    console.log("Shifting request saved:", savedRequest); 
    res.status(201).json({ 
      success: true, 
      message: "Shifting request created successfully",
      shiftingRequest: savedRequest 
    });
  } catch (error) {
    console.error("Error saving shifting request:", error); // Debugging
    next(errorHandler(500, `Failed to create shifting request: ${error.message}`));
  }
};

// Get shifting request status by ID (for users to check approval status)
export const getShiftingRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shiftingRequest = await ShiftingRequest.findById(id, 'status');
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    res.status(200).json({ 
      success: true, 
      status: shiftingRequest.status 
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch shifting request status"));
  }
};

// Get a single shifting request by ID (NEW)
export const getShiftingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shiftingRequest = await ShiftingRequest.findById(id)
      .populate("workerId", "name experience rate");
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    res.status(200).json({ 
      success: true, 
      shiftingRequest 
    });
  } catch (error) {
    console.error("Error fetching shifting request:", error);
    next(errorHandler(500, "Failed to fetch shifting request"));
  }
};

// Get shifting request for payment processing (NEW)
export const getShiftingRequestForPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shiftingRequest = await ShiftingRequest.findById(id)
      .populate("workerId", "name experience rate");
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    // Check if the request belongs to the user or the user is an admin
    if (shiftingRequest.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, "You are not authorized to access this shifting request"));
    }
    
    res.status(200).json({ 
      success: true, 
      shiftingRequest 
    });
  } catch (error) {
    console.error("Error fetching shifting request for payment:", error);
    next(errorHandler(500, "Failed to fetch shifting request payment information"));
  }
};

// Get all shifting requests for admin (sorted by newest first)
export const getShiftingRequests = async (req, res, next) => {
  try {
    // For admins, we can provide an option to include deleted requests
    const includeDeleted = req.query.includeDeleted === 'true';
    
    let query = {};
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    const shiftingRequests = await ShiftingRequest.find(query)
      .sort({ createdAt: -1 }) // ✅ Sort by newest first
      .populate("userId", "username email") // Populate with select fields
      .populate("workerId", "name experience rate"); // Populate with select fields
    
    res.status(200).json({ success: true, shiftingRequests });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch shifting requests"));
  }
};

// Update shifting request status
export const updateShiftingRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRequest = await ShiftingRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("userId", "username email")
      .populate("workerId", "name experience rate");

    if (!updatedRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }

    res.status(200).json({ success: true, shiftingRequest: updatedRequest });
  } catch (error) {
    next(errorHandler(500, "Failed to update shifting request"));
  }
};

// Get shifting requests for a specific user
export const getUserShiftingRequests = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const shiftingRequests = await ShiftingRequest.find({ userId }) 
      .populate("workerId", "name experience rate"); // Changed from worker to workerId
    
    res.status(200).json({ success: true, shiftingRequests });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch user shifting requests"));
  }
};

// Soft Delete shifting request (for user)
export const softDeleteShiftingRequestUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the shifting request exists and belongs to the current user
    const shiftingRequest = await ShiftingRequest.findById(id);
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    // Check if the user owns this shifting request
    if (shiftingRequest.userId.toString() !== req.user.id) {
      return next(errorHandler(403, "You can only delete your own shifting requests"));
    }
    
    // Soft delete the shifting request
    await shiftingRequest.softDelete("user");
    
    res.status(200).json({ 
      success: true, 
      message: "Shifting request deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting shifting request:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Soft Delete shifting request (for worker)
export const softDeleteShiftingRequestWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the shifting request exists
    const shiftingRequest = await ShiftingRequest.findById(id);
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    // Check if the shifting request is assigned to this worker
    // This assumes you have a way to identify workers - you might need to adjust this logic
    // For example, if workers have their own user accounts with a workerProfile
    if (shiftingRequest.workerId.toString() !== req.worker.id) {
      return next(errorHandler(403, "You can only delete shifting requests assigned to you"));
    }
    
    // Soft delete the shifting request
    await shiftingRequest.softDelete("worker");
    
    res.status(200).json({ 
      success: true, 
      message: "Shifting request deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting shifting request:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Soft Delete shifting request (Admin only)
export const softDeleteShiftingRequestAdmin = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can delete shifting requests"));
    }
    
    const { id } = req.params;
    const shiftingRequest = await ShiftingRequest.findById(id);
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    // Soft delete the shifting request with admin as the deleter
    await shiftingRequest.softDelete("admin");
    
    res.status(200).json({ 
      success: true, 
      message: "Shifting request deleted successfully" 
    });
  } catch (error) {
    console.error("Error soft deleting shifting request:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Hard Delete shifting request (Admin only - Permanently removes the request)
export const deleteShiftingRequest = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can permanently delete shifting requests"));
    }
    
    const { id } = req.params;
    const shiftingRequest = await ShiftingRequest.findByIdAndDelete(id);
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Shifting request not found"));
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Shifting request permanently deleted" 
    });
  } catch (error) {
    console.error("Error permanently deleting shifting request:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// Restore a soft-deleted shifting request
export const restoreShiftingRequest = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can restore shifting requests"));
    }
    
    const { id } = req.params;
    
    // For this endpoint, we need to include deleted shifting requests in our search
    const shiftingRequest = await ShiftingRequest.findOne({ _id: id, isDeleted: true });
    
    if (!shiftingRequest) {
      return next(errorHandler(404, "Deleted shifting request not found"));
    }
    
    // Restore the shifting request
    await shiftingRequest.restore();
    
    res.status(200).json({ 
      success: true, 
      message: "Shifting request restored successfully",
      shiftingRequest 
    });
  } catch (error) {
    console.error("Error restoring shifting request:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

// View soft-deleted shifting requests (Admin only)
export const getDeletedShiftingRequests = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can view deleted shifting requests"));
    }
    
    // Find all soft-deleted shifting requests
    const deletedShiftingRequests = await ShiftingRequest.find({ isDeleted: true })
      .populate("userId", "username email")
      .populate("workerId", "name experience rate");
    
    res.status(200).json({ 
      success: true, 
      deletedShiftingRequests 
    });
  } catch (error) {
    console.error("Error fetching deleted shifting requests:", error);
    next(errorHandler(500, "Internal server error"));
  }
};
