import mongoose from "mongoose";
const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        required: true,
    },
    bathrooms: {
        type: Number,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    furnished: {
        type: Boolean,
        required: true,
    },
    parking: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    imageURL: { 
        type: Array,
        required: true,
    },
    thumbnailIndex: {  // New field to track which image is the thumbnail
        type: Number,
        default: 0,    // Default to the first image
    },
    offer: {
        type: Boolean,
        required: true,
    },
    userRef: {
        type: String,
        required: true,
    },
    ratings: [
        {
            userId: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
        },
    ],
    averageRating: { // Add this field
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;