import React, { useState, useRef } from 'react';
import { FaStar, FaUser, FaEnvelope, FaCamera } from 'react-icons/fa';

interface ReviewFormProps {
    profileId: number;
    accentColor?: string;
    onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    profileId,
    accentColor = '#fbbf24',
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        rating: 0,
        comment: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must not exceed 5MB');
            return;
        }

        setSelectedImage(file);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.client_name || formData.rating === 0 || !formData.comment) {
            alert('Please complete all required fields (Name, Rating and Comment)');
            return;
        }

        setIsSubmitting(true);

        try {
            // Usar FormData para enviar archivo
            const formDataToSend = new FormData();
            formDataToSend.append('profile_id', profileId.toString());
            formDataToSend.append('client_name', formData.client_name);
            formDataToSend.append('rating', formData.rating.toString());
            formDataToSend.append('comment', formData.comment);

            if (formData.client_email) {
                formDataToSend.append('client_email', formData.client_email);
            }

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: formDataToSend,
            });

            const result = await response.json();

            if (result.success) {
                setShowSuccess(true);
                setFormData({
                    client_name: '',
                    client_email: '',
                    rating: 0,
                    comment: '',
                });
                setSelectedImage(null);
                setImagePreview(null);

                setTimeout(() => {
                    setShowSuccess(false);
                    onSuccess?.();
                }, 3000);
            } else {
                alert(result.message || 'Error sending review');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Thank you for your review!</h3>
                <p className="text-gray-300">
                    Your review will be published once approved.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating Stars */}
            <div className="text-center">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Rating *
                </label>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all duration-200 hover:scale-125"
                        >
                            <FaStar
                                size={36}
                                className={
                                    star <= (hoveredRating || formData.rating)
                                        ? 'text-yellow-400 drop-shadow-lg'
                                        : 'text-gray-600'
                                }
                            />
                        </button>
                    ))}
                </div>
                {formData.rating > 0 && (
                    <p className="text-amber-400 text-sm mt-2 font-medium">
                        {formData.rating === 5 && 'Excellent! ⭐'}
                        {formData.rating === 4 && 'Very good 👍'}
                        {formData.rating === 3 && 'Good'}
                        {formData.rating === 2 && 'Fair'}
                        {formData.rating === 1 && 'Needs improvement'}
                    </p>
                )}
            </div>

            {/* Client Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <FaUser size={14} style={{ color: accentColor }} />
                    Your Name *
                </label>
                <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="E.g.: John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 text-white
                        placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all"
                    style={{
                        focusRingColor: accentColor,
                    }}
                />
            </div>

            {/* Client Email (Optional) */}
            <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <FaEnvelope size={14} style={{ color: accentColor }} />
                    Email (Optional)
                </label>
                <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 text-white
                        placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all"
                    style={{
                        focusRingColor: accentColor,
                    }}
                />
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Your Review *
                </label>
                <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-700 text-white
                        placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                        focusRingColor: accentColor,
                    }}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.comment.length} / 1000
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <FaCamera size={14} style={{ color: accentColor }} />
                    Work Photo (Optional)
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />

                {!imagePreview ? (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-8 rounded-xl bg-slate-800/50 border-2 border-dashed border-gray-700 text-gray-400
                            hover:border-gray-600 hover:text-gray-300 transition-all cursor-pointer
                            flex flex-col items-center gap-2"
                    >
                        <FaCamera size={32} style={{ color: accentColor, opacity: 0.7 }} />
                        <span className="text-sm font-medium">
                            Upload a photo of your service
                        </span>
                        <span className="text-xs text-gray-500">
                            JPG, PNG or HEIC · Max 5MB
                        </span>
                    </button>
                ) : (
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl border border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white
                                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            ✕ Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-black transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 30px ${accentColor}40`,
                }}
            >
                {isSubmitting ? '📤 Sending...' : '✨ Submit Review'}
            </button>
        </form>
    );
};
