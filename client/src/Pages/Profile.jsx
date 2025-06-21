// Updated Profile.jsx - Main entry point that renders appropriate dashboard
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import UserDashboard from '../Component/UserDashboard';
import LandlordDashboard from '../Component/LandlordDashboard';

function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [isLandlord, setIsLandlord] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is a landlord
  useEffect(() => {
    const checkIfLandlord = async () => {
      try {
        const res = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) {
          console.error("Error fetching listings:", data.message);
          setIsLandlord(false);
        } else {
          setIsLandlord(data.length > 0);
        }
      } catch (error) {
        console.error("Error checking landlord status:", error);
        setIsLandlord(false);
      } finally {
        setLoading(false);
      }
    };

    checkIfLandlord();
  }, [currentUser._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  return isLandlord ? <LandlordDashboard /> : <UserDashboard />;
}

export default Profile;