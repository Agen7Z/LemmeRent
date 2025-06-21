import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, 
  FaCheckCircle, FaStar, FaBriefcase, FaTools, FaClock, FaDollarSign, 
  FaSortAmountDown, FaExclamationTriangle, FaSpinner
} from "react-icons/fa";

const HrPage = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerPhone: "",
    shiftingDate: "",
    shiftingAddress: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Fetch workers from the database
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/worker/all");
        if (!res.ok) {
          throw new Error("Failed to fetch workers");
        }
        const data = await res.json();
        
        // Ensure rate is a number and has a default
        const processedWorkers = data.workers.map(worker => ({
          ...worker,
          rate: parseFloat(worker.rate) || 0,
          rateDisplay: worker.rate ? `NPR ${parseFloat(worker.rate).toLocaleString()}` : 'Rate not specified'
        }));
        
        setWorkers(processedWorkers);
      } catch (error) {
        console.error("Error fetching workers:", error);
        setError("Could not load workers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();

    // Pre-fill customer name if user is logged in
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        customerName: currentUser.username || ""
      }));
    }
  }, [currentUser]);

  const handleHireNow = (worker) => {
    setSelectedWorker({
      ...worker,
      rate: parseFloat(worker.rate) || 0
    });
    setBookingStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!bookingData.customerName || !bookingData.customerPhone || 
          !bookingData.shiftingDate || !bookingData.shiftingAddress) {
        throw new Error("All fields are required");
      }

      // Make sure we have the worker and user IDs
      if (!selectedWorker?._id || !currentUser?._id) {
        throw new Error("Worker or user information is missing");
      }

      const requestBody = {
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        shiftingDate: bookingData.shiftingDate,
        shiftingAddress: bookingData.shiftingAddress,
        workerId: selectedWorker._id,
        userId: currentUser._id
      };

      console.log("Submitting shifting request:", requestBody);

      const res = await fetch("/api/shiftingRequest/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit shifting request");
      }

      const data = await res.json();
      console.log("Shifting request created:", data);
      
      // Navigate to the status page with the request ID
      navigate(`/hr-status/${data.shiftingRequest._id}`, {
        state: {
          worker: selectedWorker,
          bookingData: bookingData
        }
      });
    } catch (error) {
      console.error("Error submitting shifting request:", error);
      setError(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleBackToWorkers = () => {
    setSelectedWorker(null);
    setBookingStep(0);
    setError(null);
  };

  const formatRate = (rate) => {
    if (!rate) return "Rate not available";
    
    const numericRate = parseFloat(rate);
    return isNaN(numericRate) ? rate : `NPR ${numericRate.toLocaleString()}`;
  };

  // Rating stars component
  const RatingStars = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FaStar 
            key={index}
            className={index < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}
            size={14}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 pt-20 pb-10 px-6 text-white shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Human Resource Services</h1>
              <p className="text-blue-100 max-w-xl">
                Professional shifting and moving services to meet your needs
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Display global error message if present */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 0: Worker Selection */}
        {bookingStep === 0 && (
          <div className="space-y-8">
            <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 md:p-8 relative overflow-hidden border-b border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mr-32 -mt-32 opacity-20"></div>
                <div className="relative z-10">
                  <div className="flex items-start">
                    <div className="p-3 bg-blue-100 rounded-xl mr-4 text-blue-600">
                      <FaTools className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">Hire Manpower for Shifting</h2>
                      <p className="text-gray-600 max-w-3xl">
                        Need help moving your belongings? RentPal connects you with registered professionals 
                        for an easy and stress-free shifting experience. Browse our available workers and choose 
                        the perfect match for your shifting needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-8 py-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-sm text-blue-600">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  <span>Secure Booking System</span>
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  <span>Flexible Scheduling</span>
                </div>
              </div>
            </section>

            <section>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Available Workers</h3>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  <div className="relative">
                    <select className="pl-4 pr-10 py-2 appearance-none bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <option>Sort by Experience</option>
                      <option>Sort by Rating</option>
                      <option>Sort by Availability</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaSortAmountDown className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="ml-4 text-lg text-gray-600">Loading available workers...</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workers.map((worker) => (
                    <div
                      key={worker._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
                    >
                      <div className="p-6 flex-grow">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm">
                            {worker.name?.charAt(0) || "W"}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">{worker.name}</h4>
                            <RatingStars rating={worker.rating} />
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                              <FaBriefcase className="text-blue-500" />
                            </div>
                            <span>Experience: <span className="font-semibold">{worker.experience}</span></span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mr-3">
                              <FaDollarSign className="text-green-500" />
                            </div>
                            <span>Rate: <span className="font-semibold">{formatRate(worker.rate)}</span></span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center mr-3">
                              <FaClock className="text-yellow-500" />
                            </div>
                            <span>Availability: <span className="font-semibold">{worker.availability}</span></span>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-sm text-gray-500 mb-2">Specialties:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(worker.specialties) ? (
                              worker.specialties.map((specialty, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))
                            ) : (
                              typeof worker.specialties === 'string' && 
                              worker.specialties.split(',').map((specialty, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                                >
                                  {specialty.trim()}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                        <button
                          onClick={() => handleHireNow(worker)}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
                        >
                          Hire Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Step 1: Booking Form */}
        {bookingStep === 1 && selectedWorker && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <button 
                onClick={handleBackToWorkers}
                className="mb-4 flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to workers
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  {selectedWorker.name?.charAt(0) || "W"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Book {selectedWorker.name}</h2>
                  <div className="flex items-center mt-1">
                    <RatingStars rating={selectedWorker.rating} /> 
                    <span className="ml-2 text-blue-100 text-sm">• {selectedWorker.experience} experience</span>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline h-4 w-4 mr-1" /> Your Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={bookingData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline h-4 w-4 mr-1" /> Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={bookingData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label htmlFor="shiftingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline h-4 w-4 mr-1" /> Shifting Date
                </label>
                <input
                  type="date"
                  id="shiftingDate"
                  name="shiftingDate"
                  value={bookingData.shiftingDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="shiftingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline h-4 w-4 mr-1" /> Shifting Address
                </label>
                <textarea
                  id="shiftingAddress"
                  name="shiftingAddress"
                  value={bookingData.shiftingAddress}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter the complete address"
                ></textarea>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-4">
                  By confirming this booking, you agree to our terms and conditions regarding shifting services.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default HrPage;