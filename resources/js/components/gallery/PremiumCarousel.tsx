import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';

export interface CarouselImage {
  url: string;
  caption?: string;
  thumbnail?: string; // Thumbnail para videos
}

interface PremiumCarouselProps {
  images: CarouselImage[];
  accentColor?: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export const PremiumCarousel: React.FC<PremiumCarouselProps> = ({
  images,
  accentColor = '#fbbf24',
  autoPlay = true,
  interval = 5000,
  className = '',
}) => {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter((i) => i?.url) : []),
    [images]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const nextSlide = () => {
    if (isTransitioning || safeImages.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    window.setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || safeImages.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    window.setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    window.setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    stopTimer();
    if (!autoPlay || safeImages.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      // Usamos setter funcional para no depender del currentIndex en deps
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, interval);

    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, interval, safeImages.length]);

  if (!safeImages.length) return null;

  // Seguridad: si cambian imágenes y currentIndex queda fuera
  const clampedIndex = Math.min(currentIndex, safeImages.length - 1);

  // Helper para detectar si es video
  const isVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* ===== MAIN IMAGE/VIDEO ===== */}
      <div className="relative w-full h-[380px] rounded-2xl overflow-hidden bg-black shadow-2xl">
        {safeImages.map((image, index) => {
          const isVideoFile = isVideo(image.url);

          return (
            <div
              key={`${image.url}-${index}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === clampedIndex
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-95 z-0'
              }`}
            >
              {isVideoFile ? (
                <video
                  src={image.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload={index === clampedIndex ? 'metadata' : 'none'}
                  poster={image.thumbnail}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : (
                <img
                  src={image.url}
                  alt={image.caption || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === clampedIndex ? 'eager' : 'lazy'}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-20 pointer-events-none">
                  <p className="text-white text-base font-semibold">{image.caption}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* ARROWS */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full
              bg-black/60 backdrop-blur border border-white/10
              flex items-center justify-center text-white
              active:scale-95 transition disabled:opacity-50"
            >
              <FaChevronLeft size={18} />
            </button>

            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full
              bg-black/60 backdrop-blur border border-white/10
              flex items-center justify-center text-white
              active:scale-95 transition disabled:opacity-50"
            >
              <FaChevronRight size={18} />
            </button>
          </>
        )}

        {/* COUNTER */}
        <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
          <span className="text-white text-xs font-medium">
            {clampedIndex + 1} / {safeImages.length}
          </span>
        </div>
      </div>

      {/* ===== THUMBNAILS ===== */}
      {safeImages.length > 1 && (
        <div
          className="flex gap-3 px-2 pt-4 pb-5 mt-2
          overflow-x-auto overflow-y-visible scrollbar-hide"
        >
          {safeImages.map((image, index) => {
            const active = index === clampedIndex;
            const isVideoFile = isVideo(image.url);
            const thumbSrc = isVideoFile && image.thumbnail ? image.thumbnail : image.url;

            return (
              <button
                key={`thumb-${image.url}-${index}`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`
                  relative flex-shrink-0
                  w-[64px] h-[64px]
                  rounded-xl overflow-hidden
                  transition-all duration-300
                  ${active ? 'opacity-100' : 'opacity-60'}
                  disabled:cursor-not-allowed
                `}
                style={{
                  border: active
                    ? `2px solid ${accentColor}`
                    : '1px solid rgba(255,255,255,.12)',
                }}
              >
                {isVideoFile ? (
                  <>
                    <video
                      src={image.url}
                      className="w-full h-full object-cover object-center block"
                      preload="metadata"
                      poster={image.thumbnail}
                      muted
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <FaPlay className="text-black text-xs ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={thumbSrc}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover object-center block"
                    loading="lazy"
                  />
                )}

                {active && (
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accentColor}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ===== DOTS ===== */}
      {safeImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-1">
          {safeImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`rounded-full transition-all duration-300
                ${index === clampedIndex ? 'w-6 h-2' : 'w-2 h-2 opacity-40'}
              `}
              style={{ backgroundColor: accentColor }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
