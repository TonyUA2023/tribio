import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/types/post';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaPlay, FaPause } from 'react-icons/fa';
import axios from 'axios';

interface PostFeedVerticalProps {
  accountSlug: string;
  initialPosts?: Post[];
}

const PostFeedVertical: React.FC<PostFeedVerticalProps> = ({ accountSlug, initialPosts = [] }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    if (initialPosts.length === 0) {
      loadPosts();
    }
  }, []);

  // Auto-play video cuando está visible
  useEffect(() => {
    const currentVideo = videoRefs.current[posts[currentIndex]?.id];
    if (currentVideo && posts[currentIndex]?.type === 'video') {
      currentVideo.play().catch(() => {});
    }

    // Pausar otros videos
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (video && parseInt(id) !== posts[currentIndex]?.id) {
        video.pause();
      }
    });
  }, [currentIndex, posts]);

  const loadPosts = async (pageNum = 1) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await axios.get(`/api/${accountSlug}/posts?page=${pageNum}`);
      const newPosts = response.data.data.data;

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts([...posts, ...newPosts]);
      }

      setHasMore(response.data.data.next_page_url !== null);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const itemHeight = element.scrollHeight / posts.length;
    const newIndex = Math.round(scrollPosition / itemHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentIndex(newIndex);
    }

    // Cargar más cuando llegue al final
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight * 1.5 &&
      hasMore &&
      !isLoading
    ) {
      loadPosts(page + 1);
    }
  };

  const handleLike = async (post: Post) => {
    const previousLiked = post.has_liked;
    const previousCount = post.likes_count;

    // Optimistic update
    setPosts(
      posts.map((p) =>
        p.id === post.id
          ? { ...p, has_liked: !p.has_liked, likes_count: p.has_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );

    try {
      const response = await axios.post(`/api/posts/${post.id}/like`);
      const { liked, likesCount } = response.data.data;

      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, has_liked: liked, likes_count: likesCount } : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, has_liked: previousLiked, likes_count: previousCount } : p
        )
      );
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await axios.post(`/api/posts/${post.id}/share`);

      if (navigator.share) {
        await navigator.share({
          title: post.title || `Publicación de ${post.account?.name}`,
          text: post.description,
          url: window.location.origin + `/${accountSlug}#post-${post.id}`,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.origin + `/${accountSlug}#post-${post.id}`
        );
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getMediaUrl = (mediaPath: string) => {
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    return `/uploaded_files/${mediaPath}`;
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 text-lg">No hay publicaciones aún</p>
      </div>
    );
  }

  return (
    <div
      className="h-[600px] overflow-y-auto snap-y snap-mandatory scrollbar-hide relative"
      onScroll={handleScroll}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          id={`post-${post.id}`}
          className="h-[600px] snap-start snap-always relative flex items-center justify-center bg-black"
        >
          {/* Media */}
          {post.type === 'video' ? (
            <video
              ref={(el) => (videoRefs.current[post.id] = el)}
              src={getMediaUrl(post.media[0])}
              className="w-full h-full object-contain"
              loop
              playsInline
              muted
              poster={post.thumbnail_url ? getMediaUrl(post.thumbnail_url) : undefined}
            />
          ) : (
            <img
              src={getMediaUrl(post.media[0])}
              alt={post.title || 'Post'}
              className="w-full h-full object-contain"
            />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 text-white">
            {/* Account info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg font-bold">
                  {post.account?.name?.charAt(0) || '?'}
                </div>
              </div>
              <span className="font-semibold">{post.account?.name}</span>
            </div>

            {/* Title & Description */}
            {post.title && (
              <h3 className="font-bold text-lg mb-1">{post.title}</h3>
            )}
            {post.description && (
              <p className="text-sm text-white/90 line-clamp-3 mb-2">
                {post.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span>{post.views_count} vistas</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString('es')}</span>
            </div>
          </div>

          {/* Action Buttons (Right side) */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-6">
            {/* Like button */}
            <button
              onClick={() => handleLike(post)}
              className="flex flex-col items-center gap-1"
            >
              {post.has_liked ? (
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FaHeart className="w-7 h-7 text-red-500" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <FaRegHeart className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-xs text-white font-semibold">
                {post.likes_count > 999 ? `${(post.likes_count / 1000).toFixed(1)}k` : post.likes_count}
              </span>
            </button>

            {/* Comment button */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <FaComment className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white font-semibold">
                {post.comments_count > 999 ? `${(post.comments_count / 1000).toFixed(1)}k` : post.comments_count}
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={() => handleShare(post)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <FaShare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white font-semibold">
                {post.shares_count > 999 ? `${(post.shares_count / 1000).toFixed(1)}k` : post.shares_count}
              </span>
            </button>
          </div>

          {/* Carousel indicators */}
          {post.media.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
              {post.media.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === 0 ? 'w-8 bg-white' : 'w-1 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="h-[600px] snap-start flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PostFeedVertical;
