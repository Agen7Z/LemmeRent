import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaHome, FaPhone, FaEnvelope, FaArrowLeft, FaPaperPlane, 
         FaCheckCircle, FaStar, FaRegStar, FaMapMarkerAlt, FaCalendar, 
         FaSpinner, FaInfoCircle } from 'react-icons/fa';

function ContactLandlord() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  
  const [landlord, setLandlord] = useState(null);
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageSent, setMessageSent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchListingAndLandlord = async () => {
      try {
        setLoading(true);
        
        // First fetch the listing to get userRef
        const listingRes = await fetch(`/api/listing/get/${listingId}`);
        const listingData = await listingRes.json();
        
        if (listingData.success === false) {
          setError(listingData.message || 'Failed to load listing.');
          setLoading(false);
          return;
        }
        
        setListing(listingData);
        
        // Then fetch the landlord using userRef
        const landlordRes = await fetch(`/api/user/${listingData.userRef}`);
        const landlordData = await landlordRes.json();
        
        if (landlordData.success === false) {
          setError(landlordData.message || 'Failed to load landlord information.');
          setLoading(false);
          return;
        }
        
        setLandlord(landlordData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data.');
        setLoading(false);
      }
    };

    fetchListingAndLandlord();
  }, [listingId]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleGoBack = () => {
    navigate(`/listing/${listingId}`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Simulate sending message
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      setMessageSent(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
        setMessage("");
      }, 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading landlord information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
              <FaInfoCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-red-800 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={handleGoBack} 
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <FaArrowLeft /> <span>Back to Listing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button 
            onClick={handleGoBack} 
            className="mr-4 bg-white text-blue-600 p-3 rounded-full hover:bg-blue-50 transition-colors shadow-md"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Contact the Landlord</h1>
        </div>

        {listing && landlord && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Listing Preview */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                <FaHome className="mr-3 text-blue-500" /> Property Details
              </h2>
              
              <div className="relative rounded-xl overflow-hidden mb-6 shadow-md">
                {listing.imageURL && listing.imageURL.length > 0 ? (
                  <img 
                    src={listing.imageURL[0]} 
                    alt={listing.name} 
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <FaHome className="text-gray-400 h-16 w-16" />
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4">
                  <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${
                    listing.type?.toLowerCase() === 'sale' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-blue-600 mb-2">{listing.name}</h3>
              
              <p className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
                {listing.address}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                {listing.offer && listing.discountPrice !== undefined ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-gray-500 line-through">
                        ${listing.price ? listing.price.toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-500">
                        -${(listing.price - listing.discountPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">Final Price:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${listing.discountPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${listing.price ? listing.price.toLocaleString() : '0'}
                      {listing.type === 'rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form and Landlord Info */}
            <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                  <FaUser className="mr-3 text-purple-500" /> Landlord Information
                </h2>
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-100">
                        <img 
                          src={landlord.photoURL || "https://via.placeholder.com/150"}
                          alt={landlord.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div>
                      <p className="text-xl font-semibold text-gray-800">{landlord.username}</p>
                      <div className="flex items-center text-yellow-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < 4 ? "text-yellow-500" : "text-gray-300"} />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">4.0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FaPhone className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">
                          {landlord.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FaEnvelope className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{landlord.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                <FaPaperPlane className="mr-3 text-green-500" /> Send a Message
              </h2>
              
              <form onSubmit={handleSendMessage}>
                <div className="space-y-6">
                  <textarea
                    name="message"
                    id="message"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Hi, I am interested in your property. Is it still available?"
                    className="w-full p-4 border bg-gray-50 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="5"
                    disabled={messageSent || sendingMessage}
                  ></textarea>
                  
                  {messageSent && (
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center animate-fadeIn">
                      <FaCheckCircle className="mr-2" />
                      Message sent successfully!
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <Link
                      to={`mailto:${landlord.email}?Subject=Regarding ${listing.name}&body=${message}`}
                      className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${(sendingMessage || messageSent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={(e) => {
                        if (sendingMessage || messageSent) e.preventDefault();
                      }}
                    >
                      <FaEnvelope />
                      <span>Send Email</span>
                    </Link>
                    
                    {landlord.phone && (
                      <a
                        href={`tel:${landlord.phone}`}
                        className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg transform hover:-translate-y-0.5 ${(sendingMessage || messageSent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (sendingMessage || messageSent) e.preventDefault();
                        }}
                      >
                        <FaPhone />
                        <span>Call Now</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Please mention the property reference when contacting the landlord.
                    </p>
                    <p className="mt-1 font-mono text-sm bg-gray-100 text-gray-700 py-1 px-2 rounded-md inline-block">
                      Property ID: {listingId.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
export default ContactLandlord;
