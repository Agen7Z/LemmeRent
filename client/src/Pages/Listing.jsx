import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Slider from 'react-slick';
import { 
  FaBed, FaBath, FaParking, FaCouch, FaStar, FaRegStar, 
  FaUser, FaComment, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle,
  FaArrowLeft, FaArrowRight, FaInfo, FaHeart, FaPencilAlt, FaMap,
  FaCalendarCheck, FaLock, FaClock, FaExclamationCircle, FaTruck
} from 'react-icons/fa';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from 'react-redux';
import ListingMap from '../Component/Map/ListingMap'; // Import the ListingMap component

function Listing() {
  const { currentUser } = useSelector((state) => state.user);
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMap, setShowMap] = useState(false); // State to toggle map visibility
  const [userBookings, setUserBookings] = useState([]);
  const [loadingUserBookings, setLoadingUserBookings] = useState(false);
  
  const mainSliderRef = useRef(null);

  const isBooked = searchParams.get('booked') === 'true';

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating(reviews);
  const isOwner = currentUser && listing?.userRef === currentUser._id;
  
  // Check if the property is booked
  const isPropertyBooked = listing?.availability && listing?.availability.isBooked;
  const isUserBooking = listing?.userBooking && listing?.userBooking.hasBooked;
  const nextAvailableDate = listing?.availability && listing?.availability.nextAvailableDate 
    ? format(new Date(listing.availability.nextAvailableDate), 'MMMM dd, yyyy')
    : null;

  // Format a date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(data.message || 'Failed to load listing.');
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const res = await fetch(`/api/reviews/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          console.error('Failed to load reviews');
          setReviewLoading(false);
          return;
        }
        setReviews(data);
        setReviewLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewLoading(false);
      }
    };

    fetchListing();
    fetchReviews();
  }, [listingId]);

  // Fetch user's bookings for this property
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingUserBookings(true);
        const res = await fetch(`/api/booking/user/${currentUser._id}`);
        const data = await res.json();
        
        if (data.success === false) {
          console.error('Failed to load user bookings');
          setLoadingUserBookings(false);
          return;
        }
        
        // Filter bookings for this specific property
        const propertyBookings = (data.bookings || data).filter(booking => 
          booking.listingId?._id === listingId || booking.listingId === listingId
        );
        
        setUserBookings(propertyBookings);
        setLoadingUserBookings(false);
      } catch (err) {
        console.error('Error fetching user bookings:', err);
        setLoadingUserBookings(false);
      }
    };

    fetchUserBookings();
  }, [currentUser, listingId]);

  const handleContactLandlord = () => {
    navigate(`/contact-landlord/${listingId}`);
  };

  const handleBookNow = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    // Check if user already has an approved booking for this property
    const hasApprovedBooking = userBookings.some(booking => booking.status === 'approved');
    
    if (hasApprovedBooking) {
      alert("You already have an approved booking for this property.");
      return;
    }
    
    navigate(`/book/${listing._id}`);
  };

  const handleBookHR = () => {
    navigate('/hr');
  };

  const handleRate = (newRating) => {
    setSelectedRating(newRating);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const submitReview = async () => {
    if (!currentUser) {
      alert('Please login to leave a review');
      return;
    }

    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          userId: currentUser._id,
          username: currentUser.username,
          rating: selectedRating,
          comment,
          createdAt: new Date(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews([...reviews, {
          _id: data.reviewId,
          userId: currentUser._id,
          username: currentUser.username,
          rating: selectedRating,
          comment,
          createdAt: new Date(),
        }]);
        setComment('');
        setSelectedRating(0);
        alert('Review submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review');
    }
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Check if the user has an active booking
  const getUserBookingStatus = () => {
    if (!userBookings || userBookings.length === 0) return null;
    
    // Get the most recent approved booking
    const approvedBooking = userBookings
      .filter(booking => booking.status === 'approved')
      .sort((a, b) => new Date(b.preferredDate) - new Date(a.preferredDate))[0];
      
    if (approvedBooking) {
      return {
        status: 'approved',
        date: approvedBooking.preferredDate,
        bookingId: approvedBooking._id
      };
    }
    
    // Get the most recent pending booking
    const pendingBooking = userBookings
      .filter(booking => booking.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
    if (pendingBooking) {
      return {
        status: 'pending',
        date: pendingBooking.preferredDate,
        bookingId: pendingBooking._id
      };
    }
    
    return null;
  };

  // Get the booking status display
  const getBookingStatusDisplay = () => {
    const userBookingStatus = getUserBookingStatus();
    
    if (userBookingStatus && userBookingStatus.status === 'approved') {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start mb-6">
          <FaCheckCircle className="text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-semibold">You've booked this property!</p>
            <p className="text-green-700 mt-1">Your visit is scheduled for {formatDate(userBookingStatus.date)}</p>
            <div className="mt-3">
              <button
                onClick={handleBookHR}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaTruck className="mr-2" />
                Book HR Services for Moving
              </button>
            </div>
          </div>
        </div>
      );
    } else if (userBookingStatus && userBookingStatus.status === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start mb-6">
          <FaClock className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-semibold">Your booking is pending approval</p>
            <p className="text-yellow-700 mt-1">Requested visit date: {formatDate(userBookingStatus.date)}</p>
            <p className="text-yellow-700 mt-1">The property owner will review your booking request soon.</p>
          </div>
        </div>
      );
    } else if (isPropertyBooked && !isUserBooking) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start mb-6">
          <FaLock className="text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-semibold">This property is currently booked</p>
            {nextAvailableDate && (
              <p className="text-red-700 mt-1">Next available after: {nextAvailableDate}</p>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-20">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded max-w-md w-full mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <FaInfo className="text-gray-400 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/search')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    arrows: true,
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 5000,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    nextArrow: <SliderArrow direction="next" />,
    prevArrow: <SliderArrow direction="prev" />,
  };

  const handleThumbnailClick = (index) => {
    setCurrentSlide(index);
    mainSliderRef.current.slickGoTo(index);
  };

  // Check if user can book this property
  const canUserBookProperty = () => {
    if (!currentUser) return true; // Will redirect to login
    if (isOwner) return false; // Owner can't book their own property
    
    // User already has an approved booking
    const userBookingStatus = getUserBookingStatus();
    if (userBookingStatus && userBookingStatus.status === 'approved') return false;
    
    // Property is booked by someone else
    if (isPropertyBooked && !isUserBooking) return false;
    
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-20">
      {/* Hero Section with Image Slider */}
      <div className="relative bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-colors duration-300 shadow-md"
          >
            <FaArrowLeft className="text-blue-600" />
          </button>
          
          {/* Main image slider */}
          <div className="rounded-xl overflow-hidden shadow-sm">
            <Slider ref={mainSliderRef} {...sliderSettings}>
              {listing.imageURL.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`${listing.name} - image ${index + 1}`} 
                    className="w-full h-80 object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* Thumbnails */}
          <div className="mt-3">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {listing.imageURL.map((url, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => handleThumbnailClick(index)}
                    className={`h-16 w-24 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                      currentSlide === index ? 'border-blue-500 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{listing.name}</h1>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full 
                      ${listing.type === 'rent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-blue-500 text-sm" />
                    <p className="text-sm">{listing.address}</p>
                  </div>
                  
                  <div className="flex items-center mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= averageRating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{averageRating} ({reviews.length} reviews)</span>
                  </div>
                </div>
                
                <div className="flex mt-4 md:mt-0">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full ${
                      isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 transition-colors`}
                    aria-label="Add to favorites"
                  >
                    <FaHeart className={isFavorite ? 'text-red-600' : 'text-gray-400'} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Booking Status Banner */}
            {getBookingStatusDisplay()}
            
            {/* Key Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FeatureCard icon={<FaBed />} value={listing.bedrooms} label="Bedrooms" color="blue" />
              <FeatureCard icon={<FaBath />} value={listing.bathrooms} label="Bathrooms" color="green" />
              <FeatureCard icon={<FaParking />} value={listing.parking ? 'Yes' : 'No'} label="Parking" color="purple" />
              <FeatureCard icon={<FaCouch />} value={listing.furnished ? 'Yes' : 'No'} label="Furnished" color="indigo" />
            </div>
            
            {/* Property Description and Details in the same section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Description - takes 3 columns */}
                <div className="md:col-span-3">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                  <div className="relative">
                    <p className={`text-gray-700 leading-relaxed ${!showFullDescription && 'line-clamp-4'}`}>
                      {listing.description}
                    </p>
                    {listing.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showFullDescription ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Details - takes 2 columns */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
                  <ul className="space-y-3">
                    <PropertyDetail label="Type" value={listing.type === 'rent' ? 'For Rent' : 'For Sale'} />
                    <PropertyDetail label="Price" value={`$${listing.offer ? listing.discountPrice.toLocaleString() : listing.price.toLocaleString()}`} />
                    <PropertyDetail label="Bedrooms" value={listing.bedrooms} />
                    <PropertyDetail label="Bathrooms" value={listing.bathrooms} />
                    <PropertyDetail label="Furnished" value={listing.furnished ? 'Yes' : 'No'} />
                    <PropertyDetail label="Parking" value={listing.parking ? 'Yes' : 'No'} />
                    {listing.offer && (
                      <PropertyDetail 
                        label="Discount" 
                        value={`$${(listing.price - listing.discountPrice).toLocaleString()}`} 
                        highlight={true} 
                      />
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Location Map Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Location</h2>
                <button
                  onClick={toggleMap}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaMap className="mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
              
              {showMap && (
                <div className="mt-4">
                  <ListingMap listing={listing} height="400px" />
                </div>
              )}
              
              {!showMap && (
                <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center min-h-[150px]">
                  <button
                    onClick={toggleMap}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaMap className="mr-2" />
                    Click to View Property on Map
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-gray-600">
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  {listing.address}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Price & Booking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-4">
                {listing.offer ? (
                  <>
                    <div className="mb-2">
                      <span className="text-sm text-gray-500 line-through">
                        ${listing.price.toLocaleString()}
                      </span>
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Save ${(listing.price - listing.discountPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        ${listing.discountPrice.toLocaleString()}
                      </h2>
                      {listing.type === 'rent' && (
                        <span className="ml-2 text-gray-600 text-sm">/month</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      ${listing.price.toLocaleString()}
                    </h2>
                    {listing.type === 'rent' && (
                      <span className="ml-2 text-gray-600 text-sm">/month</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Booking Actions */}
              <div className="space-y-4 mt-6">
                {!isOwner && canUserBookProperty() && (
                  <button
                    onClick={handleBookNow}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
                  >
                    <FaCalendarAlt className="mr-2" />
                    {listing.type === 'rent' ? 'Book Viewing' : 'Request Purchase'}
                  </button>
                )}
                
                {isPropertyBooked && !isUserBooking && !isOwner && (
                  <div className="text-center text-sm text-red-500 mt-2">
                    <FaExclamationCircle className="inline mr-1" />
                    This property is booked until {nextAvailableDate}
                  </div>
                )}
                
                {!isOwner && (
                  <button
                    onClick={handleContactLandlord}
                    className="w-full py-3 px-4 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    <FaUser className="inline mr-2" />
                    Contact Landlord
                  </button>
                )}
                
                {/* Only show the HR services button if the user has an approved booking */}
                {getUserBookingStatus()?.status === 'approved' && (
                  <button
                    onClick={handleBookHR}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md flex items-center justify-center"
                  >
                    <FaTruck className="mr-2" />
                    Book Moving Services
                  </button>
                )}
                
                {isOwner && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start text-sm">
                    <FaInfo className="text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-orange-800">This is your property</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Reviews & Ratings</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {reviews.length} Reviews
            </span>
          </div>
          
          {reviewLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-9 w-9 flex items-center justify-center rounded-full text-white font-bold text-sm">
                      {review.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-800 text-sm">{review.username}</p>
                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <FaComment className="mx-auto text-3xl text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this property!</p>
            </div>
          )}
          
          
          {/* Add Review Form */}
          {currentUser && !isOwner && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-sm">
                <FaPencilAlt className="mr-2 text-blue-500" />
                Write a Review
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                      key={star}
                      type="button"
                      onClick={() => handleRate(star)}
                      className="text-xl focus:outline-none mr-1"
                    >
                      {star <= selectedRating ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaRegStar className="text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={handleCommentChange}
                  rows="3"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Share your experience with this property..."
                ></textarea>
              </div>
              <button
                onClick={submitReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}

// Feature Card Component
const FeatureCard = ({ icon, value, label, color }) => {
const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

return (
  <div className="bg-white rounded-lg shadow-xs p-3 flex flex-col items-center text-center border border-gray-100 hover:border-blue-200 transition-colors">
    <div className={`p-2 rounded-full mb-2 ${colorClasses[color]}`}>
      {icon}
    </div>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);
};

// Property Detail Component
const PropertyDetail = ({ label, value, highlight = false }) => {
return (
  <li className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className={highlight ? "font-medium text-green-600 text-sm" : "font-medium text-gray-800 text-sm"}>
      {value}
    </span>
  </li>
);
};

// Custom slider arrow component
const SliderArrow = ({ direction, className, onClick }) => {
return (
  <button
    onClick={onClick}
    className={`absolute z-10 top-1/2 transform -translate-y-1/2 ${
      direction === 'next' ? 'right-2' : 'left-2'
    } bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:bg-white ${className}`}
  >
    {direction === 'next' ? 
      <FaArrowRight className="text-blue-600 text-sm" /> : 
      <FaArrowLeft className="text-blue-600 text-sm" />}
  </button>
);
};

export default Listing;