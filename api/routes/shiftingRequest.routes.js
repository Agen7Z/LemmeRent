import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import { 
  createShiftingRequest, 
  getShiftingRequests,
  updateShiftingRequestStatus,
  getUserShiftingRequests,
  getShiftingRequestStatus,
  softDeleteShiftingRequestUser,
  softDeleteShiftingRequestWorker,
  softDeleteShiftingRequestAdmin,
  restoreShiftingRequest,
  getDeletedShiftingRequests,
  deleteShiftingRequest,
  getShiftingRequest,             // NEW
  getShiftingRequestForPayment    // NEW
} from '../controllers/shiftingRequest.controller.js';

const router = express.Router();

// Create a new shifting request
router.post('/create', verifyToken, createShiftingRequest);

// Get all shifting requests (admin only)
router.get('/all', verifyToken, getShiftingRequests);

// Get shifting request status by ID (for status checking)
router.get('/status/:id', verifyToken, getShiftingRequestStatus);

// Get a single shifting request by ID (NEW)
router.get('/:id', verifyToken, getShiftingRequest);

// Get shifting request for payment (NEW)
router.get('/payment/:id', verifyToken, getShiftingRequestForPayment);

// Update shifting request status
router.put('/update/:id', verifyToken, updateShiftingRequestStatus);

// Get shifting requests for a specific user
router.get('/user/:userId', verifyToken, getUserShiftingRequests);

// Soft delete routes
router.put('/user/:id/delete', verifyToken, softDeleteShiftingRequestUser);
router.put('/worker/:id/delete', verifyToken, softDeleteShiftingRequestWorker);
router.put('/admin/:id/delete', verifyAdmin, softDeleteShiftingRequestAdmin);

// Admin deletion and restoration routes
router.delete('/:id', verifyAdmin, deleteShiftingRequest);
router.put('/:id/restore', verifyAdmin, restoreShiftingRequest);
router.get('/deleted', verifyAdmin, getDeletedShiftingRequests);

export default router;
