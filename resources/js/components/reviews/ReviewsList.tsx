import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface Review {
    id: number;
    client_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ReviewsData {
    reviews: Review[];
    total: number;
    average_rating: number;
}

interface ReviewsListProps {
    profileId: number;
    accentColor?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
    profileId,
    accentColor = '#fbbf24',
}) => {
    const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [profileId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?profile_id=${profileId}`);
            const result = await response.json();

            if (result.success) {
                setReviewsData(result.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-2">Loading reviews...</p>
            </div>
        );
    }

    if (!reviewsData || reviewsData.reviews.length === 0) {
        return (
            <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/50 border border-white/5">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-gray-400">
                    No reviews yet. Be the first to share your experience!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Average Rating Summary */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border border-amber-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <FaStar size={32} className="text-amber-400" />
                    <span className="text-5xl font-bold text-white">{reviewsData.average_rating}</span>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            size={20}
                            className={
                                star <= Math.round(reviewsData.average_rating)
                                    ? 'text-amber-400'
                                    : 'text-gray-600'
                            }
                        />
                    ))}
                </div>
                <p className="text-gray-300 text-sm">
                    Based on {reviewsData.total} {reviewsData.total === 1 ? 'review' : 'reviews'}
                </p>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviewsData.reviews.map((review) => (
                    <div
                        key={review.id}
                        className="p-5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-amber-500/20 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-semibold text-white">{review.client_name}</h4>
                                <p className="text-xs text-gray-500">{review.created_at}</p>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={14}
                                        className={
                                            star <= review.rating
                                                ? 'text-amber-400'
                                                : 'text-gray-600'
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <p className="text-gray-300 text-sm leading-relaxed">
                            "{review.comment}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
