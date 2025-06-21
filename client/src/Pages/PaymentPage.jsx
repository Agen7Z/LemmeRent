import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaSpinner, FaArrowLeft, FaMoneyBillWave, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaHome } from 'react-icons/fa';

const PaymentPage = () => {
  const { bookingId, requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  // Data from HR page (if available)
  const hrData = location.state;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log for debugging
        console.log("URL Path:", location.pathname);
        console.log("Params:", { bookingId, requestId });
        console.log("HR Data:", hrData);
        
        // Determine if we're on a shifting payment page
        const isShiftingPayment = location.pathname.includes('/payment/shifting/');
        
        if (isShiftingPayment && requestId) {
          // Fetch shifting request data
          try {
            const response = await axios.get(`/api/shiftingRequest/${requestId}`, {
              headers: {
                Authorization: `Bearer ${currentUser?.access_token}`,
              },
            });
            
            console.log("Shifting request response:", response.data);
            
            if (response.data && (response.data.shiftingRequest || response.data.success)) {
              // Extract the data based on your API response structure
              const shiftingData = response.data.shiftingRequest || response.data;
              
              // Now fetch worker details if needed
              let workerData = null;
              if (shiftingData.workerId) {
                try {
                  const workerResponse = await axios.get(`/api/worker/${shiftingData.workerId}`, {
                    headers: {
                      Authorization: `Bearer ${currentUser?.access_token}`,
                    },
                  });
                  workerData = workerResponse.data.worker || workerResponse.data;
                } catch (workerErr) {
                  console.warn("Could not fetch worker details:", workerErr);
                }
              }
              
              // Create a booking object from shifting request data
              setBooking({
                _id: shiftingData._id,
                totalAmount: shiftingData.totalAmount || 500,
                listing: { name: 'Shifting Service' },
                checkIn: shiftingData.shiftingDate,
                checkOut: shiftingData.shiftingDate,
                customerName: shiftingData.customerName || currentUser?.username,
                customerEmail: currentUser?.email,
                customerPhone: shiftingData.customerPhone || '',
                shiftingAddress: shiftingData.shiftingAddress,
                workerId: shiftingData.workerId,
                worker: workerData,
                isShiftingRequest: true
              });
            } else {
              setError('Failed to load shifting request details. Please try again.');
            }
          } catch (err) {
            console.error("Error fetching shifting request:", err);
            setError('Unable to load shifting request data. Please try again later.');
          }
        } else if (bookingId) {
          // Regular booking
          try {
            const response = await axios.get(`/api/booking/${bookingId}`, {
              headers: {
                Authorization: `Bearer ${currentUser?.access_token}`,
              },
            });
            setBooking(response.data);
          } catch (err) {
            console.error("Error fetching booking:", err);
            setError('Failed to fetch booking details. Please try again later.');
          }
        } else if (hrData && hrData.worker) {
          // Data passed via location state (for HR data)
          setBooking({
            _id: 'hr-' + Date.now(),
            totalAmount: parseFloat(hrData.worker.rate) || 500,
            listing: { name: 'Shifting Service' },
            checkIn: hrData.bookingData?.shiftingDate || new Date().toISOString(),
            checkOut: hrData.bookingData?.shiftingDate || new Date().toISOString(),
            customerName: hrData.bookingData?.customerName || currentUser?.username,
            customerEmail: currentUser?.email,
            customerPhone: hrData.bookingData?.customerPhone || '',
            shiftingAddress: hrData.bookingData?.shiftingAddress || '',
            workerId: hrData.worker._id,
            worker: hrData.worker,
            shiftingRequestId: hrData.shiftingRequestId,
            isShiftingRequest: true
          });
        } else {
          setError('No booking information available');
        }
      } catch (err) {
        console.error("Error in fetchBookingData:", err);
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBookingData();
    } else {
      setError('Please sign in to access payment information');
      setLoading(false);
    }
  }, [bookingId, requestId, location, currentUser, hrData]);

  const initiateKhaltiPayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError(null);

      // Determine if this is a shifting request or a regular booking
      const isShiftingRequest = booking.isShiftingRequest || location.pathname.includes('/payment/shifting/');

      let payloadData;
      
      if (isShiftingRequest) {
        // For shifting payments
        payloadData = {
          amount: booking.totalAmount,
          purchaseData: {
            name: `Shifting Service Payment`,
            customerName: booking.customerName || currentUser.username,
            customerEmail: currentUser.email,
            customerPhone: booking.customerPhone || '9800000000'
          },
          bookingType: 'shifting',
          bookingDetails: {
            workerId: booking.workerId,
            shiftingDate: booking.checkIn,
            shiftingAddress: booking.shiftingAddress,
            userId: currentUser._id,
            shiftingRequestId: booking.shiftingRequestId
          }
        };
      } else {
        // For regular bookings
        payloadData = {
          amount: booking.totalAmount,
          bookingId: booking._id,
          purchaseData: {
            name: `Booking #${booking._id}`,
            customerName: booking.customerName || currentUser.username,
            customerEmail: currentUser.email,
            customerPhone: booking.customerPhone || '9800000000'
          },
          bookingType: 'property'
        };
      }

      console.log("Payment payload:", payloadData);

      const response = await axios.post('/api/payments/initiate', payloadData, {
        headers: {
          Authorization: `Bearer ${currentUser.access_token}`,
        },
      });

      console.log("Payment initiation response:", response.data);

      if (response.data && response.data.data && response.data.data.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.data.data.payment_url;
      } else {
        setPaymentError("Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.response?.data?.error || "Something went wrong with the payment process");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Determine if this is a shifting service or a regular booking
  const isShiftingService = booking?.isShiftingRequest || 
                            booking?._id?.toString().startsWith('hr-') ||
                            (booking?.workerId && booking?.shiftingAddress);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <FaSpinner className="text-blue-500 text-4xl animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment Details</h2>
          <p className="text-gray-600">Please wait while we prepare your payment information...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Error</h2>
          <p className="text-gray-600 mb-6">{error || "No booking information available"}</p>
          
          {/* Debug information - remove in production */}
          <div className="text-xs text-gray-500 mb-4 text-left">
            <p>Path: {location.pathname}</p>
            <p>RequestID: {requestId || "Not set"}</p>
            <p>BookingID: {bookingId || "Not set"}</p>
            <p>HR Data Present: {hrData ? "Yes" : "No"}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/hr')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to HR Services
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if booking is already paid
  if (booking.payment && booking.payment.status === 'completed') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Already Completed</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6 max-w-md mx-auto text-left">
            <p className="mb-2"><strong>Booking ID:</strong> {booking._id}</p>
            <p className="mb-2"><strong>Amount:</strong> NPR {booking.totalAmount}</p>
            <p className="mb-2"><strong>Status:</strong> {booking.status}</p>
            <p className="mb-2"><strong>Payment Method:</strong> {booking.payment.method}</p>
            {booking.payment.verified_at && (
              <p><strong>Payment Date:</strong> {new Date(booking.payment.verified_at).toLocaleString()}</p>
            )}
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/mybookings')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-6 px-8 text-white">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center mb-6 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/30 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            
            <h1 className="text-2xl font-bold flex items-center">
              <FaMoneyBillWave className="mr-3" />
              Complete Your Payment
            </h1>
            {!isShiftingService ? (
              <p className="mt-2 text-blue-100">Booking ID: {booking._id}</p>
            ) : (
              <p className="mt-2 text-blue-100">Shifting Service Payment</p>
            )}
          </div>

          <div className="p-8">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                {isShiftingService ? (
                  <>
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    Shifting Service Details
                  </>
                ) : (
                  <>
                    <FaHome className="mr-2 text-blue-500" />
                    Booking Information
                  </>
                )}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {isShiftingService ? (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500">Service</span>
                      <p className="font-medium text-gray-800">Shifting Service</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500">Worker</span>
                      <p className="font-medium text-gray-800">
                        {booking.worker?.name || 'Selected Worker'}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-500" /> Shifting Date
                      </span>
                      <p className="font-medium text-gray-800">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaMoneyBillWave className="mr-1 text-green-500" /> Total Amount
                      </span>
                      <p className="font-medium text-green-600">NPR {booking.totalAmount}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaHome className="mr-1 text-blue-500" /> Property
                      </span>
                      <p className="font-medium text-gray-800">{booking.listing?.name || 'Property'}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-500" /> Check In
                      </span>
                      <p className="font-medium text-gray-800">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-500" /> Check Out
                      </span>
                      <p className="font-medium text-gray-800">
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaMoneyBillWave className="mr-1 text-green-500" /> Total Amount
                      </span>
                      <p className="font-medium text-green-600">NPR {booking.totalAmount}</p>
                    </div>
                  </>
                )}
              </div>

              {isShiftingService && booking.shiftingAddress && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-blue-500" /> Shifting Address
                    </span>
                    <p className="font-medium text-gray-800">{booking.shiftingAddress}</p>
                  </div>
                </div>
              )}
              
              {/* Customer Information */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaUser className="mr-1 text-blue-500" /> Name
                    </span>
                    <p className="font-medium text-gray-800">
                      {booking.customerName || currentUser?.username}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaPhone className="mr-1 text-blue-500" /> Phone
                    </span>
                    <p className="font-medium text-gray-800">{booking.customerPhone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Method</h2>
              <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="khalti"
                    name="payment_method"
                    checked={true}
                    readOnly
                    className="mr-3"
                  />
                  <label htmlFor="khalti" className="flex items-center cursor-pointer">
                    <span className="font-medium">Khalti</span>
                  </label>
                </div>
              </div>

              <button
                onClick={initiateKhaltiPayment}
                disabled={paymentLoading}
                className={`w-full py-3 rounded-lg font-medium text-white ${
                  paymentLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } transition-all duration-300 shadow-md flex items-center justify-center`}
              >
                {paymentLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay NPR ${booking.totalAmount} with Khalti`
                )}
              </button>

              {paymentError && (
                <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg">
                  {paymentError}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p>By proceeding with this payment, you agree to our terms and conditions.</p>
              <p className="mt-2">Need help? Contact our support team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
