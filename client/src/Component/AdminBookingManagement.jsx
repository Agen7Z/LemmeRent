import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaCalendarAlt, FaSearch, FaFilter, FaSortAmountDown, 
  FaUser, FaMapMarkerAlt, FaCalendarCheck, 
  FaEdit, FaExclamationCircle, FaCheck, FaTimes, FaClock,
  FaTrash, FaSpinner
} from "react-icons/fa";
import { format, parseISO } from 'date-fns';

const AdminBookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  const [filters, setFilters] = useState({
    dateRange: { startDate: "", endDate: "" },
    propertyId: "",
    userId: "",
    status: ""
  });
  
  const [sortCriteria, setSortCriteria] = useState("preferredDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { currentUser } = useSelector((state) => state.user);

  const [editForm, setEditForm] = useState({
    status: "",
    preferredDate: "",
    name: "",
    address: "",
    contact: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bookingsRes = await fetch("/api/booking/all", {
          headers: {
            "Authorization": `Bearer ${currentUser?.access_token}`
          }
        });
        
        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");
        const bookingsData = await bookingsRes.json();
        
        const propertiesRes = await fetch("/api/listing/all", {
          headers: {
            "Authorization": `Bearer ${currentUser?.access_token}`
          }
        });
        
        if (!propertiesRes.ok) throw new Error("Failed to fetch properties");
        const propertiesData = await propertiesRes.json();
        
        const usersRes = await fetch("/api/user/all", {
          headers: {
            "Authorization": `Bearer ${currentUser?.access_token}`
          }
        });
        
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData = await usersRes.json();
        
        const processedBookings = bookingsData.map(booking => {
          const property = propertiesData.find(p => p._id === (booking.listingId?._id || booking.listingId));
          const user = usersData.find(u => u._id === (booking.userId?._id || booking.userId));
          
          return {
            ...booking,
            property: property || null,
            user: user || null
          };
        });
        
        setBookings(processedBookings);
        setProperties(propertiesData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError(err.message || "An error occurred while fetching data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedBooking) {
      setEditForm({
        status: selectedBooking.status || "",
        preferredDate: selectedBooking.preferredDate ? new Date(selectedBooking.preferredDate).toISOString().split('T')[0] : "",
        name: selectedBooking.name || "",
        address: selectedBooking.address || "",
        contact: selectedBooking.contact || ""
      });
    }
  }, [selectedBooking]);

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        const bookingDate = new Date(booking.preferredDate);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (bookingDate < startDate || bookingDate > endDate) return false;
      }
      
      if (filters.propertyId && getBookingPropertyId(booking) !== filters.propertyId) return false;
      if (filters.userId && getBookingUserId(booking) !== filters.userId) return false;
      if (filters.status && booking.status !== filters.status) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const property = booking.property;
        const user = booking.user;
        
        const propertyMatch = property && property.name && property.name.toLowerCase().includes(query);
        const userMatch = user && user.username && user.username.toLowerCase().includes(query);
        const addressMatch = booking.address && booking.address.toLowerCase().includes(query);
        const nameMatch = booking.name && booking.name.toLowerCase().includes(query);
        const contactMatch = booking.contact && booking.contact.toLowerCase().includes(query);
        
        return propertyMatch || userMatch || addressMatch || nameMatch || contactMatch;
      }
      
      return true;
    });
  };
  
  const getSortedBookings = () => {
    const filteredBookings = getFilteredBookings();
    
    return filteredBookings.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortCriteria) {
        case "createdAt":
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case "preferredDate":
          valueA = new Date(a.preferredDate);
          valueB = new Date(b.preferredDate);
          break;
        default:
          valueA = a.preferredDate;
          valueB = b.preferredDate;
      }
      
      return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
  };
  
  const getBookingPropertyId = (booking) => {
    if (booking.listingId && typeof booking.listingId === 'object' && booking.listingId._id) {
      return booking.listingId._id;
    }
    return booking.listingId;
  };
  
  const getBookingUserId = (booking) => {
    if (booking.userId && typeof booking.userId === 'object' && booking.userId._id) {
      return booking.userId._id;
    }
    return booking.userId;
  };
  
  const getPropertyName = (booking) => {
    if (booking.property && booking.property.name) return booking.property.name;
    const property = properties.find(p => p._id === getBookingPropertyId(booking));
    return property ? property.name : "Property details unavailable";
  };
  
  const getUserName = (booking) => {
    if (booking.user && booking.user.username) return booking.user.username;
    const user = users.find(u => u._id === getBookingUserId(booking));
    return user ? user.username : "User details unavailable";
  };
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "PPP");
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  const resetFilters = () => {
    setFilters({
      dateRange: { startDate: "", endDate: "" },
      propertyId: "",
      userId: "",
      status: ""
    });
    setSearchQuery("");
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("dateRange.")) {
      const dateField = name.split(".")[1];
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateField]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSortChange = (criteria) => {
    if (sortCriteria === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortCriteria(criteria);
      setSortOrder("desc");
    }
  };
  
  const toggleExpandBooking = (bookingId) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };
  
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    setProcessingAction(true);
    try {
      const updateData = {};
      
      if (editForm.status !== selectedBooking.status) updateData.status = editForm.status;
      if (editForm.preferredDate !== new Date(selectedBooking.preferredDate).toISOString().split('T')[0]) {
        updateData.preferredDate = editForm.preferredDate;
      }
      if (editForm.name !== selectedBooking.name) updateData.name = editForm.name;
      if (editForm.address !== selectedBooking.address) updateData.address = editForm.address;
      if (editForm.contact !== selectedBooking.contact) updateData.contact = editForm.contact;
      
      if (Object.keys(updateData).length === 0) {
        setIsEditModalOpen(false);
        setProcessingAction(false);
        return;
      }
      
      const res = await fetch(`/api/booking/admin/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.access_token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update booking");
      }
      
      const data = await res.json();
      
      setBookings(prevBookings => prevBookings.map(booking => 
        booking._id === selectedBooking._id ? { ...booking, ...data.booking } : booking
      ));
      
      setSuccess("Booking updated successfully");
      setTimeout(() => setSuccess(null), 3000);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message || "An error occurred while updating the booking");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBooking) return;
    
    setProcessingAction(true);
    try {
      const res = await fetch(`/api/booking/admin/${selectedBooking._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser?.access_token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete booking");
      }
      
      setBookings(prevBookings => prevBookings.filter(booking => booking._id !== selectedBooking._id));
      setSuccess("Booking deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || "An error occurred while deleting the booking");
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <FaCheck className="mr-2 text-green-600" />;
      case 'rejected': return <FaTimes className="mr-2 text-red-600" />;
      default: return <FaClock className="mr-2 text-yellow-600" />;
    }
  };

  const closeError = () => setError(null);
  const closeSuccess = () => setSuccess(null);

  const sortedAndFilteredBookings = getSortedBookings();

  return (
    <div className="container mx-auto px-4 py-8">
      {success && (
        <div className="fixed top-5 right-5 z-50 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-lg animate-fade-in-out max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3 flex justify-between w-full items-center">
              <p className="text-sm text-green-700">{success}</p>
              <button onClick={closeSuccess} className="text-green-500 hover:text-green-700">
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-5 right-5 z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3 flex justify-between w-full items-center">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={closeError} className="text-red-500 hover:text-red-700">
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCalendarAlt className="mr-3 text-blue-600" />
              Booking Management
            </h1>
            <p className="mt-1 text-gray-600">
              View and manage all property bookings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-blue-800 text-sm font-medium">Total Bookings</span>
              <span className="text-blue-600 text-xl font-bold">{bookings.length}</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-yellow-800 text-sm font-medium">Pending</span>
              <span className="text-yellow-600 text-xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            </div>
            <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-green-800 text-sm font-medium">Approved</span>
              <span className="text-green-600 text-xl font-bold">
                {bookings.filter(b => b.status === 'approved').length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property, user or customer name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaFilter className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          <div className="relative">
            <select
              value={`${sortCriteria}_${sortOrder}`}
              onChange={(e) => {
                const [criteria, order] = e.target.value.split("_");
                setSortCriteria(criteria);
                setSortOrder(order);
              }}
              className="appearance-none pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="preferredDate_desc">Visit Date (Newest)</option>
              <option value="preferredDate_asc">Visit Date (Oldest)</option>
              <option value="createdAt_desc">Booking Date (Newest)</option>
              <option value="createdAt_asc">Booking Date (Oldest)</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSortAmountDown className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="dateRange.startDate"
                  value={filters.dateRange.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="dateRange.endDate"
                  value={filters.dateRange.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property
                </label>
                <select
                  name="propertyId"
                  value={filters.propertyId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Properties</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            {sortedAndFilteredBookings.length} {sortedAndFilteredBookings.length === 1 ? 'Booking' : 'Bookings'} Found
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 flex justify-center">
            <div className="flex flex-col items-center text-center">
              <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Bookings</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : sortedAndFilteredBookings.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="flex flex-col items-center text-center">
              <FaCalendarAlt className="text-gray-400 text-5xl mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || showFilters 
                  ? "Try adjusting your search criteria or filters" 
                  : "There are no bookings in the system yet"}
              </p>
              {(searchQuery || showFilters) && (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedAndFilteredBookings.map((booking) => {
              const isExpanded = expandedBookingId === booking._id;
              
              return (
                <div key={booking._id} className="transition-all duration-200 hover:bg-gray-50">
                  <div className="p-6 cursor-pointer" onClick={() => toggleExpandBooking(booking._id)}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {getPropertyName(booking)}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mb-3">
                          <FaMapMarkerAlt className="text-gray-400 mr-1" />
                          {booking.property?.address || booking.address || "Address not available"}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center">
                          <FaUser className="text-gray-400 mr-1" />
                          <span className="font-medium">{getUserName(booking)}</span>
                          <span className="ml-1">({booking.user?.email || "No email"})</span>
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <FaCalendarCheck className="text-green-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Visit Date</p>
                            <p className="font-medium">{getFormattedDate(booking.preferredDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          <FaCalendarAlt className="text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Booking Date</p>
                            <p className="font-medium">{getFormattedDate(booking.createdAt)}</p>
                          </div>
                        </div>
                        <div className={`mt-2 px-3 py-1 rounded-full inline-flex items-center text-sm ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusIcon(booking.status)}
                          <span className="font-medium">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex md:justify-end items-start space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBooking(booking);
                          }}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(booking);
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Booking Details</h4>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                            <DetailItem label="Property" value={getPropertyName(booking)} />
                            <DetailItem label="Contact Phone" value={booking.contact || "Not provided"} />
                            <DetailItem label="Customer Name" value={booking.name} />
                            <DetailItem label="Customer Address" value={booking.address} />
                            <DetailItem label="Booking Created" value={getFormattedDate(booking.createdAt)} />
                            <DetailItem label="Last Updated" value={getFormattedDate(booking.updatedAt)} />
                            <DetailItem label="Status" value={
                              <span className="flex items-center">
                                {getStatusIcon(booking.status)}
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            } />
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">User Information</h4>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                            <DetailItem label="Username" value={getUserName(booking)} />
                            <DetailItem label="Email" value={booking.user?.email || "Email not available"} />
                            <DetailItem label="User ID" value={getBookingUserId(booking)} />
                            
                            <div className="pt-4 border-t border-gray-100 mt-2">
                              <h5 className="font-medium text-gray-700 mb-2">Actions</h5>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditBooking(booking);
                                  }}
                                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
                                >
                                  <FaEdit className="mr-1" />
                                  Edit Booking
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBooking(booking);
                                  }}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                >
                                  <FaTrash className="mr-1" />
                                  Delete Booking
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaEdit className="mr-2 text-blue-600" />
                Edit Booking
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={editForm.preferredDate}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  name="contact"
                  value={editForm.contact}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isDeleteModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaTrash className="mr-2 text-red-600" />
                Confirm Deletion
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this booking?</p>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <p className="font-medium text-gray-800">Booking Details:</p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Property:</span> {getPropertyName(selectedBooking)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Customer:</span> {selectedBooking.name}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {getFormattedDate(selectedBooking.preferredDate)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {selectedBooking.status}
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-wrap items-start">
    <span className="text-gray-500 text-sm w-36">{label}:</span>
    <span className="text-gray-900 flex-1 font-medium text-sm">
      {typeof value === 'object' ? value : value}
    </span>
  </div>
);

export default AdminBookingManagement;