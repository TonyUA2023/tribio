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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const timerRef = useRef<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

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
    // No hacer autoplay si hay un video reproduciéndose o si hay 1 solo elemento
    if (!autoPlay || safeImages.length <= 1 || isVideoPlaying) return;

    timerRef.current = window.setInterval(() => {
      // Usamos setter funcional para no depender del currentIndex en deps
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, interval);

    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, interval, safeImages.length, isVideoPlaying]);

  if (!safeImages.length) return null;

  // Seguridad: si cambian imágenes y currentIndex queda fuera
  const clampedIndex = Math.min(currentIndex, safeImages.length - 1);

  // Helper para detectar si es video
  const isVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Manejar reproducción de video
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  // Pausar todos los videos cuando cambia el slide
  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    setIsVideoPlaying(false);
  }, [currentIndex]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* ===== MAIN IMAGE/VIDEO ===== */}
      <div className="relative w-full h-[380px] rounded-xl overflow-hidden bg-black">
        {safeImages.map((image, index) => {
          const isVideoFile = isVideo(image.url);
          const isActive = index === clampedIndex;
          // Precargar solo el actual, el siguiente y el anterior para mejor performance
          const shouldRender = Math.abs(index - clampedIndex) <= 1;

          return (
            <div
              key={`${image.url}-${index}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-95 z-0'
              }`}
            >
              {shouldRender && (
                <>
                  {isVideoFile ? (
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[index] = el;
                      }}
                      src={image.url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload={isActive ? 'metadata' : 'none'}
                      poster={image.thumbnail}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoPause}
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.caption || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={isActive ? 'eager' : 'lazy'}
                    />
                  )}

                  {/* Gradiente solo si hay caption */}
                  {image.caption && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-20 pointer-events-none">
                        <p className="text-white text-sm font-medium">{image.caption}</p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* ARROWS - minimalistas */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full
              bg-black/40 backdrop-blur-sm
              flex items-center justify-center text-white/90
              active:scale-95 transition-all disabled:opacity-30
              hover:bg-black/60"
            >
              <FaChevronLeft size={14} />
            </button>

            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full
              bg-black/40 backdrop-blur-sm
              flex items-center justify-center text-white/90
              active:scale-95 transition-all disabled:opacity-30
              hover:bg-black/60"
            >
              <FaChevronRight size={14} />
            </button>
          </>
        )}

        {/* COUNTER - más discreto */}
        <div className="absolute top-2 right-2 z-30 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="text-white/90 text-xs font-medium">
            {clampedIndex + 1} / {safeImages.length}
          </span>
        </div>
      </div>

      {/* ===== THUMBNAILS - diseño más limpio ===== */}
      {safeImages.length > 1 && (
        <div
          className="flex gap-2 px-1 pt-3 pb-2 mt-2
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
                  w-14 h-14
                  rounded-lg overflow-hidden
                  transition-all duration-300
                  ${active ? 'opacity-100 scale-105' : 'opacity-50 scale-100'}
                  disabled:cursor-not-allowed
                  hover:opacity-100
                `}
                style={{
                  border: active
                    ? `2px solid ${accentColor}`
                    : '1px solid rgba(255,255,255,.08)',
                }}
              >
                {isVideoFile ? (
                  <>
                    <video
                      src={image.url}
                      className="w-full h-full object-cover object-center block"
                      preload="none"
                      poster={image.thumbnail}
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                        <FaPlay className="text-black text-[10px] ml-0.5" />
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
              </button>
            );
          })}
        </div>
      )}

      {/* ===== DOTS - más discretos ===== */}
      {safeImages.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {safeImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`rounded-full transition-all duration-300
                ${index === clampedIndex ? 'w-5 h-1.5' : 'w-1.5 h-1.5 opacity-30'}
              `}
              style={{ backgroundColor: accentColor }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
