// components/ManageWorkers.jsx
import React from "react";
import { FaUserTie, FaPlus, FaPencilAlt, FaTrash, FaBriefcase, FaDollarSign, FaStar, FaToolbox } from "react-icons/fa";

export default function ManageWorkers({ workers, onEditWorker, onDeleteWorker, onAddWorker }) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header with stronger gradient */}
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaUserTie className="text-white mr-3 h-6 w-6" />
          Manage Workers
        </h2>
        <button
          onClick={onAddWorker}
          className="bg-white text-indigo-700 px-5 py-2 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg font-medium flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Worker
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FaToolbox className="text-indigo-500 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Workers Found</h3>
            <p className="text-gray-500 max-w-md mb-8">Add workers to your system to manage your human resources efficiently.</p>
            <button
              onClick={onAddWorker}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
            >
              <FaPlus className="inline-block mr-2" />
              Add Your First Worker
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-white border-2 border-gray-200 hover:border-indigo-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start">
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
                        <span className="text-white font-bold text-xl">{worker.name?.charAt(0) || "W"}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{worker.name || "Unnamed Worker"}</h3>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={`w-4 h-4 ${index < worker.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">({worker.rating}/5)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 sm:self-start">
                      <button
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                        onClick={() => onEditWorker(worker)}
                      >
                        <FaPencilAlt className="mr-2" />
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                        onClick={() => onDeleteWorker(worker._id)}
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaBriefcase className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-500 font-medium">Experience</span>
                      </div>
                      <p className="text-gray-800 font-semibold mt-1">{worker.experience}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-500 font-medium">Rate</span>
                      </div>
                      <p className="text-gray-800 font-semibold mt-1">{worker.rate}</p>
                    </div>
                  </div>

                  {worker.specialties && (
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <FaToolbox className="text-indigo-500 mr-2" />
                        <span className="text-sm text-gray-500 font-medium">Specialties</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(worker.specialties)
                          ? worker.specialties.map((specialty, index) => (
                              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                {specialty}
                              </span>
                            ))
                          : typeof worker.specialties === 'string' && worker.specialties.split(',').map((specialty, index) => (
                              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                {specialty.trim()}
                              </span>
                            ))
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      worker.availability === 'Immediate'
                        ? 'bg-green-500'
                        : worker.availability?.includes('days')
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">
                      Availability: <span className="font-medium">{worker.availability || 'Not specified'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}