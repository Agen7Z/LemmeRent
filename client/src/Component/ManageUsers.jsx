import React, { useState } from "react";
import { FaUser, FaEdit, FaTrash, FaUserSlash, FaSearch, FaEye } from "react-icons/fa";
import ViewUserModal from "./ViewUserModal";

export default function ManageUsers({ users, onEditUser, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewingUserId, setViewingUserId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter users based on search term and active filter
  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    
    const matchesSearch = 
      searchTerm === "" || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "admin") return user.isAdmin && matchesSearch;
    if (activeFilter === "regular") return !user.isAdmin && matchesSearch;
    
    return matchesSearch;
  });

  const handleViewUser = (userId) => {
    setViewingUserId(userId);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUserId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-3 text-indigo-600" />
          Manage Users
        </h2>
        <p className="text-gray-600 mt-1">Manage all user accounts in your system</p>
      </div>

      {/* Search and filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === "admin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveFilter("regular")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === "regular"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Regular Users
          </button>
        </div>
      </div>

      {/* User list */}
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <FaUserSlash className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-600 mb-2">No users found</p>
            <p className="text-gray-500 max-w-md">
              {searchTerm 
                ? `No users match your search for "${searchTerm}"`
                : "There are no users in this category"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            if (!user) return null;
            
            // Generate a random subtle background color based on username
            const colorIndex = user.username?.charCodeAt(0) % 5 || 0;
            const bgColors = [
              "bg-blue-100 text-blue-800",
              "bg-purple-100 text-purple-800",
              "bg-green-100 text-green-800",
              "bg-yellow-100 text-yellow-800",
              "bg-pink-100 text-pink-800",
            ];
            const avatarColor = bgColors[colorIndex];

            return (
              <div
                key={user._id}
                className="hover:bg-indigo-50 transition-colors duration-150"
              >
                <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <div className={`${avatarColor} rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4`}>
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-lg font-semibold text-gray-800">
                          {user.username || "Unnamed User"}
                        </p>
                        {user.isAdmin && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.email || "No email"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3 w-full sm:w-auto justify-end">
                    <button
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleViewUser(user._id)}
                    >
                      <FaEye className="mr-2" />
                      <span>View</span>
                    </button>
                    <button
                      className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => onEditUser(user)}
                    >
                      <FaEdit className="mr-2" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteUser(user._id)}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash className="mr-2" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.filter(Boolean).length} users
      </div>

      {/* View User Modal */}
      <ViewUserModal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseViewModal} 
        userId={viewingUserId} 
      />
    </div>
  );
}
