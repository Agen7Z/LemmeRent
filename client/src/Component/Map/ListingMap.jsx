import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function ListingMap({ listing, height = "300px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  useEffect(() => {
    // Only proceed if we have a valid listing and map container
    if (!listing || !mapRef.current) return;
    
    // Clean up previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    
    // Create a simulated lat/lng for the listing based on a deterministic "random" offset
    // In a real-world app, you'd use actual coordinates from your database
    const baseLatitude = 27.7172; // Default to Kathmandu
    const baseLongitude = 85.3240;
    
    // Generate deterministic "random" offset from listing ID
    const getOffsetFromId = (id) => {
      if (!id) return 0;
      
      // Simple hash function to generate consistent value between -0.05 and 0.05
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return (hash % 1000) / 10000; // Between -0.05 and 0.05
    };
    
    const latOffset = getOffsetFromId(listing._id);
    const lngOffset = listing._id ? getOffsetFromId(listing._id.split('').reverse().join('')) : 0;
    
    const latitude = baseLatitude + latOffset;
    const longitude = baseLongitude + lngOffset;
    
    // Initialize map
    try {
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
      
      // Add marker for the listing
      const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
      
      // Add popup with listing info
      marker.bindPopup(`
        <div style="max-width: 200px">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${listing.name || 'Property'}</h3>
          <p style="margin-bottom: 8px;">${listing.address || 'Address unavailable'}</p>
          <p style="font-weight: bold;">$${(listing.offer ? listing.discountPrice : listing.price)?.toLocaleString() || '0'}</p>
        </div>
      `).openPopup();
      
      // Fix map container size issues by triggering a resize after render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listing]);
  
  if (!listing) return null;
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div 
        ref={mapRef} 
        className="z-0 w-full rounded-lg" 
        style={{ height }}
      ></div>
      
      {/* Map Attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white bg-opacity-70 px-1 rounded">
        <a 
          href="https://www.openstreetmap.org/copyright" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-500"
        >
          © OpenStreetMap contributors
        </a>
      </div>
    </div>
  );
}
