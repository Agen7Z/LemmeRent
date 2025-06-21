import axios from 'axios';
import Booking from '../models/booking.model.js';
import ShiftingRequest from '../models/shiftingRequest.model.js';
import PaymentHistory from '../models/payment.model.js';

// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const { amount, purchaseData, bookingId, bookingType, bookingDetails } = req.body;
    
    if (!amount || !purchaseData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the purchase order ID based on booking type
    let purchase_order_id;
    if (bookingType === 'shifting') {
      purchase_order_id = `shift_${Date.now()}`;
    } else {
      purchase_order_id = bookingId;
    }

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/verify`,
        website_url: process.env.FRONTEND_URL || "http://localhost:5173",
        amount: amount * 100, // Convert to paisa
        purchase_order_id: purchase_order_id,
        purchase_order_name: purchaseData.name,
        customer_info: {
          name: purchaseData.customerName,
          email: purchaseData.customerEmail,
          phone: purchaseData.customerPhone
        }
      },
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY || '3ade02c87c0d4b0790ba3bfac91a37f2'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update the appropriate model based on booking type
    if (bookingType === 'shifting' && bookingDetails) {
      // Create a new shifting request with payment details
      const shiftingRequest = new ShiftingRequest({
        userId: req.user.id,
        workerId: bookingDetails.workerId,
        customerName: purchaseData.customerName,
        customerPhone: purchaseData.customerPhone,
        shiftingDate: bookingDetails.shiftingDate,
        shiftingAddress: bookingDetails.shiftingAddress,
        totalAmount: amount,
        payment: {
          status: 'initiated',
          method: 'khalti',
          pidx: response.data.pidx
        }
      });
      
      await shiftingRequest.save();
      
      // Also create a payment history record
      const paymentHistory = new PaymentHistory({
        userId: req.user.id,
        amount: amount,
        transactionId: purchase_order_id,
        status: 'pending',
        method: 'khalti',
        bookingType: 'shifting',
        bookingId: shiftingRequest._id,
        bookingModel: 'ShiftingRequest',
        pidx: response.data.pidx,
        additionalDetails: {
          customerName: purchaseData.customerName,
          shiftingDate: bookingDetails.shiftingDate
        }
      });
      
      await paymentHistory.save();
    } else if (bookingId) {
      // For property bookings
      await Booking.findByIdAndUpdate(bookingId, {
        payment: {
          method: 'khalti',
          status: 'initiated',
          pidx: response.data.pidx,
          amount: amount
        }
      });
      
      // Create payment history record
      const paymentHistory = new PaymentHistory({
        userId: req.user.id,
        amount: amount,
        transactionId: purchase_order_id,
        status: 'pending',
        method: 'khalti',
        bookingType: 'property',
        bookingId: bookingId,
        bookingModel: 'Booking',
        pidx: response.data.pidx
      });
      
      await paymentHistory.save();
    }

    // Return response to client
    res.json({
      message: "Payment initiation successful",
      payment_method: "khalti",
      data: response.data
    });

  } catch (err) {
    console.error("Payment initiation error:", err.response?.data || err.message);
    res.status(400).json({
      error: err.response?.data?.detail || err.message || "Failed to initiate payment"
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: "PIDX is required" });
    }

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY || '3ade02c87c0d4b0790ba3bfac91a37f2'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update payment history if payment was successful
    if (response.data.status === 'Completed') {
      // First check for payment history
      const paymentHistory = await PaymentHistory.findOne({ pidx });
      
      if (paymentHistory) {
        // Update payment history
        paymentHistory.status = 'completed';
        paymentHistory.transactionId = response.data.transaction_id || paymentHistory.transactionId;
        paymentHistory.paymentDate = new Date();
        await paymentHistory.save();
        
        // Now update the associated booking
        if (paymentHistory.bookingModel === 'Booking') {
          const booking = await Booking.findByIdAndUpdate(
            paymentHistory.bookingId,
            { 
              'payment.status': 'completed',
              'payment.verified_at': new Date(),
              'payment.transactionId': response.data.transaction_id,
              status: 'confirmed'
            },
            { new: true }
          );
          
          if (!booking) {
            console.warn('Booking not found for pidx:', pidx);
          }
        } else if (paymentHistory.bookingModel === 'ShiftingRequest') {
          const shiftingRequest = await ShiftingRequest.findByIdAndUpdate(
            paymentHistory.bookingId,
            { 
              'payment.status': 'completed',
              'payment.verifiedAt': new Date(),
              'payment.transactionId': response.data.transaction_id,
              status: 'approved'
            },
            { new: true }
          );
          
          if (!shiftingRequest) {
            console.warn('ShiftingRequest not found for pidx:', pidx);
          }
        }
      } else {
        console.warn('Payment history not found for pidx:', pidx);
      }
    }

    // Return the verification result
    res.json(response.data);

  } catch (err) {
    console.error("Payment verification error:", err.response?.data || err.message);
    res.status(400).json({
      error: err.response?.data?.detail || err.message || "Failed to verify payment"
    });
  }
};

// Get payment history for a user
export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Verify user has permission to view these payments
    if (req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "You don't have permission to view this payment history" });
    }
    
    const payments = await PaymentHistory.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'bookingId',
        select: 'customerName shiftingDate shiftingAddress status workerId totalAmount',
        populate: {
          path: 'workerId',
          select: 'name experience rate'
        }
      });
    
    res.json({ success: true, payments });
  } catch (err) {
    console.error("Get payment history error:", err.message);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "You don't have permission to view all payments" });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.bookingType) filters.bookingType = req.query.bookingType;
    
    // Search functionality
    if (req.query.search) {
      // You might want to extend this to search in other fields as well
      filters.$or = [
        { transactionId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Count total documents for pagination
    const total = await PaymentHistory.countDocuments(filters);
    
    const payments = await PaymentHistory.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'workerId',
          select: 'name experience rate'
        }
      });
    
    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get all payments error:", err.message);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

