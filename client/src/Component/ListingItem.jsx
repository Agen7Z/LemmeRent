import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar } from 'react-icons/md';
import { FaBed, FaBath, FaRuler, FaParking, FaCouch, FaTag, FaCalendarAlt, FaLock, FaCheckCircle } from 'react-icons/fa';
import { format, isPast } from 'date-fns';

export default function ListingItem({ listing }) {
  // Check if the listing is available or booked
  const isBooked = listing.availability && listing.availability.isBooked;
  const isUserBooking = listing.userBooking && listing.userBooking.hasBooked;
  
  // Get thumbnail image URL
  const getThumbnailUrl = () => {
    if (!listing.imageURL || listing.imageURL.length === 0) {
      return 'https://via.placeholder.com/600x400?text=No+Image';
    }
    
    // Use the thumbnailIndex to get the correct image, default to the first one if not set
    const index = listing.thumbnailIndex !== undefined && listing.thumbnailIndex < listing.imageURL.length
      ? listing.thumbnailIndex 
      : 0;
      
    return listing.imageURL[index];
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  // Get booking status display information
  const getBookingStatusDisplay = () => {
    if (isUserBooking) {
      // User has booked this property
      return {
        badge: (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md z-10">
            <FaCheckCircle className="inline mr-1" /> You Booked
          </div>
        ),
        overlay: (
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 via-transparent to-transparent z-[5] flex items-end">
            <div className="w-full p-4 text-white">
              <p className="flex items-center font-medium">
                <FaCalendarAlt className="mr-2" />
                Your booking: {formatDate(listing.userBooking.bookingDate)}
              </p>
            </div>
          </div>
        )
      };
    } else if (isBooked) {
      // Property is booked by someone else
      return {
        badge: (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md z-10">
            <FaLock className="inline mr-1" /> Booked
          </div>
        ),
        overlay: (
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent z-[5] flex items-end">
            <div className="w-full p-4 text-white">
              <p className="flex items-center font-medium">
                <FaCalendarAlt className="mr-2" />
                Booked until: {formatDate(listing.availability.bookedUntil)}
              </p>
            </div>
          </div>
        )
      };
    }
    
    // Default (available)
    return {
      badge: null,
      overlay: null
    };
  };
  
  const bookingStatus = getBookingStatusDisplay();
  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      <Link to={`/listing/${listing._id}`} className="block h-full">
        {/* Image with gradient overlay - Now using the thumbnail image */}
        <div className="relative overflow-hidden">
          <div className="h-64 overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={listing.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isBooked && !isUserBooking ? 'opacity-80' : ''}`}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
          
          {/* Booking status overlay */}
          {bookingStatus.overlay}
          
          {/* Tags positioned on the image */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${
              listing.type === 'rent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            
            {listing.offer && (
              <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-red-500 text-white shadow-md">
                Discounted
              </span>
            )}
          </div>
          
          {/* Booking status badge */}
          {bookingStatus.badge}
          
          {/* Price tag */}
          <div className="absolute bottom-4 right-4">
            <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
              <p className="font-bold text-gray-800">
                ${listing.offer ? listing.discountPrice.toLocaleString() : listing.price.toLocaleString()}
                {listing.type === 'rent' && <span className="text-xs font-normal text-gray-500">/month</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">{listing.name}</h3>
          
          <p className="flex items-center text-gray-600 mb-3">
            <MdLocationOn className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{listing.address}</span>
          </p>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
          
          {/* Property features */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-gray-600 text-sm">
                <FaBed className="text-blue-500 mr-2" />
                <span>{listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <FaBath className="text-blue-500 mr-2" />
                <span>{listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
              </div>
              {listing.furnished && (
                <div className="flex items-center text-gray-600 text-sm">
                  <FaCouch className="text-blue-500 mr-2" />
                  <span>Furnished</span>
                </div>
              )}
              {listing.parking && (
                <div className="flex items-center text-gray-600 text-sm">
                  <FaParking className="text-blue-500 mr-2" />
                  <span>Parking</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}