import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FaChartBar, FaUsers, FaHome, FaHardHat, FaTruck, 
  FaChevronLeft, FaChevronRight, FaSignOutAlt, 
  FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft,
  FaCalendar, FaMapMarkerAlt, FaPhone, FaStar, FaBell,
  FaSearch, FaFilter, FaCalendarAlt, FaFileInvoiceDollar
} from "react-icons/fa";

import ManageUsers from "../Component/ManageUsers";
import ManageListings from "../Component/ManageListings";
import ManageWorkers from "../Component/ManageWorkers";
import EditUserModal from "../Component/EditUserModal";
import EditListingModal from "../Component/EditListingModal";
import ViewListingModal from "../Component/ViewListingModal";
import AddWorkerModal from "../Component/AddWorkerModal";
import EditWorkerModal from "../Component/EditWorkerModal";
import AdminBookingManagement from "../Component/AdminBookingManagement";
import AdminPaymentHistory from "../Component/AdminPaymentHistory";
import ViewUserModal from "../Component/ViewUserModal";
import ShiftingRequestsAdmin from "../Component/ShiftingRequestsAdmin";



const DashboardCard = ({ title, value, icon, trend, color, delay }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-${color}-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 flex items-center ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.startsWith('+') ? 
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg> : 
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                }
                {trend}
              </p>
            )}
          </div>
          <div className={`bg-${color}-100 p-3 rounded-full transition-transform duration-300 hover:scale-110`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, subtitle, timestamp, status, statusColor }) => {
  return (
    <div className="flex items-start pb-4 border-b border-gray-100 hover:bg-gray-50 p-2 rounded transition-colors">
      <div className={`p-2 rounded-full mr-4 ${statusColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="font-medium">{title}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor} bg-opacity-15`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600">{subtitle}</p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, icon, actionButton }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center rounded-t-xl">
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {actionButton}
    </div>
  );
};

export default function AdminDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [shiftingRequests, setShiftingRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState({
    users: true,
    listings: true,
    workers: true,
    shiftingRequests: true
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [isViewListingModalOpen, setIsViewListingModalOpen] = useState(false);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isEditWorkerModalOpen, setIsEditWorkerModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workerData, setWorkerData] = useState({
    name: "",
    experience: "",
    rate: "",
    specialties: "",
    availability: "",
    rating: 0,
  });
  const [processingRequestIds, setProcessingRequestIds] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookingStats, setBookingStats] = useState(null);
  const navigate = useNavigate();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);


  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaChartBar /> },
    { id: "users", label: "Manage Users", icon: <FaUsers /> },
    { id: "listings", label: "Manage Listings", icon: <FaHome /> },
    { id: "bookings", label: "Booking Management", icon: <FaCalendarAlt /> },
    { id: "workers", label: "Manage Workers", icon: <FaHardHat /> },
    { id: "shifting-requests", label: "Shifting Requests", icon: <FaTruck /> },
    { id: "payments", label: "Payment History", icon: <FaFileInvoiceDollar /> },
  ];

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const res = await fetch("/api/user/all", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }
        setUsers(data);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Users Error:", error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(prev => ({ ...prev, listings: true }));
        const res = await fetch("/api/listing/all", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await res.json();
        setListings(data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(prev => ({ ...prev, listings: false }));
      }
    };
    fetchListings();
  }, [currentUser]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(prev => ({ ...prev, workers: true }));
        const res = await fetch("/api/worker/all", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch workers");
        }
        const data = await res.json();
        setWorkers(data.workers || []);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(prev => ({ ...prev, workers: false }));
      }
    };
    fetchWorkers();
  }, [currentUser]);

  useEffect(() => {
    const fetchShiftingRequests = async () => {
      try {
        setLoading(prev => ({ ...prev, shiftingRequests: true }));
        const res = await fetch("/api/shiftingRequest/all", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch shifting requests");
        }
        console.log("Fetched shifting requests:", data.shiftingRequests);
        setShiftingRequests(data.shiftingRequests);
        setFilteredRequests(data.shiftingRequests);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Shifting Requests Error:", error);
      } finally {
        setLoading(prev => ({ ...prev, shiftingRequests: false }));
      }
    };
    fetchShiftingRequests();
  }, [currentUser]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const bookingStatsRes = await fetch("/api/booking/stats", {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });
        
        if (!bookingStatsRes.ok) {
          throw new Error("Failed to fetch booking stats");
        }
        
        const bookingStatsData = await bookingStatsRes.json();
        setBookingStats(bookingStatsData.stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, [currentUser]);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      // Convert specialties string to array
      const specialtiesArray = workerData.specialties
        .split(',')
        .map(specialty => specialty.trim())
        .filter(specialty => specialty.length > 0);

      // Clean the rate field to extract numeric value
      const cleanRate = workerData.rate.replace(/[$\/hr]/g, '');

      const workerPayload = {
        ...workerData,
        specialties: specialtiesArray,
        rate: cleanRate, // Send just the numeric value
        rating: parseInt(workerData.rating) // Ensure rating is an integer
      };

      const res = await fetch("/api/worker/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
        body: JSON.stringify(workerPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add worker");
      }

      const data = await res.json();
      setWorkers((prevWorkers) => [...prevWorkers, data.worker]);
      setIsAddWorkerModalOpen(false);
      setWorkerData({
        name: "",
        experience: "",
        rate: "",
        specialties: "",
        availability: "",
        rating: 0,
      });
      showSuccess("Worker added successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleEditWorker = async (workerId, updatedData) => {
    try {
      // Convert specialties string to array if it's a string
      let processedData = { ...updatedData };
      
      if (typeof updatedData.specialties === 'string') {
        processedData.specialties = updatedData.specialties
          .split(',')
          .map(specialty => specialty.trim())
          .filter(specialty => specialty.length > 0);
      }

      // Clean the rate field to extract numeric value if it contains formatting
      if (typeof updatedData.rate === 'string' && updatedData.rate.includes('$')) {
        processedData.rate = updatedData.rate.replace(/[$\/hr]/g, '');
      }

      // Ensure rating is an integer
      if (updatedData.rating !== undefined) {
        processedData.rating = parseInt(updatedData.rating);
      }

      const res = await fetch(`/api/worker/update/${workerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update worker");
      }

      const data = await res.json();
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker._id === workerId ? data.worker : worker
        )
      );
      setIsEditWorkerModalOpen(false);
      showSuccess("Worker updated successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!confirm("Are you sure you want to delete this worker?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/worker/delete/${workerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete worker");
      }
      setWorkers((prevWorkers) =>
        prevWorkers.filter((worker) => worker._id !== workerId)
      );
      showSuccess("Worker deleted successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

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
      showSuccess(`Request status updated to ${status}`);
    } catch (error) {
      setError(error.message);
      console.error("Error updating shifting request status:", error);
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/delete-listing/${listingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser?.access_token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete listing");
      }
      
      setListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== listingId)
      );
      showSuccess("Listing deleted successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleEditUser = async (userId, updatedData) => {
    try {
      const res = await fetch(`/api/admin/edit-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      const data = await res.json();
      
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? data : user))
      );
  
      setIsEditUserModalOpen(false);
      showSuccess("User updated successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleEditListing = async (listingId, updatedData) => {
    try {
      const res = await fetch(`/api/admin/edit-listing/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error("Failed to update listing");
      }
      const data = await res.json();
      
      setListings((prevListings) =>
        prevListings.map((listing) => (listing._id === listingId ? data : listing))
      );
  
      setIsEditListingModalOpen(false);
      showSuccess("Listing updated successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
      showSuccess("User deleted successfully");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setWorkerData({ ...workerData, [e.target.name]: e.target.value });
  };

  const renderStatusButton = (request, status, colorClass, icon) => {
    if (request.statusUpdated || request.status === status || processingRequestIds.includes(request._id)) {
      if (request.status === status) {
        return (
          <button
            className={`${colorClass} text-white px-4 py-2 rounded-lg ring-2 ring-offset-2 cursor-default flex items-center transform transition-transform duration-200 hover:scale-105`}
          >
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        );
      }
      return null;
    }

    return (
      <button
        onClick={() => handleUpdateRequestStatus(request._id, status)}
        className={`${colorClass} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center transform hover:scale-105 hover:shadow-md`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    );
  };

  const isLoading = Object.values(loading).some(value => value);
  const pendingRequests = shiftingRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = shiftingRequests.filter(req => req.status === 'approved').length;
  const rejectedRequests = shiftingRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-indigo-800 to-purple-900 text-white transition-all duration-300 shadow-xl z-20 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-indigo-700/50">
          {sidebarOpen && (
            <h1 className="text-lg font-bold flex items-center ">
              <span className="bg-white text-indigo-800 p-1 rounded mr-2 text-xs">RP</span>
              Admin Dashboard
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-indigo-700/50 hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <div className="mt-6">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-700/70 border-l-4 border-white shadow-md"
                  : "hover:bg-indigo-700/30 border-l-4 border-transparent"
              }`}
            >
              <div className={`text-xl mr-3 transition-transform duration-200 ${activeTab === item.id ? "scale-110" : ""}`}>
                {item.icon}
              </div>
              {sidebarOpen && (
                <span className={`font-medium transition-all duration-200 ${activeTab === item.id ? "text-white" : "text-gray-300"}`}>
                  {item.label}
                </span>
              )}
              {!sidebarOpen && activeTab === item.id && (
                <div className="absolute left-16 bg-indigo-800 px-2 py-1 rounded text-xs whitespace-nowrap z-20 shadow-lg border border-indigo-700">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4  border-indigo-700/50">
          <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
            <div className="bg-white text-indigo-800 rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold shadow-md">
              {currentUser?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">{currentUser?.username || "Admin"}</p>
                <p className="text-xs text-indigo-200">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 bg-indigo-100 text-indigo-800 p-2 rounded-lg">
                {navItems.find((item) => item.id === activeTab)?.icon}
              </span>
              {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
            </h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <FaArrowLeft className="mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md animate-fadeIn">
              <div className="flex">
                <div className="py-1">
                  <svg
                    className="w-6 h-6 mr-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-700 hover:text-red-800"
                >
                  <FaTimesCircle />
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md animate-fadeIn fixed top-20 right-4 z-50 w-80">
              <div className="flex">
                <div className="py-1">
                  <FaCheckCircle className="w-6 h-6 mr-4" />
                </div>
                <div>
                  <p className="font-bold">Success</p>
                  <p>{successMessage}</p>
                </div>
                <button 
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-green-700 hover:text-green-800"
                >
                  <FaTimesCircle />
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="ml-3 text-lg text-gray-600">Loading data...</p>
            </div>
          )}

          {!isLoading && activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                  title="Total Users" 
                  value={users.length} 
                  icon={<FaUsers className="text-indigo-500 text-xl" />}
                  trend="+12% from last month"
                  color="indigo"
                  delay={100}
                />
                <DashboardCard 
                  title="Total Listings" 
                  value={listings.length} 
                  icon={<FaHome className="text-green-500 text-xl" />}
                  trend="+5% from last month"
                  color="green"
                  delay={200}
                />
                <DashboardCard 
                  title="Total Workers" 
                  value={workers.length} 
                  icon={<FaHardHat className="text-yellow-500 text-xl" />}
                  trend="+8% from last month"
                  color="yellow"
                  delay={300}
                />
                <DashboardCard 
                  title="Total Bookings" 
                  value={bookingStats?.totalBookings || 0} 
                  icon={<FaCalendarAlt className="text-purple-500 text-xl" />}
                  trend="+15% from last month"
                  color="purple"
                  delay={350}
                />
              </div>

              {bookingStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <FaCalendarAlt className="mr-2 text-purple-500" />
                        Recent Booking Activity
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center px-3 py-2 bg-yellow-50 rounded-lg">
                          <div className="font-bold text-yellow-700">{bookingStats.pendingBookings}</div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-green-50 rounded-lg">
                          <div className="font-bold text-green-700">{bookingStats.approvedBookings}</div>
                          <div className="text-xs text-green-600">Approved</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-red-50 rounded-lg">
                          <div className="font-bold text-red-700">{bookingStats.rejectedBookings}</div>
                          <div className="text-xs text-red-600">Rejected</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setActiveTab("bookings")}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                          <FaCalendarAlt className="mr-2" />
                          Manage Bookings
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-2">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <FaHome className="mr-2 text-blue-500" />
                        Top Booked Properties
                      </h3>
                    </div>
                    <div className="p-4">
                      {bookingStats.topProperties && bookingStats.topProperties.length > 0 ? (
                        <ul className="space-y-3">
                          {bookingStats.topProperties.map((item, index) => (
                            <li key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <div className="flex items-center">
                                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center mr-3">
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-800">
                                  {item.property?.name || "Unknown Property"}
                                </span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {item.count} bookings
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No booking data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <SectionHeader 
                    title="Pending Requests" 
                    icon={<FaSpinner className="text-yellow-500" />} 
                  />
                  <div className="p-6 flex items-center justify-between">
                    <div className="text-5xl font-bold text-yellow-500">{pendingRequests}</div>
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center">
                      <FaSpinner className="text-yellow-500 text-2xl" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-2 text-center text-sm text-yellow-700">
                    {pendingRequests > 0 ? "Requires your attention" : "No pending requests"}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <SectionHeader 
                    title="Approved Requests" 
                    icon={<FaCheckCircle className="text-green-500" />} 
                  />
                  <div className="p-6 flex items-center justify-between">
                    <div className="text-5xl font-bold text-green-500">{approvedRequests}</div>
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-500 text-2xl" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 text-center text-sm text-green-700">
                    Successfully processed
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <SectionHeader 
                    title="Rejected Requests" 
                    icon={<FaTimesCircle className="text-red-500" />} 
                  />
                  <div className="p-6 flex items-center justify-between">
                    <div className="text-5xl font-bold text-red-500">{rejectedRequests}</div>
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
                      <FaTimesCircle className="text-red-500 text-2xl" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-2 text-center text-sm text-red-700">
                    Not meeting requirements
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <SectionHeader 
                  title="Recent Activity" 
                  icon={<FaChartBar className="text-indigo-500 mr-2" />}
                  actionButton={
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      View all <FaArrowLeft className="ml-1 transform rotate-180" />
                    </button>
                  }
                />
                <div className="p-6">
                  <div className="space-y-4">
                    {shiftingRequests.slice(0, 5).map((request) => (
                      <ActivityItem 
                        key={request._id}
                        icon={
                          request.status === 'approved' ? 
                            <FaCheckCircle className="text-green-600 w-5 h-5" /> :
                            request.status === 'rejected' ? 
                            <FaTimesCircle className="text-red-600 w-5 h-5" /> :
                            <FaSpinner className="text-yellow-600 w-5 h-5" />
                        }
                        title={request.customerName}
                        subtitle={request.shiftingAddress}
                        timestamp={new Date(request.createdAt).toLocaleDateString()}
                        status={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        statusColor={
                          request.status === 'approved' ? 'text-green-600' :
                          request.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }
                      />
                    ))}
                    
                    {shiftingRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && activeTab === "users" && (
            <ManageUsers
              users={users}
              onEditUser={(user) => {
                setSelectedUser(user);
                setIsEditUserModalOpen(true);
              }}
              onDeleteUser={(userId) => handleDeleteUser(userId)}
            />
          )}

          {!isLoading && activeTab === "listings" && (
            <ManageListings
              listings={listings}
              onViewListing={(listing) => {
                setSelectedListing(listing);
                setIsViewListingModalOpen(true);
              }}
              onEditListing={(listing) => {
                setSelectedListing(listing);
                setIsEditListingModalOpen(true);
              }}
              onDeleteListing={(listingId) => handleDeleteListing(listingId)}
            />
          )}

          {activeTab === 'bookings' && (
            <AdminBookingManagement />
          )}

          {!isLoading && activeTab === "workers" && (
            <ManageWorkers
              workers={workers}
              onEditWorker={(worker) => {
                setSelectedWorker(worker);
                setIsEditWorkerModalOpen(true);
              }}
              onDeleteWorker={(workerId) => handleDeleteWorker(workerId)}
              onAddWorker={() => setIsAddWorkerModalOpen(true)}
            />
          )}

          {!isLoading && activeTab === "shifting-requests" && (
           <ShiftingRequestsAdmin />
          )}

          {/* This is where the AdminPaymentHistory component is properly rendered */}
          {!isLoading && activeTab === "payments" && (
            <AdminPaymentHistory />
          )}
        </main>
      </div>

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        selectedUser={selectedUser}
        onSave={(updatedData) => handleEditUser(selectedUser._id, updatedData)}
      />

      <EditListingModal
        isOpen={isEditListingModalOpen}
        onClose={() => setIsEditListingModalOpen(false)}
        selectedListing={selectedListing}
        onSave={(updatedData) => handleEditListing(selectedListing._id, updatedData)}
      />

      <ViewListingModal
        isOpen={isViewListingModalOpen}
        onClose={() => setIsViewListingModalOpen(false)}
        selectedListing={selectedListing}
      />

      <AddWorkerModal
        isOpen={isAddWorkerModalOpen}
        onClose={() => setIsAddWorkerModalOpen(false)}
        workerData={workerData}
        onInputChange={handleInputChange}
        onSave={handleAddWorker}
      />
      
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        userId={viewingUserId}
      />

      <EditWorkerModal
        isOpen={isEditWorkerModalOpen}
        onClose={() => setIsEditWorkerModalOpen(false)}
        selectedWorker={selectedWorker}
        onSave={(updatedData) => handleEditWorker(selectedWorker._id, updatedData)}
      />

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
}
