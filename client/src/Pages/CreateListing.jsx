import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHome, FaPencilAlt, FaMapMarkerAlt, FaTag, FaBed, 
  FaBath, FaParking, FaCouch, FaDollarSign, FaCheck,
  FaUpload, FaSpinner, FaTimes, FaArrowLeft, FaImages,
  FaStar // Added for thumbnail selection
} from 'react-icons/fa';

function CreateListing() {
  const navigate = useNavigate();

  // Updated initial state with thumbnailIndex
  const [listingData, setListingData] = useState({
    name: '',
    description: '',
    address: '',
    type: '',
    bathrooms: '1',
    bedrooms: '1',
    price: '0',
    discountPrice: '0',
    offer: false,
    parking: false,
    furnished: false,
    imageURL: [],
    thumbnailIndex: 0, // Default to first image
  });

  // State for image URLs returned from Cloudinary
  const [imageUrls, setImageUrls] = useState([]);
  // State for file selection
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(0); // Track which image is selected as thumbnail
  
  const { currentUser } = useSelector((state) => state.user);

  // Simplified change handler using event destructuring
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setListingData((prevData) => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload images to Cloudinary when files are selected
  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
    const filesArray = Array.from(selectedFiles);
    
    if (filesArray.length > 0 && filesArray.length + imageUrls.length <= 6) {
      setImageUploadError(null);
      setUploadingImages(true);
      
      try {
        const uploadPromises = filesArray.map((file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'my_unsigned_preset');
          return axios
            .post(`https://api.cloudinary.com/v1_1/azrael21/image/upload`, formData)
            .then((res) => res.data.secure_url);
        });

        const urls = await Promise.all(uploadPromises);
        setImageUrls((prevUrls) => [...prevUrls, ...urls]);
        setUploadingImages(false);
      } catch (error) {
        setImageUploadError('Error uploading images. Please try again.');
        setUploadingImages(false);
      }
    } else {
      setImageUploadError('You can upload a maximum of 6 images per listing');
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    
    // If we're removing the current thumbnail, reset to the first image
    if (index === selectedThumbnail) {
      setSelectedThumbnail(0);
    } 
    // If we're removing an image before the thumbnail, adjust the index
    else if (index < selectedThumbnail) {
      setSelectedThumbnail(selectedThumbnail - 1);
    }
  };

  // Handle thumbnail selection
  const handleSelectThumbnail = (index) => {
    setSelectedThumbnail(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (imageUrls.length === 0) {
        setError('Please upload at least one image');
        return;
      }
      
      if (+listingData.price < +listingData.discountPrice) {
        setError('Discount price must be lower than regular price');
        return;
      }
      
      setLoading(true);
      setError(false);

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...listingData,
          imageURL: imageUrls,
          thumbnailIndex: selectedThumbnail, // Include the selected thumbnail index
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      setLoading(false);
      
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/listing/${data._id}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="relative px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${Math.random() * 20 + 5}px`,
                    height: `${Math.random() * 20 + 5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.1
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <button
                onClick={() => navigate(-1)}
                className="mb-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button>
              
              <div className="flex items-center">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                  <FaHome className="text-white h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Create New Listing</h1>
                  <p className="text-blue-100">Add your property details to get started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start">
            <FaTimes className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaPencilAlt className="mr-2 text-blue-500" />
                  Property Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Cozy Downtown Apartment"
                  value={listingData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaPencilAlt className="mr-2 text-blue-500" />
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows="6"
                  value={listingData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="123 Main St, City, Country"
                  value={listingData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Middle Column: Property Features */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaTag className="mr-2 text-blue-500" />
                  Property Type
                </label>
                <select
                  id="type"
                  value={listingData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select type</option>
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaBed className="mr-2 text-blue-500" />
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    min="1"
                    value={listingData.bedrooms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaBath className="mr-2 text-blue-500" />
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    min="1"
                    value={listingData.bathrooms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="parking"
                    checked={listingData.parking}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="parking" className="ml-3 flex items-center text-gray-700">
                    <FaParking className="mr-2 text-blue-500" />
                    Parking Available
                  </label>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={listingData.furnished}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="furnished" className="ml-3 flex items-center text-gray-700">
                    <FaCouch className="mr-2 text-blue-500" />
                    Furnished
                  </label>
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="offer"
                    checked={listingData.offer}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="offer" className="ml-3 flex items-center text-gray-700">
                    <FaTag className="mr-2 text-blue-500" />
                    Special Offer
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing and Images */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaDollarSign className="mr-2 text-blue-500" />
                    Regular Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      placeholder="Price"
                      min="0"
                      value={listingData.price}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                {listingData.offer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaTag className="mr-2 text-green-500" />
                      Discounted Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="discountPrice"
                        placeholder="Discounted Price"
                        min="0"
                        value={listingData.discountPrice}
                        onChange={handleChange}
                        required={listingData.offer}
                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaImages className="mr-2 text-blue-500" />
                  Images (Max 6)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    <FaUpload className="mx-auto text-gray-400 mb-2 h-10 w-10" />
                    <p className="text-gray-500">
                      Click to upload property images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: JPG, PNG, WEBP
                    </p>
                  </label>
                </div>
                
                {uploadingImages && (
                  <div className="mt-2 flex items-center justify-center text-blue-500">
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Uploading images...</span>
                  </div>
                )}
                
                {imageUploadError && (
                  <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>
                )}
                
                {/* Thumbnail selection section */}
                {imageUrls.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaStar className="mr-2 text-yellow-500" />
                      Select Thumbnail Image:
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className={`relative group cursor-pointer transition-all duration-200 transform ${
                            selectedThumbnail === index 
                              ? 'ring-2 ring-yellow-500 scale-105 shadow-lg' 
                              : 'hover:ring-2 hover:ring-blue-300 hover:scale-105'
                          } rounded-lg overflow-hidden`}
                          onClick={() => handleSelectThumbnail(index)}
                        >
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          
                          {/* Thumbnail indicator */}
                          {selectedThumbnail === index && (
                            <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/20 flex items-center justify-center">
                              <div className="bg-yellow-500 text-white p-1 rounded-full">
                                <FaStar className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                          
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Thumbnail selection helper text */}
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedThumbnail !== null 
                        ? `Image #${selectedThumbnail + 1} selected as thumbnail` 
                        : 'Click on an image to select it as the thumbnail'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-gray-200 pt-6 flex justify-center">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className={`px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2 
                ${(loading || uploadingImages) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg transform hover:-translate-y-0.5 transition-all'}`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  <span>Create Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateListing;