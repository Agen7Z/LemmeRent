import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCheckCircle, FaSpinner, FaExclamationTriangle, FaSync,
  FaUser, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign,
  FaArrowLeft, FaClock, FaHome, FaPhone, FaInfoCircle,
  FaChevronRight, FaTimes
} from 'react-icons/fa';

const ShiftingStatusPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  
  // Get data passed from HR page
  const { worker, bookingData } = location.state || {};
  
  const [requestStatus, setRequestStatus] = useState('pending');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Check approval status on component mount and set up polling
  useEffect(() => {
    checkApprovalStatus();
    
    // Set up polling every 30 seconds for pending requests
    const interval = setInterval(() => {
      if (requestStatus === 'pending') {
        checkApprovalStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [requestId, requestStatus]);

  const checkApprovalStatus = async () => {
    if (!requestId) return;
    
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/shiftingRequest/status/${requestId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.access_token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setRequestStatus(data.status);
        setLastChecked(new Date());
        setError(null);
      } else {
        throw new Error('Failed to check status');
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setError('Unable to check request status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!worker || !bookingData) {
      setError('Missing booking information');
      return;
    }

    const processedWorker = {
      ...worker,
      rate: parseFloat(worker.rate) || 0
    };
    
    navigate("/payment", { 
      state: { 
        worker: processedWorker, 
        bookingData,
        shiftingRequestId: requestId
      } 
    });
  };

  const handleTryAgain = () => {
    navigate('/hr');
  };

  const formatRate = (rate) => {
    if (!rate) return "Rate not available";
    const numericRate = parseFloat(rate);
    return isNaN(numericRate) ? rate : `NPR ${numericRate.toLocaleString()}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500 w-8 h-8" />;
      case 'rejected':
        return <FaTimes className="text-red-500 w-8 h-8" />;
      default:
        return <FaSpinner className="text-blue-500 w-8 h-8 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'blue';
    }
  };

  const StatusCard = ({ status, title, description, actionButton }) => {
    const color = getStatusColor(status);
    
    return (
      <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-6 mb-6 shadow-sm`}>
        <div className="flex items-start space-x-4">
          <div className={`bg-${color}-100 p-3 rounded-full flex-shrink-0`}>
            {getStatusIcon(status)}
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-semibold text-${color}-800 mb-2`}>{title}</h3>
            <p className={`text-${color}-700 mb-4`}>{description}</p>
            {actionButton && (
              <div className="flex flex-wrap gap-3">
                {actionButton}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!requestId) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Invalid Request</h2>
          <p className="text-gray-600 mb-6">No request ID provided.</p>
          <button
            onClick={() => navigate('/hr')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to HR Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/hr')}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
              >
                <FaArrowLeft className="mr-2" />
                <span className="font-medium">Back to HR Services</span>
              </button>
              {lastChecked && (
                <span className="text-sm text-gray-500 flex items-center">
                  <FaClock className="mr-1" />
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Request ID:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {requestId.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaCheckCircle className="text-blue-600 w-12 h-12" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Request Submitted Successfully</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your shifting service request has been submitted. We'll notify you once it's reviewed.
            </p>
          </div>

          {/* Progress Timeline */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                1
              </div>
              <span className="text-sm font-medium text-gray-700 mt-2">Request Submitted</span>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${requestStatus !== 'pending' ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-500`}></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-colors duration-500 ${
                requestStatus === 'approved' || requestStatus === 'rejected' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-700 mt-2">Admin Review</span>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${requestStatus === 'approved' ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-500`}></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-colors duration-500 ${
                requestStatus === 'approved' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-sm font-medium text-gray-700 mt-2">Payment & Booking</span>
            </div>
          </div>

          {/* Status Messages */}
          {requestStatus === 'pending' && (
            <StatusCard
              status="pending"
              title="Awaiting Approval"
              description="Your request has been sent to admin for approval. After approval, you can make payment."
              actionButton={
                <>
                  
                  
                  <button
                    onClick={() => navigate("/profile?section=shifting-bookings")}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FaHome className="mr-2 inline" />
                    View My Bookings
                  </button>
                </>
              }
            />
          )}
          
          {requestStatus === 'approved' && (
            <StatusCard
              status="approved"
              title="Request Approved!"
              description="Great news! Your booking has been confirmed. You can now proceed to payment to finalize your shifting service."
              actionButton={
                <>
                  <button
                    onClick={handleProceedToPayment}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg font-medium transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <FaDollarSign className="mr-2 inline" />
                    Proceed to Payment
                    <FaChevronRight className="ml-2 inline" />
                  </button>
                  
                  <button
                    onClick={() => navigate("/profile?section=shifting-bookings")}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FaHome className="mr-2 inline" />
                    View My Bookings
                  </button>
                </>
              }
            />
          )}
          
          {requestStatus === 'rejected' && (
            <StatusCard
              status="rejected"
              title="Request Not Approved"
              description="Unfortunately, your shifting request couldn't be approved at this time. Please contact our support team or try submitting a new request with different details."
              actionButton={
                <>
                  <button
                    onClick={handleTryAgain}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FaSync className="mr-2 inline" />
                    Submit New Request
                  </button>
                  
                  <button
                    onClick={() => navigate("/profile?section=shifting-bookings")}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FaHome className="mr-2 inline" />
                    View My Bookings
                  </button>
                </>
              }
            />
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </div>
          
        {/* Booking Details Section */}
        {worker && bookingData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Worker Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <FaUser className="mr-3" />
                  Worker Information
                </h3>
                <p className="text-blue-100 mt-2">Details about your assigned worker</p>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{worker.name}</p>
                      <p className="text-sm text-gray-600">{worker.experience} experience</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-semibold text-green-600">{formatRate(worker.rate)}</span>
                    </div>
                    
                    {worker.specialties && (
                      <div>
                        <span className="text-gray-600 block mb-2">Specialties:</span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(worker.specialties) ? worker.specialties : worker.specialties.split(',')).map((specialty, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                            >
                              {specialty.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Total Amount Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaDollarSign className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold">Total Amount</p>
                        <p className="text-green-600 text-sm">Service charge</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{formatRate(worker.rate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <FaInfoCircle className="mr-3" />
                  Service Details
                </h3>
                <p className="text-green-100 mt-2">Your shifting service information</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                      <p className="font-semibold text-gray-800">{bookingData.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-800">{bookingData.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCalendarAlt className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Shifting Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(bookingData.shiftingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Shifting Address</p>
                      <p className="font-semibold text-gray-800">{bookingData.shiftingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Alternative fallback if no booking data */}
        {(!worker || !bookingData) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Booking Details Unavailable</h3>
                <p className="text-yellow-700 text-sm">
                  Some booking details are not available in this view. Please check your bookings page for complete information.
                </p>
                <button
                  onClick={() => navigate("/profile?section=shifting-bookings")}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Go to My Bookings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftingStatusPage;
