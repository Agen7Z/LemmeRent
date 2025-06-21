import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaListAlt, FaReceipt, FaCalendarCheck, FaCreditCard, FaClock } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentDetails = location.state?.paymentDetails;

  const goToBookings = () => {
    navigate('/mybookings');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header - Changed to blue theme */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
              <FaCheckCircle className="text-blue-600 text-4xl" /> {/* Changed to blue */}
            </div>
            <h2 className="text-3xl font-bold">Payment Successful!</h2>
            <p className="mt-2 opacity-90">Your transaction has been completed</p>
          </div>

          <div className="p-8">
            {/* Payment Details Card */}
            {paymentDetails ? (
              <div className="mb-8">
                <h3 className="text-gray-700 font-semibold text-lg mb-4 flex items-center">
                  <FaReceipt className="mr-2 text-blue-600" /> {/* Changed to blue */}
                  Payment Details
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                    <div className="p-4">
                      <div className="flex items-center mb-1 text-sm text-gray-500">
                        <FaCreditCard className="mr-2" />
                        Payment Method
                      </div>
                      <p className="font-medium text-gray-800">
                        {paymentDetails.method ? paymentDetails.method.charAt(0).toUpperCase() + paymentDetails.method.slice(1) : 'Online Payment'}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-1 text-sm text-gray-500">
                        <FaCalendarCheck className="mr-2" />
                        Date
                      </div>
                      <p className="font-medium text-gray-800">
                        {paymentDetails.paymentDate ? new Date(paymentDetails.paymentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                      <div className="p-4">
                        <div className="flex items-center mb-1 text-sm text-gray-500">
                          <FaListAlt className="mr-2" />
                          Transaction ID
                        </div>
                        <p className="font-medium text-gray-800 break-words">
                          {paymentDetails.transactionId || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-1 text-sm text-gray-500">
                          <FaClock className="mr-2" />
                          Status
                        </div>
                        <p className="font-medium text-blue-600"> {/* Changed to blue */}
                          {paymentDetails.status ? paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1) : 'Completed'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-700"> {/* Changed to blue */}
                        NPR {paymentDetails.amount ? paymentDetails.amount.toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center mb-8">
                <div className="p-6 bg-blue-50 rounded-xl mb-6"> {/* Changed to blue */}
                  <p className="text-gray-700">
                    Your payment has been successfully processed. The transaction details will be sent to your email.
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Message */}
            <div className="text-center mb-8">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"> {/* Changed to blue */}
                <p className="text-blue-700"> {/* Changed to blue */}
                  Thank you for your payment! Your booking has been confirmed.We will send you a confirmation email shortly.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToBookings}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow hover:shadow-md flex items-center justify-center"
              >
                <FaListAlt className="mr-2" />
                View My Bookings
              </button>
              <button
                onClick={goToHome}
                className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all border border-gray-300 flex items-center justify-center"
              >
                <FaHome className="mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>If you have any questions about your payment, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
