import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyMap from '../Component/Map/Map';
import { FaList, FaMapMarkerAlt, FaFilter, FaSlidersH, FaSearch, FaArrowLeft } from 'react-icons/fa';

export default function MapPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const searchTermFromUrl = queryParams.get('searchTerm') || '';

  // Set search term from URL on component mount
  useEffect(() => {
    setSearchTerm(searchTermFromUrl);
  }, [searchTermFromUrl]);

  // Fetch listings based on search parameters
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success === false) {
          setError(data.message || 'Failed to load properties.');
          setLoading(false);
          return;
        }
        setListings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching properties.');
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams(location.search);
    params.set('searchTerm', searchTerm);
    navigate(`/map?${params.toString()}`);
  };

  // Toggle between map and list view
  const handleViewToggle = () => {
    navigate(`/search${location.search}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-blue-600" />
              Property Map
            </h1>
            <p className="mt-2 text-gray-600">
              Explore properties visually on the map
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            
            <button
              onClick={handleViewToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaList className="mr-2" />
              List View
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="ml-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaSlidersH className="mr-2" />
              Filters
            </button>
            
            <button
              type="submit"
              className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
          
          {/* Expandable Filters Section */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter options would go here */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Types</option>
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Any Price</option>
                  <option>$0 - $1,000</option>
                  <option>$1,000 - $2,000</option>
                  <option>$2,000+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Any</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                  <option>4+</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            {/* Map Container */}
            <div className="mb-8">
              <PropertyMap
                listings={listings}
                height="70vh"
              />
            </div>
            
            {/* Property List Below Map */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property List ({listings.length})</h2>
              
              {listings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaMapMarkerAlt className="text-blue-500 h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className="h-40 bg-gray-200 relative">
                        {listing.imageURL && listing.imageURL[0] ? (
                          <img 
                            src={listing.imageURL[0]} 
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FaHome className="text-gray-400 h-16 w-16" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${
                            listing.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{listing.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <FaMapMarkerAlt className="mr-1 text-gray-400" /> {listing.address}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-xl text-blue-600">
                            ${(listing.offer ? listing.discountPrice : listing.price).toLocaleString()}
                            {listing.type === 'rent' && <span className="text-sm text-gray-500 font-normal">/mo</span>}
                          </p>
                          
                          <button 
                            onClick={() => navigate(`/listing/${listing._id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}