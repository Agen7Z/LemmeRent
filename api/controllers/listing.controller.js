import { parse } from "dotenv";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
    try {
        // Make sure thumbnailIndex is a number and within the valid range
        if (req.body.thumbnailIndex !== undefined) {
            const thumbnailIndex = parseInt(req.body.thumbnailIndex);
            if (isNaN(thumbnailIndex) || thumbnailIndex < 0 || thumbnailIndex >= req.body.imageURL.length) {
                req.body.thumbnailIndex = 0; // Default to first image if invalid
            } else {
                req.body.thumbnailIndex = thumbnailIndex;
            }
        } else {
            req.body.thumbnailIndex = 0; // Default to first image if not provided
        }
        
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (error) {
        next(error);
    }
}

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);

    if(!listing) return next(errorHandler(404,"Listing not found"));

    if(req.user.id !== listing.userRef) return next(errorHandler(403,"You can only delete your listing!"));

    try{
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json("Listing has been deleted");

    }
    catch(error){
        next(error);
    }
}

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);

    if(!listing) return next(errorHandler(404,"Listing not found"));

    if(req.user.id !== listing.userRef) return next(errorHandler(403,"You can only update your listing!"));

    try{
        // Make sure thumbnailIndex is a number and within the valid range
        if (req.body.thumbnailIndex !== undefined) {
            const thumbnailIndex = parseInt(req.body.thumbnailIndex);
            if (isNaN(thumbnailIndex) || thumbnailIndex < 0 || thumbnailIndex >= req.body.imageURL.length) {
                req.body.thumbnailIndex = 0; // Default to first image if invalid
            } else {
                req.body.thumbnailIndex = thumbnailIndex;
            }
        }
        
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedListing);
    }
    catch(error){
        next(error);
    }
}

export const getListing = async (req, res, next) => {
    try{
      const listing = await Listing.findById(req.params.id);
      if(!listing) return next(errorHandler(404,"Listing not found!"));
      
      // Check if the listing has any approved bookings
      const currentDate = new Date();
      const bookings = await Booking.find({
        listingId: listing._id,
        status: "approved",
        preferredDate: { $gte: currentDate }
      }).sort({ preferredDate: 1 });
      
      // Add availability info to the response
      const listingWithAvailability = listing.toObject();
      
      if (bookings && bookings.length > 0) {
        // Property has upcoming approved bookings
        listingWithAvailability.availability = {
          isAvailable: false,
          nextAvailableDate: bookings[0].preferredDate,
          isBooked: true,
          bookedUntil: bookings[0].preferredDate,
          bookingCount: bookings.length
        };
      } else {
        // Property is available
        listingWithAvailability.availability = {
          isAvailable: true,
          isBooked: false,
          bookingCount: 0
        };
      }
      
      // If the user is logged in, check if they have booked this property
      if (req.user) {
        const userBookings = await Booking.find({ 
          listingId: listing._id,
          userId: req.user.id,
          status: "approved"
        }).sort({ preferredDate: -1 });
        
        if (userBookings && userBookings.length > 0) {
          listingWithAvailability.userBooking = {
            hasBooked: true,
            bookingId: userBookings[0]._id,
            bookingDate: userBookings[0].preferredDate,
            bookingStatus: userBookings[0].status
          };
        }
      }
      
      res.status(200).json(listingWithAvailability);
    }
    catch(error){
      next(error);
    }
  };
  
export const getListings = async (req, res, next) => {
    try{
      const limit = parseInt(req.query.limit) || 9;
      const startIndex = parseInt(req.query.startIndex) || 0;
      let offer = req.query.offer;
      if(offer == undefined || offer == "false") {
          offer = {$in: [false, true]};
      }
      let furnished = req.query.furnished;
      if(furnished == undefined || furnished == "false") {
          furnished = {$in: [false, true]};
      }
      let parking = req.query.parking;
      if(parking == undefined || parking == "false") {
          parking = {$in: [false, true]};
      }
      let type = req.query.type;
      if(type == undefined || type == "all") {
          type = {$in: ["sale", "rent"]};
      }
      const searchTerm = req.query.searchTerm || '';
      const sort = req.query.sort || 'createdAt';
      const order = req.query.order || 'desc';
      
      // Get the listings
      const listings = await Listing.find({
          name: { $regex: searchTerm, $options: 'i' },
          offer,
          furnished,
          parking,
          type,
      })
      .sort({ [sort]: order }).limit(limit).skip(startIndex);
      
      // Get the current date
      const currentDate = new Date();
      
      // Get all approved bookings for these listings
      const listingIds = listings.map(listing => listing._id);
      const bookings = await Booking.find({
        listingId: { $in: listingIds },
        status: "approved",
        preferredDate: { $gte: currentDate }
      });
      
      // Map bookings by listing ID
      const bookingsByListing = bookings.reduce((acc, booking) => {
        const listingId = booking.listingId.toString();
        if (!acc[listingId]) {
          acc[listingId] = [];
        }
        acc[listingId].push(booking);
        return acc;
      }, {});
      
      // Add availability info to each listing
      const listingsWithAvailability = listings.map(listing => {
        const listingObj = listing.toObject();
        const listingId = listing._id.toString();
        const listingBookings = bookingsByListing[listingId] || [];
        
        if (listingBookings.length > 0) {
          // Sort bookings by date
          listingBookings.sort((a, b) => a.preferredDate - b.preferredDate);
          
          listingObj.availability = {
            isAvailable: false,
            isBooked: true,
            bookedUntil: listingBookings[0].preferredDate
          };
        } else {
          listingObj.availability = {
            isAvailable: true,
            isBooked: false
          };
        }
        
        return listingObj;
      });
      
      return res.status(200).json(listingsWithAvailability);
    }
    catch(error){
      next(error);
    }
};

export const rateListing = async (req, res, next) => {
    const { listingId } = req.params;
    const { userId, rating } = req.body;

    if (!userId || !rating || rating < 1 || rating > 5) {
        return next(errorHandler(400, "Invalid rating data."));
    }

    try {
        const listing = await Listing.findById(listingId);
        if (!listing) return next(errorHandler(404, "Listing not found."));

        // Check if the user has already rated this listing
        const existingRating = listing.ratings.find((r) => r.userId === userId);
        if (existingRating) {
            existingRating.rating = rating; // Update existing rating
        } else {
            listing.ratings.push({ userId, rating }); // Add new rating
        }

        // Calculate the average rating
        const totalRatings = listing.ratings.reduce((sum, r) => sum + r.rating, 0);
        listing.averageRating = (totalRatings / listing.ratings.length).toFixed(1);

        await listing.save();
        res.status(200).json({ success: true, averageRating: listing.averageRating });
    } catch (error) {
        next(error);
    }
};

export const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({});
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};