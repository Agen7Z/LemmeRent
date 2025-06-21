import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { 
  FaPencilAlt, FaTimes, FaUpload, FaBed, FaBath, FaHome, FaTag, FaMapMarkerAlt
} from "react-icons/fa";
import axios from 'axios';

export default function EditListingModal({ isOpen, onClose, selectedListing, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
    discountPrice: "",
    offer: false,
    parking: false,
    furnished: false,
  });
  
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  
  useEffect(() => {
    if (selectedListing) {
      setFormData({
        name: selectedListing.name || "",
        address: selectedListing.address || "",
        description: selectedListing.description || "",
        type: selectedListing.type || "",
        bedrooms: selectedListing.bedrooms || "",
        bathrooms: selectedListing.bathrooms || "",
        price: selectedListing.price || "",
        discountPrice: selectedListing.discountPrice || "",
        offer: selectedListing.offer || false,
        parking: selectedListing.parking || false,
        furnished: selectedListing.furnished || false,
      });
      
      setImageUrls(selectedListing.imageURL || []);
    }
  }, [selectedListing]);
  
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files.length > 0 && files.length + imageUrls.length <= 6) {
      setUploadingImages(true);
      setImageUploadError(null);
      
      try {
        const uploadPromises = Array.from(files).map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "my_unsigned_preset");
          return axios
            .post("https://api.cloudinary.com/v1_1/azrael21/image/upload", formData)
            .then((res) => res.data.secure_url);
        });
        
        const urls = await Promise.all(uploadPromises);
        setImageUrls((prev) => [...prev, ...urls]);
        setUploadingImages(false);
      } catch (error) {
        setImageUploadError("Error uploading images");
        setUploadingImages(false);
      }
    } else {
      setImageUploadError("You can upload up to 6 images total");
    }
  };
  
  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      setImageUploadError("At least one image is required");
      return;
    }
    
    if (+formData.price < +formData.discountPrice) {
      setImageUploadError("Discount price must be lower than regular price");
      return;
    }
    
    const updatedData = {
      ...formData,
      imageURL: imageUrls,
    };
    
    onSave(updatedData);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="max-w-3xl mx-auto overflow-y-auto max-h-[80vh] bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center py-3 px-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaPencilAlt className="mr-2 text-blue-600" />
            Edit Listing
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors duration-200"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-12 gap-3">
            {/* Row 1 */}
            <div className="col-span-6">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaHome className="mr-1 text-blue-500" size={12} />
                Property Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            <div className="col-span-3">
              <label htmlFor="bedrooms" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaBed className="mr-1 text-blue-500" size={12} />
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="1"
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            <div className="col-span-3">
              <label htmlFor="bathrooms" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaBath className="mr-1 text-blue-500" size={12} />
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            {/* Row 2 */}
            <div className="col-span-6">
              <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-blue-500" size={12} />
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            <div className="col-span-3">
              <label htmlFor="price" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaTag className="mr-1 text-blue-500" size={12} />
                Regular Price
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              />
            </div>
            
            <div className="col-span-3">
              <label htmlFor="discountPrice" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaTag className="mr-1 text-green-500" size={12} />
                Discount Price
              </label>
              <input
                type="number"
                id="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                className={`w-full p-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${!formData.offer ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`}
                required={formData.offer}
                disabled={!formData.offer}
              />
            </div>
            
            {/* Row 3 */}
            <div className="col-span-3">
              <label htmlFor="type" className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              >
                <option value="">Select</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            
            <div className="col-span-9">
              <label className="block text-xs font-medium text-gray-700 mb-1">Amenities</label>
              <div className="flex space-x-4 mt-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="offer"
                    checked={formData.offer}
                    onChange={handleChange}
                    className="h-3 w-3 text-blue-600 rounded focus:ring-blue-400"
                  />
                  <label htmlFor="offer" className="ml-1 text-xs text-gray-700">
                    Special Offer
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                    className="h-3 w-3 text-blue-600 rounded focus:ring-blue-400"
                  />
                  <label htmlFor="parking" className="ml-1 text-xs text-gray-700">
                    Parking
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={formData.furnished}
                    onChange={handleChange}
                    className="h-3 w-3 text-blue-600 rounded focus:ring-blue-400"
                  />
                  <label htmlFor="furnished" className="ml-1 text-xs text-gray-700">
                    Furnished
                  </label>
                </div>
              </div>
            </div>
            
            {/* Row 4 */}
            <div className="col-span-12">
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                required
              ></textarea>
            </div>
            
            {/* Images Section */}
            <div className="col-span-12">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-gray-700">Images (Max 6)</label>
                
                <div className="flex items-center">
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="images" className="cursor-pointer flex items-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded transition-colors duration-200">
                    <FaUpload className="mr-1 h-3 w-3" />
                    Upload Images
                  </label>
                </div>
              </div>
              
              {uploadingImages && (
                <p className="text-blue-500 text-xs mt-1">Uploading...</p>
              )}
              
              {imageUploadError && (
                <p className="text-red-500 text-xs mt-1">{imageUploadError}</p>
              )}
              
              {imageUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-6 gap-1">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group overflow-hidden rounded shadow-sm">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="h-12 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}