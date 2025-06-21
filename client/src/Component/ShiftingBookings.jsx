import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaTruck, FaUser, FaCalendarCheck, FaMapMarkerAlt,
  FaClock, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaTrash, FaExclamationTriangle, FaMoneyBillWave, 
  FaPhoneAlt, FaInfoCircle
} from 'react-icons/fa';

const ShiftingBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [shiftingBookings, setShiftingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showWorkerDetails, setShowWorkerDetails] = useState({});

  // Fetch shifting bookings
  useEffect(() => {
    const fetchShiftingBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/shiftingRequest/user/${currentUser._id}`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success === false) {
          setError(data.message || "Failed to load shifting bookings");
          setLoading(false);
          return;
        }
        
        setShiftingBookings(data.shiftingRequests || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shifting bookings:", error);
        setError("Failed to load shifting bookings");
        setLoading(false);
      }
    };

    fetchShiftingBookings();
  }, [currentUser._id]);

  // Handle delete click
  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteConfirmation(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setBookingToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Confirm and process soft delete
  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/shiftingRequest/user/${bookingToDelete._id}/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Remove the deleted booking from the list
        setShiftingBookings(shiftingBookings.filter(booking => booking._id !== bookingToDelete._id));
        setSuccessMessage('Shifting request deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.message || 'Failed to delete shifting request');
      }
    } catch (err) {
      console.error('Error deleting shifting request:', err);
      setError('An error occurred while deleting the shifting request');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setBookingToDelete(null);
    }
  };

  // Toggle worker details
  const toggleWorkerDetails = (bookingId) => {
    setShowWorkerDetails(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800 shadow-sm">
            <FaCheckCircle className="mr-1.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-red-100 text-red-800 shadow-sm">
            <FaTimesCircle className="mr-1.5" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 shadow-sm">
            <FaCheckCircle className="mr-1.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
            <FaSpinner className="mr-1.5 animate-spin" />
            Pending
          </span>
        );
    }
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Paid
          </span>
        );
      case 'initiated':
        return (
          <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            <FaSpinner className="mr-1 animate-spin" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            <FaMoneyBillWave className="mr-1" />
            Pending
          </span>
        );
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-lg text-gray-700 font-medium">Loading your shifting bookings...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
              <FaInfoCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Shifting Bookings</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-24 right-4 z-50 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg flex items-center animate-fade-in-out">
            <FaCheckCircle className="text-green-500 mr-3" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <FaExclamationTriangle className="text-red-500 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Shifting Request</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete your shifting request for {bookingToDelete?.shiftingDate ? formatDate(bookingToDelete.shiftingDate) : "this date"}?
                </p>
                <p className="text-red-600 text-sm mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaTruck className="mr-3 text-blue-600" />
                My Shifting Requests
              </h2>
              <p className="mt-2 text-gray-600">Track and manage your property shifting services</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                <span className="text-blue-800 font-medium mr-2">Total:</span>
                <span className="text-blue-600 font-bold">{shiftingBookings.length}</span>
              </div>
              <div className="flex items-center bg-green-50 rounded-lg px-4 py-2 border border-green-100">
                <span className="text-green-800 font-medium mr-2">Completed:</span>
                <span className="text-green-600 font-bold">
                  {shiftingBookings.filter(booking => booking.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-100">
                <span className="text-yellow-800 font-medium mr-2">Pending:</span>
                <span className="text-yellow-600 font-bold">
                  {shiftingBookings.filter(booking => booking.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Display */}
        {shiftingBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 flex items-center justify-center rounded-full mb-6">
              <FaTruck className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Shifting Requests Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't made any property shifting requests yet. Request a shifting service to help move your belongings.
            </p>
            <Link
              to="/hr"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
            >
              Request Shifting Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {shiftingBookings.map((booking) => (
              <div 
                key={booking._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
                      <div className="bg-blue-100 p-3 rounded-full mb-3 md:mb-0 md:mr-4">
                        <FaTruck className="text-blue-600 h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{booking.customerName}</h3>
                        <p className="text-gray-600">{booking.customerPhone}</p>
                      </div>
                    </div>
                    
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Shifting Address</h4>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-gray-800">{booking.shiftingAddress}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Shifting Date</h4>
                      <div className="flex items-center">
                        <FaCalendarCheck className="text-blue-500 mr-2 flex-shrink-0" />
                        <p className="text-gray-800">{formatDate(booking.shiftingDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-3 md:mb-0">
                        <FaMoneyBillWave className="text-green-500 mr-2" />
                        <span className="font-medium text-gray-800 mr-2">Total Amount:</span>
                        <span className="text-gray-900">Rs. {booking.totalAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Payment Status:</span>
                        {getPaymentBadge(booking.payment?.status)}
                      </div>
                    </div>
                  </div>

                  {/* Worker details section with toggle */}
                  {booking.workerId && (
                    <div className="border-t border-gray-100 pt-4">
                      <button 
                        onClick={() => toggleWorkerDetails(booking._id)}
                        className="flex items-center justify-between w-full focus:outline-none"
                      >
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <FaUser className="mr-2 text-gray-500" />
                          Worker Information
                        </h4>
                        <span className="text-blue-600 text-sm">
                          {showWorkerDetails[booking._id] ? 'Hide Details' : 'Show Details'}
                        </span>
                      </button>
                      
                      {showWorkerDetails[booking._id] && (
                        <div className="mt-3 pl-6 bg-gray-50 p-4 rounded-lg">
                          <p className="flex items-center mb-2">
                            <span className="font-medium text-gray-700 mr-2">Name:</span>
                            <span className="text-gray-800">
                              {booking.workerId.name || "No name provided"}
                            </span>
                          </p>
                          
                          <p className="flex items-center mb-2">
                            <span className="font-medium text-gray-700 mr-2">Experience:</span>
                            <span className="text-gray-800">
                              {booking.workerId.experience || "Not specified"} years
                            </span>
                          </p>
                          
                          <p className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">Rate:</span>
                            <span className="text-gray-800">
                              Rs. {booking.workerId.rate || "Not specified"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-1 text-gray-400" />
                      <span>Created: {formatDate(booking.createdAt)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                      
                      {booking.status === 'approved' && booking.payment?.status !== 'completed' && (
                        <Link
                          to={`/payment/shifting/${booking._id}`}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                          <FaMoneyBillWave className="mr-2" />
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShiftingBookings;
