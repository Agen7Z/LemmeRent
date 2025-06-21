import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaHome, FaLocationArrow, FaMapMarkerAlt, FaExpand } from "react-icons/fa";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyMap({ listings = [], height = "500px", centerListing = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  
  // Default position for Kathmandu
  const [userPosition, setUserPosition] = useState({
    latitude: 27.7172,
    longitude: 85.3240
  });
  
  const [mapInitialized, setMapInitialized] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    try {
      // Default center (will be overridden if centerListing or user position is available)
      const defaultCenter = [userPosition.latitude, userPosition.longitude];
      
      // Initialize the map
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false, // We'll add our own controls
      }).setView(defaultCenter, 13);
      
      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
      
      // Add zoom control to the top-right
      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstanceRef.current);
      
      // Create a layer for markers
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      
      setMapInitialized(true);
      
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
  }, [userPosition]);

  // Get user's geolocation
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [showUserLocation]);

  // Add property markers when listings change or map is initialized
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;
    
    try {
      // Clear existing markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
      
      // If we have a specific listing to center on
      if (centerListing) {
        // Generate coordinates based on listing ID for demo purposes
        // In a real app, you'd use actual coordinates from your database
        const getOffsetFromId = (id) => {
          if (!id) return 0;
          let hash = 0;
          for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
          }
          return (hash % 1000) / 10000;
        };
        
        const latOffset = centerListing._id ? getOffsetFromId(centerListing._id) : 0;
        const lngOffset = centerListing._id ? getOffsetFromId(centerListing._id.split('').reverse().join('')) : 0;
        
        const lat = 27.7172 + latOffset;
        const lng = 85.3240 + lngOffset;
        
        // Center the map on this listing
        mapInstanceRef.current.setView([lat, lng], 15);
        
        // Add a marker for this listing
        const marker = L.marker([lat, lng])
          .addTo(markersLayerRef.current)
          .bindPopup(`
            <div class="popup-content">
              <h3 class="text-lg font-bold">${centerListing.name || 'Property'}</h3>
              <p>${centerListing.address || 'Address unavailable'}</p>
              <p class="font-bold mt-2">$${centerListing.price?.toLocaleString() || '0'}</p>
            </div>
          `);
        
        // Open the popup automatically
        marker.openPopup();
      } 
      // Otherwise show all listings if available
      else if (listings.length > 0) {
        // Create bounds to fit all markers
        const bounds = L.latLngBounds();
        
        // Add markers for all listings
        listings.forEach((listing, index) => {
          if (!listing) return;
          
          // Generate deterministic coordinates based on listing ID + index
          // In a real app, you'd use actual coordinates from your database
          const idString = listing._id || `listing-${index}`;
          const getOffsetFromId = (id, seed = 1) => {
            if (!id) return 0;
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
              hash = ((hash << seed) - hash) + id.charCodeAt(i);
              hash |= 0;
            }
            return (hash % 1000) / 5000; // Smaller divisor for more spread
          };
          
          const lat = userPosition.latitude + getOffsetFromId(idString, 5);
          const lng = userPosition.longitude + getOffsetFromId(idString.split('').reverse().join(''), 3);
          
          // Create a custom icon with different colors based on property type
          const markerColor = listing.type === 'rent' ? 'blue' : 'green';
          const markerHtml = `
            <div class="w-8 h-8 bg-${markerColor}-500 rounded-full text-white flex items-center justify-center font-bold shadow-lg border-2 border-white">${listing.type === 'rent' ? 'R' : 'S'}</div>
          `;
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: markerHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });
          
          const marker = L.marker([lat, lng], { icon: customIcon })
            .addTo(markersLayerRef.current)
            .bindPopup(`
              <div class="popup-content">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${listing.name || 'Property'}</h3>
                <p style="margin-bottom: 4px;">${listing.address || 'Address unavailable'}</p>
                <p style="font-weight: bold;">${(listing.offer ? listing.discountPrice : listing.price)?.toLocaleString() || '0'}</p>
              </div>
            `);
          
          // Extend bounds to include this marker
          bounds.extend([lat, lng]);
        });
        
        // Fit map to bounds if we have listings
        if (listings.length > 0) {
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15
          });
        }
      }
      
      // Add user location marker if enabled
      updateUserLocationMarker();
    } catch (error) {
      console.error("Error adding markers:", error);
    }
  }, [listings, centerListing, mapInitialized, userPosition, showUserLocation]);

  // Update user position marker
  const updateUserLocationMarker = () => {
    if (!mapInitialized || !mapInstanceRef.current) return;
    
    // Remove existing user marker if it exists
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    
    // Only proceed if we're showing user location and have valid coordinates
    if (showUserLocation) {
      try {
        // Create a custom icon for user location
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="absolute w-12 h-12 bg-blue-500 rounded-full opacity-20 -top-3 -left-3 animate-ping"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        // Add new user marker
        userMarkerRef.current = L.marker([userPosition.latitude, userPosition.longitude], {
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(mapInstanceRef.current);
        
        // If we're only showing user location (no listings), center on user
        if (listings.length === 0 && !centerListing) {
          mapInstanceRef.current.setView([userPosition.latitude, userPosition.longitude], 15);
        }
      } catch (error) {
        console.error("Error adding user location marker:", error);
      }
    }
  };

  // Toggle user location visibility
  const handleToggleUserLocation = () => {
    setShowUserLocation(!showUserLocation);
  };

  // Center map on user location
  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    
    if (userPosition.latitude && userPosition.longitude) {
      mapInstanceRef.current.setView([userPosition.latitude, userPosition.longitude], 15);
    }
  };

  // Reset map view to show all markers
  const handleResetView = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    
    try {
      // Get all markers
      const allMarkers = [];
      markersLayerRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          allMarkers.push(layer.getLatLng());
        }
      });
      
      // If we have markers, fit bounds
      if (allMarkers.length > 0) {
        const bounds = L.latLngBounds(allMarkers);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
      } else {
        // If no markers, center on user position
        mapInstanceRef.current.setView([userPosition.latitude, userPosition.longitude], 13);
      }
    } catch (error) {
      console.error("Error resetting view:", error);
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
      <div 
        ref={mapRef} 
        className="z-0 w-full rounded-xl" 
        style={{ height }}
      ></div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-14 flex flex-col space-y-2">
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          onClick={handleToggleUserLocation}
          title={showUserLocation ? "Hide my location" : "Show my location"}
        >
          <FaLocationArrow className={`h-5 w-5 ${showUserLocation ? 'text-blue-500' : 'text-gray-500'}`} />
        </button>
        
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          onClick={handleCenterOnUser}
          title="Center on my location"
        >
          <FaMapMarkerAlt className="h-5 w-5 text-gray-500" />
        </button>
        
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          onClick={handleResetView}
          title="Show all properties"
        >
          <FaExpand className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-sm">
        <div className="flex items-center mb-2">
          <div className="flex">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>For Rent</span>
          </div>
          <div className="flex ml-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>For Sale</span>
          </div>
        </div>
        {showUserLocation && (
          <div className="flex items-center mt-1 pt-1 border-t border-gray-100">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span>Your Location</span>
          </div>
        )}
      </div>
      
      {/* Attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-600 bg-white/70 px-1 rounded">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
      </div>
    </div>
  );
}