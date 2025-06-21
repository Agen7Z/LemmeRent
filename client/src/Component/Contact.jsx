import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  const handleContactClick = () => {
    setShowContactForm(true);
  };

  const handleBackClick = () => {
    setShowContactForm(false);
  };

  return (
    <>
      {landlord && (
        <div className="contact-section">
          <p className="text-lg">
            Contact{' '}
            <span className="text-2xl font-bold text-red-600">{landlord.username}</span>
          </p>

          
          {!showContactForm && (
            <button 
              onClick={handleContactClick} 
              className="contact-button bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Contact Landlord
            </button>
          )}

          {/* Show the contact form when showContactForm is true */}
          {showContactForm && (
            <div className="contact-form mt-4">
              <textarea
                name="message"
                id="message"
                value={message}
                onChange={onChange}
                placeholder="Write your message here..."
                className="w-full p-4 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="5"
              ></textarea>
              <div className="mt-2 flex items-center space-x-2">
                <Link
                  to={`mailto:${landlord.email}?Subject=Regarding ${listing.name}&body=${message}`}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Send Message
                </Link>
                <button
                  onClick={handleBackClick}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Contact;
