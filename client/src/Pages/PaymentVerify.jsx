import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaHome, 
  FaListAlt, 
  FaArrowRight,
  FaCreditCard,
  FaShieldAlt
} from 'react-icons/fa';

const PaymentVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress for loading state
    if (verificationStatus === 'verifying') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [verificationStatus]);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get the pidx from the URL query parameters
      const params = new URLSearchParams(location.search);
      const pidx = params.get('pidx');
      
      if (!pidx) {
        setVerificationStatus('error');
        setError('Missing payment information');
        return;
      }
      
      try {
        const res = await axios.post(
          '/api/payments/verify',
          { pidx },
          {
            headers: {
              Authorization: `Bearer ${currentUser?.access_token}`,
            },
          }
        );
        
        setProgress(100);
        
        if (res.data.status === 'Completed') {
          setVerificationStatus('success');
          setPaymentDetails({
            amount: res.data.total_amount / 100, // Convert paisa to rupees
            transactionId: res.data.transaction_id || 'N/A',
            paymentDate: new Date().toLocaleDateString(),
            method: 'Khalti',
            status: 'completed'
          });
          
          // Redirect to success page after a short delay
          setTimeout(() => {
            navigate('/payment/success', {
              state: { 
                paymentDetails: {
                  amount: res.data.total_amount / 100,
                  transactionId: res.data.transaction_id || 'N/A',
                  paymentDate: new Date().toLocaleDateString(),
                  method: 'Khalti',
                  status: 'completed'
                }
              }
            });
          }, 3000);
        } else {
          setVerificationStatus('error');
          setError(`Payment verification failed: ${res.data.status || 'Unknown status'}`);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setVerificationStatus('error');
        setError(err.response?.data?.error || 'Failed to verify payment');
      }
    };

    if (currentUser?._id) {
      verifyPayment();
    }
  }, [location, currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-white text-center ${
            verificationStatus === 'verifying' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
            verificationStatus === 'success' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' :
            'bg-gradient-to-r from-red-500 to-orange-500'
          }`}>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-4 ${
              verificationStatus === 'verifying' ? 'bg-blue-400 bg-opacity-30' :
              verificationStatus === 'success' ? 'bg-white' : 'bg-white'
            }`}>
              {verificationStatus === 'verifying' && (
                <FaSpinner className="text-white text-3xl animate-spin" />
              )}
              {verificationStatus === 'success' && (
                <FaCheckCircle className="text-blue-600 text-4xl" />
              )}
              {verificationStatus === 'error' && (
                <FaExclamationTriangle className="text-red-500 text-4xl" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold">
              {verificationStatus === 'verifying' && 'Verifying Payment'}
              {verificationStatus === 'success' && 'Payment Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
            </h2>
            
            <p className="mt-2 opacity-90">
              {verificationStatus === 'verifying' && 'Please wait while we confirm your transaction'}
              {verificationStatus === 'success' && 'Your payment has been successfully verified'}
              {verificationStatus === 'error' && 'We encountered an issue with your payment'}
            </p>
          </div>

          <div className="p-8">
            {/* Verifying state */}
            {verificationStatus === 'verifying' && (
              <div className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <FaCreditCard className="text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium">Processing Payment</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <FaShieldAlt className="text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium">Verifying Transaction</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <FaArrowRight className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium">Confirming Booking</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">
                  Please do not close this window while we process your transaction.
                </p>
                <p className="text-gray-500 text-sm">
                  This usually takes less than a minute.
                </p>
              </div>
            )}
            
            {/* Success state */}
            {verificationStatus === 'success' && (
              <div className="text-center">
                <div className="mb-6 bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <FaCheckCircle className="text-blue-600" />
                    </div>
                    <p className="text-blue-700 font-medium">Transaction successfully verified</p>
                  </div>
                  
                  {paymentDetails && (
                    <p className="text-gray-700">
                      Your payment of <span className="font-bold">NPR {paymentDetails.amount.toLocaleString()}</span> has been processed.
                    </p>
                  )}
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-block rounded-full bg-blue-100 text-blue-800 px-4 py-1 text-sm animate-pulse">
                    Redirecting to confirmation page...
                  </div>
                </div>
                
                <div className="max-w-sm mx-auto p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-600 text-sm">
                    A confirmation email will be sent to your registered email address with all the details.
                  </p>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {verificationStatus === 'error' && (
              <div className="text-center">
                <div className="mb-6 bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                  <p className="text-red-700 mb-2 font-medium">
                    {error || 'There was a problem verifying your payment.'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    This could be due to a network issue, payment cancellation, or timeout.
                  </p>
                </div>
                
                <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg mb-8">
                  <h3 className="font-medium text-gray-700 mb-2">What can you do?</h3>
                  <ul className="text-gray-600 text-sm text-left list-disc pl-5 space-y-1">
                    <li>Check your bank account to confirm if payment was deducted</li>
                    <li>Try the payment again in a few minutes</li>
                    <li>Contact customer support if the issue persists</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/mybookings')}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow hover:shadow-md flex items-center justify-center"
                  >
                    <FaListAlt className="mr-2" />
                    Go to My Bookings
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all border border-gray-300 flex items-center justify-center"
                  >
                    <FaHome className="mr-2" />
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>
            {verificationStatus === 'error' 
              ? 'If you need assistance, please contact our support team.' 
              : 'Powered by secure payment processing.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerify;
