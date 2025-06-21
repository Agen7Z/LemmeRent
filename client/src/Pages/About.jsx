import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBuilding, FaHandshake, FaLock, FaArrowRight, FaSearch, FaHome, FaPhoneAlt } from 'react-icons/fa';

export default function AboutPage() {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 overflow-hidden">
      {/* Hero Section with Parallax-like effect */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient with overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 z-0"> </div>
          {/* Decorative elements */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10 backdrop-blur-xl"
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5
                }}
              />
            ))}
          </div>
       

        {/* Hero content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-blue-100 font-medium mb-6">
              Premium Real Estate Solutions
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-white">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Rentpal</span>
            </h1>
            <p className="text-xl md:text-2xl font-light mb-10 text-blue-100 max-w-xl mx-auto">
              Experience luxurious living spaces, seamless rental solutions, and impeccable service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <FaSearch className="text-blue-600" />
                Start Searching
              </Link>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <FaPhoneAlt className="text-white" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#f9fafb"
              fillOpacity="1"
              d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* "Who We Are" Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <motion.div variants={itemVariants} className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-50"></div>
                <div className="relative z-10 bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-2xl shadow-xl">
                  <div className="bg-white p-8 rounded-xl">
                    <div className="flex justify-center mb-6">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <FaBuilding className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Who We Are</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Rentpal is your dedicated partner in the real estate journey, offering a handpicked selection of luxurious
                      rental properties, flats, and homes. Whether you are a renter or landlord, we provide a seamless platform for
                      renting and property management that prioritizes trust, comfort, and transparency.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      With Rentpal, you can find your dream property with ease, knowing that each listing is verified and tailored to
                      meet your needs.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-blue-700 mb-2">10+ Years</h3>
                  <p className="text-gray-600">Experience in real estate market</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-purple-700 mb-2">5,000+</h3>
                  <p className="text-gray-600">Properties rented successfully</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">98%</h3>
                  <p className="text-gray-600">Client satisfaction rate</p>
                </div>
                <div className="bg-pink-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-pink-700 mb-2">24/7</h3>
                  <p className="text-gray-600">Customer support availability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* "Our Mission" Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-12 md:p-20 text-white">
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-center">
                  <div className="h-1 w-20 bg-blue-300 rounded mr-4"></div>
                  <h2 className="text-3xl md:text-4xl font-extrabold">Our Mission</h2>
                  <div className="h-1 w-20 bg-blue-300 rounded ml-4"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 max-w-3xl mx-auto text-center">
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8">
                  Our mission is simple: to make finding the perfect home or rental effortless, transparent, and luxurious.
                </p>
                <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                  Rentpal brings you closer to high-quality properties and the best customer experience, with 24/7 support and a wide range
                  of listings to choose from. We believe that every individual deserves a premium real estate experience—whether you're renting or purchasing.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* "Our Core Values" Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from customer interactions to platform development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              className="flex flex-col group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-1 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-xl p-8 h-full flex flex-col">
                  <div className="bg-blue-100 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                    <FaHandshake className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Trust & Integrity</h3>
                  <p className="text-gray-600 flex-grow">
                    Our platform is built on trust, ensuring that all listings are verified and secure for both renters and landlords.
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/values" className="flex items-center justify-center text-blue-600 font-medium hover:text-blue-800">
                      Learn more <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col group"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-1 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-xl p-8 h-full flex flex-col">
                  <div className="bg-purple-100 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                    <FaHome className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Excellence in Service</h3>
                  <p className="text-gray-600 flex-grow">
                    We strive to offer premium customer support, available 24/7 to assist you with any inquiries and guide you through
                    your real estate journey.
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/values" className="flex items-center justify-center text-purple-600 font-medium hover:text-purple-800">
                      Learn more <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col group"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-1 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 h-full">
                <div className="bg-white rounded-xl p-8 h-full flex flex-col">
                  <div className="bg-indigo-100 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                    <FaLock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Security & Privacy</h3>
                  <p className="text-gray-600 flex-grow">
                    Rentpal ensures your personal and payment data is securely protected, making your experience worry-free.
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/values" className="flex items-center justify-center text-indigo-600 font-medium hover:text-indigo-800">
                      Learn more <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it — hear from some of our satisfied clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Walter White",
                role: "Property Owner",
                quote: "Rentpal transformed how I manage my properties. Their platform is intuitive and their support is fantastic.",
                image: "https://randomuser.me/api/portraits/women/32.jpg"
              },
              {
                name: "Jessie Pinkman",
                role: "Tenant",
                quote: "Found my dream apartment in just two days! The verification process gave me confidence that I was making the right choice.",
                image: "https://randomuser.me/api/portraits/men/45.jpg"
              },
              {
                name: "Saul Goodman",
                role: "Real Estate Agent",
                quote: "As an agent, I appreciate how Rentpal streamlines the entire rental process. It's a game-changer for my business.",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-blue-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-blue-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/10"
                  style={{
                    width: `${Math.random() * 300 + 100}px`,
                    height: `${Math.random() * 300 + 100}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.3
                  }}
                />
              ))}
            </div>

            <div className="relative py-16 lg:py-24 px-6 md:px-12 text-center">
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to Find Your Perfect Home?</h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Join the Rentpal community and discover the easiest way to rent or buy your next property with ease and confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Get Started Now
                    <FaArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}