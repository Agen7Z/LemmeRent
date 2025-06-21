// src/Pages/khaltiService.js
import axios from 'axios';

// Your Khalti public key
const KHALTI_PUBLIC_KEY = '3c757da78be44b609ca10a09241dd837';

/**
 * Initiates a Khalti payment using the test payment URL
 * @param {number} amount - Amount in NPR
 * @param {Object} purchaseData - Contains order details
 * @returns {Object} - Payment URL and reference
 */
export const initiateKhaltiPayment = async (amount, purchaseData) => {
  try {
    // Use a fixed test amount
    const testAmount = 1000;
    const amountInPaisa = testAmount * 100;

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}`;

    // Store payment info in localStorage for post-payment verification
    const paymentInfo = {
      orderId,
      amount: testAmount,
      customerName: purchaseData.customerName,
      customerEmail: purchaseData.customerEmail,
      customerPhone: purchaseData.customerPhone,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('pending_payment', JSON.stringify(paymentInfo));

    // Create a merchant-specific URL for payment
    // This is a standard way to integrate with payment gateways when direct API access has CORS issues
    // Using Khalti's recommended payment widget approach

    // Direct link to Khalti's payment widget
    const paymentUrl = `https://khalti.com/payment/widget/?return_url=${encodeURIComponent(`${window.location.origin}/payment/verify`)}&website_url=${encodeURIComponent(window.location.origin)}&amount=${amountInPaisa}&purchase_order_id=${encodeURIComponent(orderId)}&purchase_order_name=${encodeURIComponent(purchaseData.name)}&public_key=${KHALTI_PUBLIC_KEY}`;

    console.log("Created Khalti payment URL:", paymentUrl);

    // Return the payment URL and reference
    return {
      payment_url: paymentUrl,
      pidx: orderId
    };
  } catch (error) {
    console.error('Khalti payment initiation failed:', error);
    throw error;
  }
};

/**
 * Verifies a Khalti payment
 * @param {string} pidx - Payment ID from Khalti
 * @returns {Object} - Mock payment verification response for testing
 */
export const verifyKhaltiPayment = async (pidx) => {
  try {
    // In a real implementation, this would call your backend to verify the payment
    // For testing purposes, returning a mock successful response

    // Get payment info from localStorage
    const paymentInfo = JSON.parse(localStorage.getItem('pending_payment') || '{}');

    return {
      status: 'Completed',
      pidx: pidx || 'test-pidx',
      transaction_id: `TXN-${Date.now()}`,
      amount: paymentInfo.amount ? paymentInfo.amount * 100 : 100000,
      created_on: new Date().toISOString()
    };
  } catch (error) {
    console.error('Khalti payment verification failed:', error);
    throw error;
  }
};