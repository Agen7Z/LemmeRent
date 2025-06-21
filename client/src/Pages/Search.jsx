import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../Component/ListingItem';
import { FaSearch, FaHome, FaCar, FaCouch, FaTag, FaSlidersH, FaFilter, FaSortAmountDown, FaSpinner } from 'react-icons/fa';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      setShowMore(data.length > 8);
      setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;
    setSidebardata((prev) => ({
      ...prev,
      [id]: id === 'searchTerm' ? value : id === 'sort_order' ? value.split('_') : checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    // Only add parameters that have values
    if (sidebardata.searchTerm) urlParams.set('searchTerm', sidebardata.searchTerm);
    if (sidebardata.type !== 'all') urlParams.set('type', sidebardata.type);
    if (sidebardata.parking) urlParams.set('parking', sidebardata.parking);
    if (sidebardata.furnished) urlParams.set('furnished', sidebardata.furnished);
    if (sidebardata.offer) urlParams.set('offer', sidebardata.offer);

    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', listings.length);
    const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
    const data = await res.json();
    setShowMore(data.length >= 9);
    setListings([...listings, ...data]);
  };

  const toggleFilter = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (sidebardata.type !== 'all') count++;
    if (sidebardata.parking) count++;
    if (sidebardata.furnished) count++;
    if (sidebardata.offer) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Find Your Perfect Home</h1>
            <p className="text-blue-100 mb-8">Browse through our collection of premium properties tailored to your needs</p>

            {/* Main Search Bar */}
            <form onSubmit={handleSubmit} className="relative w-full">
              <input
                type="text"
                id="searchTerm"
                placeholder="Search by property name, location, or features..."
                className="w-full py-4 pl-12 pr-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                value={sidebardata.searchTerm}
                onChange={handleChange}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <FaSlidersH className="text-blue-600 mr-2" />
                  <h2 className="font-bold text-gray-800">Filters</h2>
                </div>
                <div className="flex items-center">
                  {getActiveFiltersCount() > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-2">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  <button
                    onClick={toggleFilter}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {isFilterExpanded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['all', 'rent', 'sale'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            id={type}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              sidebardata.type === type
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setSidebardata({ ...sidebardata, type })}
                          >
                            {type === 'all' ? 'All' : type === 'rent' ? 'For Rent' : 'For Sale'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Amenities</label>

                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <FaCar className="text-blue-500 mr-3" />
                          <span className="text-gray-700">Parking</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="parking"
                            className="sr-only peer"
                            checked={sidebardata.parking}
                            onChange={(e) => setSidebardata({ ...sidebardata, parking: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <FaCouch className="text-blue-500 mr-3" />
                          <span className="text-gray-700">Furnished</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="furnished"
                            className="sr-only peer"
                            checked={sidebardata.furnished}
                            onChange={(e) => setSidebardata({ ...sidebardata, furnished: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <FaTag className="text-blue-500 mr-3" />
                          <span className="text-gray-700">Special Offer</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="offer"
                            className="sr-only peer"
                            checked={sidebardata.offer}
                            onChange={(e) => setSidebardata({ ...sidebardata, offer: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <FaFilter className="mr-2" />
                        Apply Filters
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSidebardata({
                            searchTerm: '',
                            type: 'all',
                            parking: false,
                            furnished: false,
                            offer: false,
                            sort: 'created_at',
                            order: 'desc',
                          });
                          navigate('/search');
                        }}
                        className="w-full mt-2 text-blue-600 py-2 font-medium hover:text-blue-800 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Listings */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Properties</h2>
                <p className="text-gray-600">
                  {loading ? 'Searching properties...' :
                   listings.length === 0 ? 'No properties found' :
                   `Showing ${listings.length} properties`}
                </p>
              </div>

              
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
                <p className="text-gray-600">Searching for properties...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaHome className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any properties matching your criteria. Try adjusting your filters or search term.
                </p>
                <button
                  onClick={() => {
                    setSidebardata({
                      searchTerm: '',
                      type: 'all',
                      parking: false,
                      furnished: false,
                      offer: false,
                      sort: 'created_at',
                      order: 'desc',
                    });
                    navigate('/search');
                  }}
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>
            )}

            {showMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={onShowMoreClick}
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md transform hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <FaSortAmountDown className="mr-2" />
                  Load More Properties
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}