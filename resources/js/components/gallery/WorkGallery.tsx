import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface GalleryImage {
    url: string;
    caption?: string;
}

interface WorkGalleryProps {
    images: GalleryImage[];
    accentColor?: string;
    title?: string;
}

export const WorkGallery: React.FC<WorkGalleryProps> = ({
    images,
    accentColor = '#ef4444',
    title = 'Nuestros Trabajos'
}) => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const openLightbox = (index: number) => {
        setSelectedImage(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        setSelectedImage((prev) => prev !== null ? (prev + 1) % images.length : 0);
    };

    const prevImage = () => {
        setSelectedImage((prev) => prev !== null ? (prev - 1 + images.length) % images.length : 0);
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            <div className="space-y-4">
                {/* Title */}
                <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: accentColor }}>
                    <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    {title}
                </h2>

                {/* Carousel */}
                <div className="relative">
                    <div className="overflow-hidden rounded-2xl">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="min-w-full aspect-[4/3] cursor-pointer"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.caption || `Trabajo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                                    bg-black/50 backdrop-blur-sm text-white flex items-center justify-center
                                    hover:bg-black/70 transition-all"
                                style={{ borderColor: accentColor, borderWidth: '1px' }}
                            >
                                <FaChevronLeft size={16} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                                    bg-black/50 backdrop-blur-sm text-white flex items-center justify-center
                                    hover:bg-black/70 transition-all"
                                style={{ borderColor: accentColor, borderWidth: '1px' }}
                            >
                                <FaChevronRight size={16} />
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className="w-2 h-2 rounded-full transition-all"
                                    style={{
                                        backgroundColor: currentIndex === index ? accentColor : '#ffffff80'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                        <button
                            key={index}
                            onClick={() => openLightbox(index)}
                            className="aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                            style={{
                                borderColor: selectedImage === index ? accentColor : 'transparent'
                            }}
                        >
                            <img
                                src={image.url}
                                alt={`Miniatura ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm
                            text-white flex items-center justify-center hover:bg-white/20 transition-all z-10"
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[selectedImage].url}
                            alt={images[selectedImage].caption || `Trabajo ${selectedImage + 1}`}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />

                        {images[selectedImage].caption && (
                            <p className="text-center text-white mt-4 text-lg">
                                {images[selectedImage].caption}
                            </p>
                        )}

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                                        bg-white/10 backdrop-blur-sm text-white flex items-center justify-center
                                        hover:bg-white/20 transition-all"
                                >
                                    <FaChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                                        bg-white/10 backdrop-blur-sm text-white flex items-center justify-center
                                        hover:bg-white/20 transition-all"
                                >
                                    <FaChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkGallery;
