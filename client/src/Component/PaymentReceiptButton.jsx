// src/components/PaymentReceiptButton.jsx
import React, { useState } from 'react';
import { 
  FaEnvelope, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { sendPaymentReceipt } from '../services/EmailService';

const PaymentReceiptButton = ({ payment }) => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSendReceipt = async () => {
    // First check if payment has user information
    if (!payment.userId || !payment.userId.email) {
      setError("User email not found. Cannot send receipt.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      // Prepare payment data
      const paymentData = {
        userEmail: payment.userId.email,
        userName: payment.userId.username,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate || payment.createdAt,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        bookingType: payment.bookingType,
        _id: payment._id
      };
      
      // Send receipt email
      const result = await sendPaymentReceipt(paymentData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Failed to send receipt email");
      }
    } catch (error) {
      console.error('Error sending receipt email:', error);
      setError("Failed to send receipt email. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Send Receipt button */}
      <button
        onClick={handleSendReceipt}
        disabled={sending}
        className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium ${
          sending 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } transition-colors`}
      >
        {sending ? (
          <>
            <FaSpinner className="animate-spin mr-1" />
            Sending...
          </>
        ) : (
          <>
            <FaEnvelope className="mr-1" />
            Send Receipt
          </>
        )}
      </button>
      
      {/* Success message - This is optional if you're showing global notifications elsewhere */}
      {success && (
        <div className="fixed top-24 right-4 z-50 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <FaCheckCircle className="text-green-500 mr-3" />
          <p className="text-green-800">Receipt email sent successfully!</p>
        </div>
      )}
      
      {/* Error message - This is optional if you're showing global notifications elsewhere */}
      {error && (
        <div className="fixed top-24 right-4 z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </>
  );
};

export default PaymentReceiptButton;
