import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Story {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  views_count: number;
  created_at: string;
  expires_at: string;
  time_remaining: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  profileName?: string;
  onStoryChange?: (index: number) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex: initialIndex,
  onClose,
  profileName,
  onStoryChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStory = stories[currentIndex];
  const duration = currentStory?.media_type === 'video' ? 15000 : 5000; // 15s para video, 5s para imagen

  // Debug
  useEffect(() => {
    console.log('StoryViewer mounted', { stories, currentIndex, currentStory });
  }, []);

  // Prevenir scroll del body cuando el visor está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!currentStory) {
    console.error('No current story found!', { stories, currentIndex });
    onClose();
    return null;
  }

  // Registrar visualización
  useEffect(() => {
    if (currentStory) {
      fetch(`/api/stories/${currentStory.id}/view`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      }).catch(err => console.error('Error recording view:', err));
    }
  }, [currentStory?.id]);

  // Control de progreso
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const interval = 50; // Actualizar cada 50ms
    const increment = (interval / duration) * 100;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isPaused, duration]);

  // Navegación
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setProgress(0);
      onStoryChange?.(newIndex);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setProgress(0);
      onStoryChange?.(newIndex);
    }
  };

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Pausar/reanudar con clic
  const handlePress = () => setIsPaused(true);
  const handleRelease = () => setIsPaused(false);

  // Áreas de navegación (izquierda/derecha)
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.3; // 30% a cada lado

    if (x < threshold) {
      handlePrevious();
    } else if (x > rect.width - threshold) {
      handleNext();
    }
  };

  if (!currentStory) return null;

  const viewerContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent">
        {/* Progress bars */}
        <div className="flex gap-1 mb-3">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Profile info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
                {profileName?.slice(0, 2)?.toUpperCase() || 'MB'}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{profileName || 'Perfil'}</p>
              <p className="text-white/70 text-xs">{currentStory.time_remaining}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="relative w-full h-full max-w-[500px] max-h-[100vh] flex items-center justify-center cursor-pointer"
        onClick={handleAreaClick}
      >
        {currentStory.media_type === 'image' ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            muted
            onEnded={handleNext}
          />
        )}

        {/* Navigation buttons (desktop) */}
        <div className="hidden md:block">
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentIndex < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Caption & info */}
      {(currentStory.caption || currentStory.views_count > 0) && (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {currentStory.caption && (
            <p className="text-white text-sm mb-2 max-w-[500px] mx-auto">{currentStory.caption}</p>
          )}
          <div className="flex items-center gap-2 text-white/70 text-xs max-w-[500px] mx-auto">
            <Eye className="w-4 h-4" />
            <span>{currentStory.views_count} visualizaciones</span>
          </div>
        </div>
      )}

      {/* Paused indicator */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
            <div className="w-2 h-8 bg-white rounded-full mx-1 inline-block" />
            <div className="w-2 h-8 bg-white rounded-full mx-1 inline-block" />
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar en un portal para evitar problemas de z-index
  return typeof document !== 'undefined'
    ? createPortal(viewerContent, document.body)
    : null;
};
