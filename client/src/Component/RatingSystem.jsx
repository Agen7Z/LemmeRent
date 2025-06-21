import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingSystem = ({ listingId, userId, currentRating, onRate }) => {
    const [rating, setRating] = useState(currentRating || 0);
    const [hover, setHover] = useState(null);

    const handleRate = async (newRating) => {
        setRating(newRating);
        try {
            const response = await fetch(`/api/listing/rate/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, rating: newRating }),
            });
            const data = await response.json();
            if (data.success) {
                onRate(data.averageRating); // Update parent component with new average rating
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => handleRate(ratingValue)}
                            className="hidden"
                        />
                        <FaStar
                            className="cursor-pointer"
                            color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                            size={24}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(null)}
                        />
                    </label>
                );
            })}
            <span className="text-lg font-bold ml-2">{rating}</span>
        </div>
    );
};

export default RatingSystem;