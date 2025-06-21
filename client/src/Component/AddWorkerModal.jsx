import React from "react";
import Modal from "./Modal";
import { FaUser, FaBriefcase, FaDollarSign, FaTags, FaClock, FaStar } from "react-icons/fa";

export default function AddWorkerModal({ isOpen, onClose, workerData, onInputChange, onSave }) {
  // Helper function to format rate input
  const formatRateInput = (value) => {
    // Remove non-numeric characters except decimal point
    let formattedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalParts = formattedValue.split('.');
    if (decimalParts.length > 2) {
      formattedValue = `${decimalParts[0]}.${decimalParts[1]}`;
    }
    
    // Prepend $ and add /hr
    return formattedValue ? `$${formattedValue}/hr` : '';
  };

  // Custom onChange handler for rate to format input
  const handleRateChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatRateInput(value);
    
    // Call the original onInputChange with formatted value
    onInputChange({
      target: {
        name,
        value: formattedValue
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-md w-full mx-auto flex flex-col" style={{ maxHeight: "90vh" }}>
        <div className="flex justify-between items-center mb-4 px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Worker</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSave} className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
            {/* Name Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  Full Name
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={workerData.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. Krisam Byanju"
              />
            </div>

            {/* Experience Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaBriefcase className="mr-2 text-blue-500" />
                  Experience
                </div>
              </label>
              <input
                type="text"
                name="experience"
                value={workerData.experience}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. 5 years, 2+ years, Beginner"
              />
            </div>
            
            {/* Rate Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaDollarSign className="mr-2 text-blue-500" />
                  Hourly Rate
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="rate"
                  value={workerData.rate}
                  onChange={handleRateChange}
                  required
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="25.00"
                />
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <span className="absolute right-3 top-2 text-gray-400">/hr</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter numbers only (e.g. 25 or 25.50)</p>
            </div>

            {/* Specialties Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaTags className="mr-2 text-blue-500" />
                  Specialties
                </div>
              </label>
              <input
                type="text"
                name="specialties"
                value={workerData.specialties}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. Plumbing, Electrical, Moving"
              />
              <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
            </div>

            {/* Availability Select Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  Availability
                </div>
              </label>
              <select
                name="availability"
                value={workerData.availability}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select availability</option>
                <option value="Immediate">Immediate</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="1 week+">1 week+</option>
              </select>
            </div>

            {/* Rating Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FaStar className="mr-2 text-blue-500" />
                  Initial Rating
                </div>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  name="rating"
                  min="0"
                  max="5"
                  step="1"
                  value={workerData.rating}
                  onChange={onInputChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-medium">
                  {workerData.rating}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex space-x-3 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Add Worker
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}