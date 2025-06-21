// components/ViewUserModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { useSelector } from "react-redux";
import { 
  FaUser, FaCalendarAlt, FaTruck, FaMoneyBillWave, 
  FaCalendarCheck, FaClock, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle,
  FaMapMarkerAlt, FaHistory, FaSignInAlt, FaUserClock,
  FaChartBar, FaFileInvoiceDollar, FaUserShield
} from "react-icons/fa";
import { format } from 'date-fns';

export default function ViewUserModal({ isOpen, onClose, userId }) {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [shiftingRequests, setShiftingRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch user data
        const userRes = await fetch(`/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (!userRes.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userRes.json();
        setUserData(userData);

        // Fetch user bookings
        const bookingsRes = await fetch(`/api/booking/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        // Fetch user shifting requests
        const shiftingRes = await fetch(`/api/shiftingRequest/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (shiftingRes.ok) {
          const shiftingData = await shiftingRes.json();
          setShiftingRequests(shiftingData.shiftingRequests || []);
        }

        // Fetch user payments
        const paymentsRes = await fetch(`/api/payments/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData.payments || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isOpen, currentUser]);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  // Get Status Badge based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "rejected":
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationCircle className="mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Calculate user statistics
  const userStats = {
    totalBookings: bookings.length,
    totalApprovedBookings: bookings.filter(b => b.status === "approved").length,
    totalPendingBookings: bookings.filter(b => b.status === "pending").length,
    totalShiftings: shiftingRequests.length,
    completedShiftings: shiftingRequests.filter(s => s.status === "completed").length,
    totalPayments: payments.length,
    totalAmountPaid: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    successfulPayments: payments.filter(p => p.status === "completed").length,
    registrationDate: userData?.createdAt,
    lastUpdated: userData?.updatedAt,
    isAdmin: userData?.isAdmin
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {userData?.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData?.username || "User"} 
                  className="h-16 w-16 rounded-full object-cover border-2 border-white mr-4"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-white/30 flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {userData?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {userData?.username || "Loading user..."}
                </h2>
                <p className="text-blue-100 mt-1">{userData?.email || ""}</p>
                {userData?.isAdmin && (
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-800 text-white">
                    <FaUserShield className="mr-1" />
                    Administrator
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaChartBar className="inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "bookings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaCalendarAlt className="inline-block mr-2" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("shiftings")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "shiftings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaTruck className="inline-block mr-2" />
              Shifting Requests
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaMoneyBillWave className="inline-block mr-2" />
              Payments
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-gray-600">Loading user data...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load user data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">User Overview</h3>
                  
                  {/* User metadata */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FaUser className="mr-2 text-indigo-500" />
                      Account Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Username</p>
                        <p className="font-medium">{userData?.username || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Email</p>
                        <p className="font-medium">{userData?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 flex items-center">
                          <FaUserClock className="mr-1 text-gray-400" />
                          Registration Date
                        </p>
                        <p className="font-medium">{formatDate(userStats.registrationDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 flex items-center">
                          <FaHistory className="mr-1 text-gray-400" />
                          Last Updated
                        </p>
                        <p className="font-medium">{formatDate(userStats.lastUpdated)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">User Role</p>
                        <p className="font-medium">
                          {userStats.isAdmin ? (
                            <span className="text-red-600 font-medium flex items-center">
                              <FaUserShield className="mr-1" />
                              Administrator
                            </span>
                          ) : (
                            "Regular User"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Account Status</p>
                        <p className="font-medium">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" />
                            Active
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-3 mr-4">
                          <FaCalendarAlt className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Bookings</p>
                          <p className="text-2xl font-bold text-gray-900">{userStats.totalBookings}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Approved</p>
                          <p className="text-sm font-medium text-green-600">{userStats.totalApprovedBookings}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="text-sm font-medium text-yellow-600">{userStats.totalPendingBookings}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-3 mr-4">
                          <FaTruck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Shiftings</p>
                          <p className="text-2xl font-bold text-gray-900">{userStats.totalShiftings}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-sm font-medium text-green-600">{userStats.completedShiftings}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">In Progress</p>
                          <p className="text-sm font-medium text-blue-600">
                            {userStats.totalShiftings - userStats.completedShiftings}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-3 mr-4">
                          <FaFileInvoiceDollar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount Paid</p>
                          <p className="text-2xl font-bold text-gray-900">
                            Rs. {userStats.totalAmountPaid.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Transactions</p>
                          <p className="text-sm font-medium text-gray-800">{userStats.totalPayments}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Successful</p>
                          <p className="text-sm font-medium text-green-600">{userStats.successfulPayments}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity Section */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
                    
                    {/* Show a sample of recent activity from all categories */}
                    <div className="space-y-4">
                      {[...bookings, ...shiftingRequests, ...payments]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                        .map((activity, index) => {
                          // Determine what type of activity this is
                          const isBooking = activity.listingId || activity.preferredDate;
                          const isShifting = activity.shiftingDate;
                          const isPayment = activity.amount && activity.transactionId;
                          
                          return (
                            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start">
                              {isBooking && (
                                <>
                                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                    <FaCalendarCheck className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      Property Booking {getStatusBadge(activity.status)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <FaMapMarkerAlt className="mr-1" />
                                      {activity.address || "Address not available"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <FaCalendarAlt className="mr-1" />
                                      {formatDate(activity.preferredDate || activity.createdAt)}
                                    </p>
                                  </div>
                                </>
                              )}
                              
                              {isShifting && (
                                <>
                                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                                    <FaTruck className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      Shifting Request {getStatusBadge(activity.status)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <FaMapMarkerAlt className="mr-1" />
                                      {activity.shiftingAddress || "Address not available"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <FaCalendarAlt className="mr-1" />
                                      {formatDate(activity.shiftingDate || activity.createdAt)}
                                    </p>
                                  </div>
                                </>
                              )}
                              
                              {isPayment && (
                                <>
                                  <div className="bg-green-100 rounded-full p-2 mr-3">
                                    <FaMoneyBillWave className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      Payment {getStatusBadge(activity.status)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Rs. {activity.amount.toLocaleString()} via {activity.method || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <FaCalendarAlt className="mr-1" />
                                      {formatDate(activity.paymentDate || activity.createdAt)}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      
                      {([...bookings, ...shiftingRequests, ...payments]).length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <FaHistory className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No recent activity found for this user</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Booking History</h3>
                    <span className="text-sm text-gray-500">
                      Total: {bookings.length} bookings
                    </span>
                  </div>
                  
                  {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-800 font-medium text-lg mb-2">No Bookings Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This user hasn't made any property bookings yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <div 
                          key={index} 
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="mb-3 md:mb-0">
                                <h4 className="font-medium text-gray-900">
                                  {booking.name || "Unnamed Booking"}
                                </h4>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                  {booking.address || "Address not available"}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaCalendarAlt className="mr-1 text-gray-400" />
                                  Visit Date: {formatDate(booking.preferredDate)}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaClock className="mr-1 text-gray-400" />
                                  Booked on: {formatDate(booking.createdAt)}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                {getStatusBadge(booking.status)}
                                
                                <p className="text-sm text-gray-500 mt-2">
                                  Property: {booking.listingId && typeof booking.listingId === 'object'
                                    ? booking.listingId.name || "Unknown Property"
                                    : "Property ID: " + booking.listingId
                                  }
                                </p>
                                
                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                  <FaUser className="mr-1 text-gray-400" />
                                  Contact: {booking.contact || "No contact info"}
                                </p>
                              </div>
                            </div>
                            
                            {/* Payment info if available */}
                            {booking.payment && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-700 flex items-center">
                                  <FaMoneyBillWave className="mr-1 text-green-500" />
                                  Payment Status: {getStatusBadge(booking.payment.status)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "shiftings" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Shifting Request History</h3>
                    <span className="text-sm text-gray-500">
                      Total: {shiftingRequests.length} shifting requests
                    </span>
                  </div>
                  
                  {shiftingRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaTruck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-800 font-medium text-lg mb-2">No Shifting Requests Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This user hasn't made any shifting service requests yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shiftingRequests.map((request, index) => (
                        <div 
                          key={index} 
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="mb-3 md:mb-0">
                                <h4 className="font-medium text-gray-900">
                                  {request.customerName || "Unnamed Customer"}
                                </h4>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                  {request.shiftingAddress || "Address not available"}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaCalendarAlt className="mr-1 text-gray-400" />
                                  Shifting Date: {formatDate(request.shiftingDate)}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaClock className="mr-1 text-gray-400" />
                                  Requested on: {formatDate(request.createdAt)}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                {getStatusBadge(request.status)}
                                
                                <p className="text-sm text-gray-500 mt-2">
                                  Amount: Rs. {request.totalAmount?.toLocaleString() || "N/A"}
                                </p>
                                
                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                  <FaUser className="mr-1 text-gray-400" />
                                  Contact: {request.customerPhone || "No contact info"}
                                </p>
                              </div>
                            </div>
                            
                            {/* Worker info if available */}
                            {request.workerId && typeof request.workerId === 'object' && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-700">
                                  Worker: {request.workerId.name || "Unknown Worker"}
                                  {request.workerId.experience && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({request.workerId.experience})
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            
                            {/* Payment info if available */}
                            {request.payment && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-700 flex items-center">
                                  <FaMoneyBillWave className="mr-1 text-green-500" />
                                  Payment Status: {getStatusBadge(request.payment.status)}
                                  {request.payment.method && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      via {request.payment.method}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                    <span className="text-sm text-gray-500">
                      Total: Rs. {userStats.totalAmountPaid.toLocaleString()} ({payments.length} transactions)
                    </span>
                  </div>
                  
                  {payments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaMoneyBillWave className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-800 font-medium text-lg mb-2">No Payment Records Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This user hasn't made any payments yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.transactionId || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Rs. {payment.amount?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payment.paymentDate || payment.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(payment.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.method === 'khalti' ? 'Khalti' : payment.method || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.bookingType === 'shifting' ? 'Shifting Service' : 'Property Booking'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
