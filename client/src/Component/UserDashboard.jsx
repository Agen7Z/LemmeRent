import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from '../redux/user/userSlice';
import UserBookings from './UserBookings';
import ShiftingBookings from './ShiftingBookings';
import PaymentHistory from './PaymentHistory';
import {
  FaUser, FaEnvelope, FaLock, FaCheck, FaTrash, FaSignOutAlt,
  FaCalendarAlt, FaTruck, FaTimes, FaSpinner, FaEdit, FaCreditCard
} from 'react-icons/fa';

function UserDashboard() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState('profile');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const dispatch = useDispatch();

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'my_unsigned_preset');

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/azrael21/image/upload`,
        formData
      );
      const newImageUrl = res.data.secure_url;
      setPhotoURL(newImageUrl);
      setUploadingImage(false);

      // Auto-save the new profile image
      handleSubmit(null, { photoURL: newImageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadingImage(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setFormSuccess(false);
  };

  const handleSubmit = async (e, additionalData = {}) => {
    if (e) e.preventDefault();

    try {
      dispatch(updateUserStart());
      const updatedData = { ...formData, ...additionalData };

      if (photoURL !== currentUser.photoURL) {
        updatedData.photoURL = photoURL;
      }

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateUserFailure(data.message || "Failed to update profile"));
        return;
      }
      dispatch(updateUserSuccess(data));
      setFormSuccess(true);
      setFormData({});

      setTimeout(() => {
        setFormSuccess(false);
      }, 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* User Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <FaUser className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">User Dashboard</h2>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-6">
            <img
              src={photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="ml-3">
              <h3 className="font-medium text-gray-800">{currentUser.username}</h3>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-2">
          <SidebarLink
            icon={<FaUser />}
            label="Profile"
            isActive={activeSection === 'profile'}
            onClick={() => setActiveSection('profile')}
          />

          {!currentUser.isAdmin && (
            <>
              <SidebarLink
                icon={<FaCalendarAlt />}
                label="My Bookings"
                isActive={activeSection === 'bookings'}
                onClick={() => setActiveSection('bookings')}
              />
              <SidebarLink
                icon={<FaTruck />}
                label="Shifting Bookings"
                isActive={activeSection === 'shifting-bookings'}
                onClick={() => setActiveSection('shifting-bookings')}
              />
              <SidebarLink
                icon={<FaCreditCard />}
                label="Payment History"
                isActive={activeSection === 'payment-history'}
                onClick={() => setActiveSection('payment-history')}
              />
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <SidebarLink
              icon={<FaSignOutAlt />}
              label="Sign Out"
              onClick={handleSignOut}
              className="text-red-600"
            />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === 'profile' && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUser className="mr-3 text-blue-600" />
              Profile Information
            </h2>

            <div className="flex flex-col sm:flex-row items-center mb-8">
              <div className="relative mb-4 sm:mb-0 sm:mr-8">
                <input
                  type="file"
                  ref={fileRef}
                  hidden
                  accept="image/*"
                  onChange={uploadImage}
                />
                <div className="relative">
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  <img
                    onClick={() => fileRef.current.click()}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                    src={photoURL || 'https://source.unsplash.com/random/800x800/?person'}
                    alt="Profile"
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-lg cursor-pointer" onClick={() => fileRef.current.click()}>
                    <FaEdit className="text-white w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-800">{currentUser.username || 'Your Name'}</h3>
                <p className="text-gray-600 flex items-center mt-1 justify-center sm:justify-start">
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  {currentUser.email}
                </p>
                {currentUser.isAdmin && (
                  <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Administrator
                  </span>
                )}
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    onChange={handleChange}
                    type="text"
                    id="username"
                    placeholder="Username"
                    defaultValue={currentUser.username}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    onChange={handleChange}
                    type="email"
                    id="email"
                    placeholder="Email"
                    defaultValue={currentUser.email}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Update Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    onChange={handleChange}
                    type="password"
                    id="password"
                    placeholder="Enter new password"
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaTimes className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Profile updated successfully!</p>
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Account Actions</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleDeleteUser}
                  className={`mb-3 sm:mb-0 flex items-center px-4 py-2 border ${
                    confirmDelete
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                  } rounded-lg transition-colors`}
                >
                  <FaTrash className="mr-2" />
                  {confirmDelete ? 'Confirm Delete Account' : 'Delete Account'}
                </button>

                {confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bookings' && !currentUser.isAdmin && (
          <div>
            <UserBookings />
          </div>
        )}

        {activeSection === 'shifting-bookings' && !currentUser.isAdmin && (
          <div>
            <ShiftingBookings />
          </div>
        )}

        {activeSection === 'payment-history' && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <FaCreditCard className="mr-3 text-blue-600" />
                Payment History
              </h2>
              <p className="text-gray-600">View and manage your payment records</p>
            </div>
            <PaymentHistory />
          </div>
        )}
      </main>
    </div>
  );
}

// Sidebar link component
const SidebarLink = ({ icon, label, isActive, onClick, className = "" }) => {
  const baseClasses = "flex items-center px-6 py-3 transition-colors";
  const activeClasses = "bg-blue-50 text-blue-600 border-l-4 border-blue-600";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  const computedClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`;

  return (
    <button onClick={onClick} className={computedClasses + " w-full text-left"}>
      <span className="w-5 h-5 mr-3">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default UserDashboard;

