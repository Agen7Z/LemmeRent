// components/ManageListings.jsx
import React from "react";
import { FaHome, FaEye, FaEdit, FaTrash, FaMapMarkerAlt, FaBed, FaBath, FaDollarSign, FaThList } from "react-icons/fa";

export default function ManageListings({ listings, onViewListing, onEditListing, onDeleteListing }) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header with pattern background */}
      <div className="relative px-8 py-8 bg-gradient-to-r from-blue-700 to-indigo-800 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 20 + 5}px`,
                  height: `${Math.random() * 20 + 5}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
              <FaHome className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Property Listings</h2>
              <p className="text-blue-200 mt-1">Manage your real estate portfolio</p>
            </div>
          </div>

          <div className="flex mt-6 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
              <span className="text-white font-medium">{listings.length}</span>
              <span className="text-blue-200 ml-1">Total Properties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FaThList className="text-indigo-600 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-500 max-w-md mb-4">
              Add your first property to start building your real estate portfolio.
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Add Property
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => {
              if (!listing) return null; // Skip undefined listings

              return (
                <div
                  key={listing._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Image Section */}
                    <div className="md:col-span-1 relative">
                      <div className="h-full min-h-[140px] bg-gray-200 overflow-hidden">
                        {listing.imageURL && listing.imageURL.length > 0 ? (
                          <img
                            src={listing.imageURL[0]}
                            alt={listing.name || "Property"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                            <FaHome className="w-12 h-12 text-blue-300" />
                          </div>
                        )}

                        {/* Property type badge */}
                        {listing.type && (
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              listing.type === 'rent'
                                ? 'bg-blue-600 text-white'
                                : 'bg-green-600 text-white'
                            }`}>
                              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 md:col-span-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {listing.name || "Unnamed Property"}
                      </h3>

                      <p className="flex items-center text-gray-600 mt-2">
                        <FaMapMarkerAlt className="text-blue-500 mr-2 flex-shrink-0" />
                        {listing.address || "Address unavailable"}
                      </p>

                      {/* Property details */}
                      <div className="mt-4 flex flex-wrap gap-4">
                        {listing.bedrooms && (
                          <div className="flex items-center">
                            <FaBed className="text-gray-500 mr-2" />
                            <span className="text-gray-700">
                              <span className="font-medium">{listing.bedrooms}</span> {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                            </span>
                          </div>
                        )}

                        {listing.bathrooms && (
                          <div className="flex items-center">
                            <FaBath className="text-gray-500 mr-2" />
                            <span className="text-gray-700">
                              <span className="font-medium">{listing.bathrooms}</span> {listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description preview if available */}
                      {listing.description && (
                        <p className="mt-3 text-gray-600 line-clamp-2 text-sm">
                          {listing.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="p-5 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50 md:flex md:flex-col md:justify-between">
                      {/* Price */}
                      {listing.price && (
                        <div className="mb-4">
                          <span className="text-gray-500 text-sm">Price</span>
                          <div className="flex items-center">
                            <FaDollarSign className="text-green-600" />
                            <span className="text-xl font-bold text-gray-900">
                              {listing.price.toLocaleString()}
                            </span>
                          </div>
                          {listing.discountPrice && listing.discountPrice < listing.price && (
                            <span className="text-sm text-red-600 font-medium">
                              Discount: ${(listing.price - listing.discountPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                          onClick={() => onViewListing(listing)}
                        >
                          <FaEye className="mr-2" />
                          View
                        </button>
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
                          onClick={() => onEditListing(listing)}
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                          onClick={() => onDeleteListing(listing._id)}
                        >
                          <FaTrash className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}