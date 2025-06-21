// src/Pages/Contact.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight
} from 'react-icons/fa';
import ContactForm from '../Component/ContactForm';

export default function Contact() {
  // Animation variants
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient with overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 z-0">
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
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-blue-100 font-medium mb-6">
              We'd Love To Hear From You
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-white">
              Get In <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl font-light mb-10 text-blue-100 max-w-xl mx-auto">
              Have questions or need assistance? Our team is here to help you with all your property needs.
            </p>
            <div className="flex justify-center">
              <a
                href="#contact-form"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Send Message
              </a>
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
      <div className="container mx-auto px-4 py-16" id="contact-form">
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Information */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Reach out to us for any inquiries about rentals, property listings, or if you need assistance with your account.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                      <FaMapMarkerAlt className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Visit Us</h3>
                      <p className="text-gray-600">Kathmandu, Nepal</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
                      <FaPhone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
                      <a href="tel:+9779841234567" className="text-gray-600 hover:text-blue-600 transition-colors">
                        +977 9762261869
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4">
                      <FaEnvelope className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
                      <a href="mailto:info@rentpal.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                        krisambyanjuu@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <ContactForm />
            </motion.div>
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Our Location</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our office to meet the team and discuss your property needs in person.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white p-3 rounded-xl shadow-xl">
              <div className="aspect-w-16 aspect-h-9 w-full h-[400px] rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.31625953584!2d85.29111325503233!3d27.708942318885767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sus!4v1681198695349!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
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
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to Join Our Community?</h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Sign up today and discover the easiest way to find your perfect property or list your real estate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Browse Properties
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