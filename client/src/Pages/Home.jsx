import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css/bundle';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaShieldAlt, FaHeadset, FaLock, FaArrowRight, FaBuilding, FaMapMarkerAlt, FaBed, FaBath } from 'react-icons/fa';
import ListingItem from '../Component/ListingItem';
import TawkChat from '../Component/Twakchat';

export default function Home() {
  const [listings, setListings] = useState({
    offer: [],
    rent: [],
    sale: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const [offers, rent, sale] = await Promise.all([
          fetch('/api/listing/get?offer=true&limit=4').then(res => res.json()),
          fetch('/api/listing/get?type=rent&limit=4').then(res => res.json()),
          fetch('/api/listing/get?type=sale&limit=4').then(res => res.json())
        ]);

        setListings({
          offer: offers,
          rent: rent,
          sale: sale
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen">
      <TawkChat />

      {/* Hero Section */}
      <section className="relative h-[80vh] text-white">
        <Swiper
          modules={[Navigation, Autoplay, Pagination, EffectFade]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000 }}
          effect="fade"
          className="h-full w-full"
        >
          {loading ? (
            <SwiperSlide>
              <div className="flex justify-center items-center h-full bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
              </div>
            </SwiperSlide>
          ) : listings.offer.length > 0 ? (
            listings.offer.map((listing) => {
              const thumbnailUrl = listing.imageURL[
                listing.thumbnailIndex !== undefined &&
                listing.thumbnailIndex < listing.imageURL.length
                  ? listing.thumbnailIndex
                  : 0
              ];

              return (
                <SwiperSlide key={listing._id}>
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    <div className="flex h-full items-center relative z-10 px-4 lg:px-20">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl space-y-6"
                      >
                        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                        <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
                          {listing.name}
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-100">
                          <FaMapMarkerAlt className="inline mr-2" />
                          {listing.address}
                        </p>
                        <div className="flex flex-wrap gap-4 text-lg">
                          <span className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                            <FaBed className="mr-2" /> {listing.bedrooms} Bedrooms
                          </span>
                          <span className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                            <FaBath className="mr-2" /> {listing.bathrooms} Bathrooms
                          </span>
                          <span className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                            <FaHome className="mr-2" /> {listing.furnished ? 'Furnished' : 'Unfurnished'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <Link
                            to={`/listing/${listing._id}`}
                            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform duration-200"
                          >
                            View Property
                          </Link>
                          <Link
                            to="/search"
                            className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-blue-800 transition hover:bg-gray-100 shadow-lg"
                          >
                            <FaSearch className="inline mr-2" /> Explore More
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
          ) : (
            <SwiperSlide>
              <div className="h-full w-full bg-gradient-to-r from-blue-700 to-indigo-800">
                <div className="flex h-full items-center px-4 lg:px-20">
                  <div className="max-w-2xl space-y-6">
                    <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                      Find Your Perfect Home With RentPal
                    </h1>
                    <p className="text-lg lg:text-xl">
                      Discover amazing properties tailored to your needs
                    </p>
                    <Link
                      to="/search"
                      className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-blue-800 transition hover:bg-opacity-90"
                    >
                      Explore Properties
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </section>

      {/* Search Bar Section */}
      <section className="relative z-10 bg-white shadow-xl rounded-xl mx-auto max-w-5xl p-6 -mt-16 mb-8">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Find Your Dream Property</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Any Type</option>
              <option>For Rent</option>
              <option>For Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" placeholder="Any Location" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Any Price</option>
              <option>$500 - $1,000</option>
              <option>$1,000 - $2,000</option>
              <option>$2,000 - $3,000</option>
              <option>$3,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">Search</label>
            <Link to="/search" className="block w-full p-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition shadow-md font-medium">
              <FaSearch className="inline mr-2" /> Search
            </Link>
          </div>
        </form>
      </section>

      {/* Listings Sections */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <EnhancedSection title="Featured Listings" subtitle="Exclusive properties with special offers" listings={listings.offer} link="/search?offer=true" icon={<FaHome />} color="bg-gradient-to-r from-blue-500 to-indigo-600" />
            <EnhancedSection title="Recent Rentals" subtitle="Latest properties available for rent" listings={listings.rent} link="/search?type=rent" icon={<FaBuilding />} color="bg-gradient-to-r from-purple-500 to-indigo-600" />
            <EnhancedSection title="Homes for Sale" subtitle="Find your forever home today" listings={listings.sale} link="/search?type=sale" icon={<FaHome />} color="bg-gradient-to-r from-blue-500 to-purple-600" />
          </>
        )}
      </main>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Trusted by Thousands</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join our community of satisfied clients who have found their perfect properties through our platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="1,234+" label="Properties Listed" />
            <StatCard number="5,678+" label="Happy Clients" />
            <StatCard number="98%" label="Satisfaction Rate" />
            <StatCard number="24/7" label="Customer Support" />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-6xl space-y-12 px-4 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Why Choose RentPal</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">Experience the difference with our premium real estate services</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <EnhancedFeature
              icon={<FaShieldAlt className="w-8 h-8 text-blue-200" />}
              title="Verified Listings"
              content="Every property undergoes strict verification process"
            />
            <EnhancedFeature
              icon={<FaHeadset className="w-8 h-8 text-blue-200" />}
              title="Expert Support"
              content="Our team is available 24/7 to assist you"
            />
            <EnhancedFeature
              icon={<FaLock className="w-8 h-8 text-blue-200" />}
              title="Secure Process"
              content="Safe and transparent transaction process"
            />
          </div>

          <div className="text-center pt-6">
            <Link
              to="/about"
              className="inline-flex items-center justify-center bg-white text-blue-700 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Learn More About Us
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl shadow-xl p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
                <p className="text-gray-300 mb-6">
                  Start your journey with RentPal today and discover the perfect property that meets all your needs.
                </p>
                <Link
                  to="/search"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
                >
                  Get Started Now
                </Link>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
                  alt="Dream Home"
                  className="rounded-lg shadow-lg object-cover h-64 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EnhancedSection({ title, subtitle, listings, link, icon, color }) {
  if (!listings.length) return null;

  return (
    <div className="mb-20">
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div className="flex items-center">
          <div className={`${color} p-3 rounded-lg text-white mr-4`}>
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        <Link to={link} className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          View all <FaArrowRight className="ml-2" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingItem key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function EnhancedFeature({ icon, title, content }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col items-center text-center">
        <div className="bg-white/10 p-4 rounded-full mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-blue-100">{content}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-300">
      <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}
