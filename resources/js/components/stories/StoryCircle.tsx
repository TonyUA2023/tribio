import React, { useEffect, useState } from 'react';
import { StoryViewer } from './StoryViewer';

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

interface StoryCircleProps {
  profileId: number;
  logoUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onOpenStories?: () => void;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({
  profileId,
  logoUrl,
  name,
  size = 'md',
  className = '',
  onOpenStories,
}) => {
  const [hasStories, setHasStories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`/api/profiles/${profileId}/stories`);
        const data = await response.json();

        console.log('📖 Stories fetched:', data);

        if (data.success) {
          setHasStories(data.has_stories);
          setStories(data.data || []);
          console.log('✅ Stories loaded:', data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [profileId]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const innerSizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-[88px] h-[88px]',
    lg: 'w-[124px] h-[124px]',
  };

  const handleClick = () => {
    console.log('🔘 Circle clicked', { hasStories, storiesCount: stories.length, stories });
    if (hasStories) {
      setViewerOpen(true);
      onOpenStories?.();
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full border border-amber-500/30 p-1 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.2)] ${className}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            className="w-full h-full object-cover rounded-full"
            alt={name}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 text-2xl font-bold">
            {name?.slice(0, 2)?.toUpperCase() || 'MB'}
          </div>
        )}
      </div>
    );
  }

  if (!hasStories) {
    // No stories - show normal circle
    return (
      <div className={`${sizeClasses[size]} rounded-full border border-amber-500/30 p-1 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.2)] ${className}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            className="w-full h-full object-cover rounded-full"
            alt={name}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 text-2xl font-bold">
            {name?.slice(0, 2)?.toUpperCase() || 'MB'}
          </div>
        )}
      </div>
    );
  }

  // Has stories - show gradient border
  return (
    <>
      <button
        onClick={handleClick}
        className={`relative ${sizeClasses[size]} rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-[0_0_40px_rgba(251,191,36,0.4)] ${
          hasStories ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200' : ''
        } ${className}`}
        style={{
          background: 'linear-gradient(45deg, #fbbf24, #f97316, #ec4899, #a855f7, #6366f1)',
        }}
      >
        {/* Inner border (gap effect) */}
        <div className="w-full h-full rounded-full p-[3px] bg-slate-950">
          {/* Logo container */}
          <div className="w-full h-full rounded-full overflow-hidden bg-black/60 backdrop-blur-sm">
            {logoUrl ? (
              <img
                src={logoUrl}
                className="w-full h-full object-cover"
                alt={name}
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-amber-500 text-2xl font-bold">
                {name?.slice(0, 2)?.toUpperCase() || 'MB'}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Story Viewer Modal */}
      {viewerOpen && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          currentIndex={0}
          onClose={handleCloseViewer}
          profileName={name}
        />
      )}
    </>
  );
};
