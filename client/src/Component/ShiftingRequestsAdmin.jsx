import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaTruck,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendar,
  FaPhone,
  FaHardHat,
  FaStar,
  FaInfoCircle,
  FaMoneyBillWave,
  FaCheck,
  FaTimes,
  FaClock
} from "react-icons/fa";

const ShiftingRequestsAdmin = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [shiftingRequests, setShiftingRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingRequestIds, setProcessingRequestIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchShiftingRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/shiftingRequest/all", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch shifting requests");
        }
        setShiftingRequests(data.shiftingRequests);
        setFilteredRequests(data.shiftingRequests);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Shifting Requests Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShiftingRequests();
  }, [currentUser]);

  useEffect(() => {
    let result = [...shiftingRequests];
    
    if (searchTerm.trim() !== "") {
      result = result.filter(
        request => 
          request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.shiftingAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(result);
  }, [shiftingRequests, searchTerm, statusFilter]);

  const handleUpdateRequestStatus = async (requestId, status) => {
    setError(null);
    setProcessingRequestIds(prev => [...prev, requestId]);
    
    try {
      const res = await fetch(`/api/shiftingRequest/update/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update shifting request status");
      }
      
      const updatedRequests = shiftingRequests.map((request) =>
        request._id === requestId ? { ...request, status, statusUpdated: true } : request
      );
      setShiftingRequests(updatedRequests);
      
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
      showSuccess(`Request ${status} successfully`);
    } catch (error) {
      setError(error.message);
      console.error("Error updating shifting request status:", error);
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheck />;
      case 'rejected':
        return <FaTimes />;
      case 'completed':
        return <FaCheckCircle />;
      default:
        return <FaClock />;
    }
  };

  // Render a simple, clean action button
  const ActionButton = ({ onClick, color, icon, label, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} text-white px-3 py-1.5 rounded-md flex items-center text-sm transition-all hover:shadow-md ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
      }`}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </button>
  );

  return (
    <div>
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-100 border-l-4 border-green-500 rounded-md shadow-lg p-4 w-auto max-w-sm animate-fadeIn">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-3" />
            <p className="text-green-800">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <FaTimesCircle />
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto md:flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative inline-block w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FaTruck className="mr-2" />
            Shifting Requests
          </h2>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            {filteredRequests.length} requests
          </div>
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading shifting requests...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Requests</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Shifting Requests Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search filters" 
                : "Requests will appear here when they are created"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const workerDetails = request.workerId && typeof request.workerId === 'object' 
                ? request.workerId 
                : null;
                
              const isProcessing = processingRequestIds.includes(request._id);
                
              return (
                <div key={request._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Customer Info */}
                    <div className="flex-grow space-y-3">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getStatusColor(request.status)} text-white flex items-center justify-center mr-3`}>
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-800">{request.customerName}</h3>
                            <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-600 flex items-center text-sm">
                              <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                              {request.shiftingAddress}
                            </p>
                            <p className="text-gray-600 flex items-center text-sm">
                              <FaCalendar className="text-gray-400 mr-2 flex-shrink-0" />
                              {new Date(request.shiftingDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-gray-600 flex items-center text-sm">
                              <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
                              {request.customerPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Info Card */}
                      {request.payment && (
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-3">
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <FaMoneyBillWave className="mr-2 text-green-600" />
                            Payment Details
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Status:</span>{' '}
                              <span className={`font-medium ${
                                request.payment.status === 'completed' ? 'text-green-600' : 
                                request.payment.status === 'failed' ? 'text-red-600' : 
                                'text-yellow-600'
                              }`}>
                                {request.payment.status.charAt(0).toUpperCase() + request.payment.status.slice(1)}
                              </span>
                            </div>
                            {request.payment.method && (
                              <div>
                                <span className="text-gray-500">Method:</span>{' '}
                                <span className="font-medium">
                                  {request.payment.method.charAt(0).toUpperCase() + request.payment.method.slice(1)}
                                </span>
                              </div>
                            )}
                            {request.totalAmount && (
                              <div>
                                <span className="text-gray-500">Amount:</span>{' '}
                                <span className="font-medium">NPR {request.totalAmount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Worker Card */}
                    <div className="lg:w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3 pb-1 border-b border-gray-200 flex items-center">
                        <FaHardHat className="mr-2 text-indigo-600" />
                        Worker Details
                      </h4>
                      
                      {workerDetails ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex">
                            <div className="w-20 text-gray-500">Name:</div>
                            <div className="flex-grow font-medium">{workerDetails.name || "Not provided"}</div>
                          </div>
                          <div className="flex">
                            <div className="w-20 text-gray-500">Experience:</div>
                            <div className="flex-grow">{workerDetails.experience || "Not specified"}</div>
                          </div>
                          <div className="flex">
                            <div className="w-20 text-gray-500">Rate:</div>
                            <div className="flex-grow">
                              {workerDetails.rate ? `Rs. ${workerDetails.rate}` : "Not specified"}
                            </div>
                          </div>
                          
                          {workerDetails.specialties && (
                            <div className="pt-2">
                              <div className="text-gray-500 mb-1">Specialties:</div>
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(workerDetails.specialties) 
                                  ? workerDetails.specialties 
                                  : workerDetails.specialties.split(',').map(s => s.trim())
                                ).map((specialty, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {workerDetails.rating !== undefined && (
                            <div className="flex mt-1">
                              <div className="w-20 text-gray-500">Rating:</div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i}
                                    className={i < workerDetails.rating ? "text-yellow-500" : "text-gray-300"}
                                    size={14}
                                  />
                                ))}
                                <span className="ml-1 text-xs text-gray-600">({workerDetails.rating})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 italic">
                          <FaInfoCircle className="mr-2 text-gray-400" />
                          No worker information available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {isProcessing ? (
                      <div className="bg-gray-200 px-3 py-1.5 rounded-md text-gray-600 flex items-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </div>
                    ) : (
                      request.status !== "approved" && (
                        <ActionButton 
                          onClick={() => handleUpdateRequestStatus(request._id, "approved")}
                          color="bg-green-600"
                          icon={<FaCheck size={12} />}
                          label="Approve"
                          disabled={request.status === "approved"}
                        />
                      )
                    )}
                    
                    {!isProcessing && request.status !== "rejected" && (
                      <ActionButton 
                        onClick={() => handleUpdateRequestStatus(request._id, "rejected")}
                        color="bg-red-600"
                        icon={<FaTimes size={12} />}
                        label="Reject"
                        disabled={request.status === "rejected"}
                      />
                    )}
                    
                    {!isProcessing && request.status === "approved" && request.status !== "completed" && (
                      <ActionButton 
                        onClick={() => handleUpdateRequestStatus(request._id, "completed")}
                        color="bg-blue-600"
                        icon={<FaCheckCircle size={12} />}
                        label="Mark Completed"
                        disabled={request.status === "completed"}
                      />
                    )}
                    
                    {!isProcessing && request.status !== "pending" && (
                      <ActionButton 
                        onClick={() => handleUpdateRequestStatus(request._id, "pending")}
                        color="bg-yellow-600"
                        icon={<FaClock size={12} />}
                        label="Reset to Pending"
                        disabled={request.status === "pending"}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShiftingRequestsAdmin;
