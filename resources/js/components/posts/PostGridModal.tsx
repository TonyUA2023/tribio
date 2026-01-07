import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/types/post';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaPlay, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

interface PostGridModalProps {
  accountSlug: string;
  accentColor?: string;
  ctaButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const PostGridModal: React.FC<PostGridModalProps> = ({
  accountSlug,
  accentColor = '#22d3ee',
  ctaButton,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  // Auto-play video cuando está visible en el modal
  useEffect(() => {
    if (selectedIndex !== null) {
      const currentVideo = videoRefs.current[posts[selectedIndex]?.id];
      if (currentVideo && posts[selectedIndex]?.type === 'video') {
        currentVideo.play().catch(() => {});
      }

      // Pausar otros videos
      Object.entries(videoRefs.current).forEach(([id, video]) => {
        if (video && parseInt(id) !== posts[selectedIndex]?.id) {
          video.pause();
        }
      });
    }
  }, [selectedIndex, posts]);

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

  const handlePostClick = (index: number) => {
    // Redirigir a la página de posts con el índice del post seleccionado
    window.location.href = `/${accountSlug}/posts?index=${index}`;
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);

    // Restore scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // Pausar todos los videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.pause();
    });
  };

  const handleNextPost = () => {
    if (selectedIndex !== null && selectedIndex < posts.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);

      // Scroll to next post
      if (modalScrollRef.current) {
        const scrollPosition = newIndex * window.innerHeight;
        modalScrollRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }

      // Cargar más si estamos cerca del final
      if (newIndex >= posts.length - 3 && hasMore && !isLoading) {
        loadPosts(page + 1);
      }
    }
  };

  const handlePrevPost = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);

      // Scroll to previous post
      if (modalScrollRef.current) {
        const scrollPosition = newIndex * window.innerHeight;
        modalScrollRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const itemHeight = element.scrollHeight / posts.length;
    const newIndex = Math.round(scrollPosition / itemHeight);

    if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < posts.length) {
      setSelectedIndex(newIndex);
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

  const getThumbnail = (post: Post): string => {
    if (post.thumbnail_url) {
      return getMediaUrl(post.thumbnail_url);
    }
    return getMediaUrl(post.media[0]);
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 text-lg">No hay publicaciones aún</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de 3 columnas con thumbnails */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post, index) => (
          <button
            key={post.id}
            onClick={() => handlePostClick(index)}
            className="relative aspect-square bg-black overflow-hidden group"
          >
            {/* Thumbnail */}
            {post.type === 'video' ? (
              <>
                <img
                  src={getThumbnail(post)}
                  alt={post.title || 'Post'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <FaPlay className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={getMediaUrl(post.media[0])}
                alt={post.title || 'Post'}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay con stats al hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <FaHeart className="w-5 h-5" />
                <span className="font-semibold">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaComment className="w-5 h-5" />
                <span className="font-semibold">{post.comments_count}</span>
              </div>
            </div>

            {/* Indicador de carousel */}
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{post.media.length}</span>
                </div>
              </div>
            )}
          </button>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="aspect-square bg-black/20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Modal Full-Screen con Feed Vertical */}
      {selectedIndex !== null && (
        <div
          className="fixed bg-black"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            maxHeight: '100dvh',
            zIndex: 999999,
            overflow: 'hidden'
          }}
        >
          {/* Header con botón CTA */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between" style={{ zIndex: 1000000 }}>
            <button
              onClick={handleCloseModal}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {ctaButton && (
              <button
                onClick={ctaButton.onClick}
                className="px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                {ctaButton.icon}
                {ctaButton.label}
              </button>
            )}
          </div>

          {/* Feed Vertical Scrollable */}
          <div
            ref={modalScrollRef}
            className="overflow-y-auto snap-y snap-mandatory scrollbar-hide"
            onScroll={handleModalScroll}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              maxHeight: '100dvh',
              overflowX: 'hidden'
            }}
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="relative snap-start snap-always"
                style={{
                  width: '100%',
                  height: '100vh',
                  maxHeight: '100dvh',
                  minHeight: '100vh',
                  position: 'relative'
                }}
              >
                {/* Media - Ocupa TODA la pantalla */}
                {post.type === 'video' ? (
                  <video
                    ref={(el) => { videoRefs.current[post.id] = el; }}
                    src={getMediaUrl(post.media[0])}
                    className="object-cover"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      maxHeight: '100dvh',
                      objectFit: 'cover'
                    }}
                    loop
                    playsInline
                    poster={post.thumbnail_url ? getMediaUrl(post.thumbnail_url) : undefined}
                    onClick={(e) => {
                      const video = e.currentTarget;
                      if (video.paused) {
                        video.play();
                      } else {
                        video.pause();
                      }
                    }}
                  />
                ) : (
                  <img
                    src={getMediaUrl(post.media[0])}
                    alt={post.title || 'Post'}
                    className="object-cover"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      maxHeight: '100dvh',
                      objectFit: 'cover'
                    }}
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 text-white">
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
                  {post.title && <h3 className="font-bold text-lg mb-1">{post.title}</h3>}
                  {post.description && (
                    <p className="text-sm text-white/90 line-clamp-3 mb-2">{post.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>{post.views_count} vistas</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString('es')}</span>
                  </div>
                </div>

                {/* Action Buttons (Right side) */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                  {/* Like button */}
                  <button onClick={() => handleLike(post)} className="flex flex-col items-center gap-1">
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
                  <button onClick={() => handleShare(post)} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <FaShare className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-white font-semibold">
                      {post.shares_count > 999 ? `${(post.shares_count / 1000).toFixed(1)}k` : post.shares_count}
                    </span>
                  </button>
                </div>

                {/* Navigation Arrows (desktop) */}
                {index > 0 && (
                  <button
                    onClick={handlePrevPost}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <FaChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {index < posts.length - 1 && (
                  <button
                    onClick={handleNextPost}
                    className="hidden md:flex absolute right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <FaChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="h-screen snap-start flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Estilos adicionales para forzar fullscreen real */}
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default PostGridModal;
