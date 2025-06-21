import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Review from '../models/Review.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

// Add a new review
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { listingId, userId, username, rating, comment } = req.body;
    
    // Verify that the user is authenticated
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to post this review' });
    }
    
    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({ listingId, userId });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      
      // Recalculate average rating
      const allReviews = await Review.find({ listingId });
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      // Update listing with new average rating
      await Listing.findByIdAndUpdate(listingId, { averageRating });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Review updated successfully',
        reviewId: existingReview._id,
        averageRating
      });
    }
    
    // Create new review
    const newReview = new Review({
      listingId,
      userId,
      username,
      rating,
      comment,
      createdAt: new Date()
    });
    
    await newReview.save();
    
    // Calculate new average rating
    const allReviews = await Review.find({ listingId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    // Update listing with new average rating
    await Listing.findByIdAndUpdate(listingId, { averageRating });
    
    res.status(201).json({ 
      success: true, 
      message: 'Review added successfully',
      reviewId: newReview._id,
      averageRating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reviews for a listing
router.get('/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a review (optional)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if the user is authorized to delete this review
    if (req.user.id !== review.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    // Recalculate average rating
    const listingId = review.listingId;
    const allReviews = await Review.find({ listingId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      await Listing.findByIdAndUpdate(listingId, { averageRating });
    } else {
      // No reviews left, reset average rating
      await Listing.findByIdAndUpdate(listingId, { averageRating: 0 });
    }
    
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;