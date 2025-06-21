import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  initiatePayment,
  verifyPayment,
  getUserPaymentHistory, 
  getAllPayments 
} from '../controllers/paymentController.js';

const router = express.Router();

// Use controller functions for consistent database operations
router.post('/initiate', verifyToken, initiatePayment);
router.post('/verify', verifyToken, verifyPayment);
router.get('/history', verifyToken, getUserPaymentHistory);
router.get('/history/:userId', verifyToken, getUserPaymentHistory);
router.get('/all', verifyToken, getAllPayments);

export default router;