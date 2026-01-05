import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { FaTimes, FaHeart, FaComment, FaShare, FaPlay, FaPause, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { BookingWidget } from '@/components/booking/BookingWidget';

interface Post {
  id: number;
  account_id: number;
  title: string | null;
  description: string | null;
  type: 'image' | 'video' | 'carousel';
  media: string[];
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_published: boolean;
  created_at: string;
  account?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface PageProps {
  accountSlug: string;
  initialPostIndex?: number;
  accentColor?: string;
  profileId?: number;
  businessName?: string;
  services?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

export default function PostsFeed({
  accountSlug,
  initialPostIndex = 0,
  accentColor = '#f59e0b',
  profileId,
  businessName = '',
  services = [],
  socialLinks
}: PageProps) {
  // Leer el índice de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const startIndex = parseInt(urlParams.get('index') || '0') || initialPostIndex;

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showBookingWidget, setShowBookingWidget] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  // Auto-open booking widget when showBookingWidget changes
  useEffect(() => {
    if (showBookingWidget) {
      // Esperar a que el widget se renderice
      const timer = setTimeout(() => {
        const bookingButton = document.querySelector('.booking-widget-trigger') as HTMLElement;
        if (bookingButton) {
          bookingButton.click();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showBookingWidget]);

  // Fetch posts
  useEffect(() => {
    loadPosts();
  }, [accountSlug]);

  // Scroll to initial post after posts load
  useEffect(() => {
    if (posts.length > 0 && scrollContainerRef.current && startIndex > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const scrollPosition = startIndex * window.innerHeight;
          scrollContainerRef.current.scrollTo({ top: scrollPosition, behavior: 'instant' });
        }
      }, 100);
    }
  }, [posts.length]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/${accountSlug}/posts?page=${page}`);

      if (response.data.success) {
        const newPosts = response.data.data.data || [];
        setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts]);
        setHasMore(response.data.data.current_page < response.data.data.last_page);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get full media URL
  const getMediaUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return path;
    return `/storage/${path}`;
  };

  // Auto-play video when in view
  useEffect(() => {
    const currentPost = posts[currentIndex];
    if (!currentPost) return;

    // Pause all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.pause();
    });

    // Play current video
    if (currentPost.type === 'video') {
      const video = videoRefs.current[currentPost.id];
      if (video) {
        video.play().catch(err => console.log('Video play failed:', err));
      }
    }
  }, [currentIndex, posts]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const newIndex = Math.round(scrollPosition / window.innerHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentIndex(newIndex);
    }

    // Load more when near end
    if (
      hasMore &&
      !isLoading &&
      element.scrollHeight - element.scrollTop <= element.clientHeight * 2
    ) {
      setPage(prev => prev + 1);
      loadPosts();
    }
  };

  // Handle like
  const handleLike = async (postId: number) => {
    try {
      await axios.post(`/api/posts/${postId}/like`);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle close
  const handleClose = () => {
    router.visit(`/${accountSlug}`);
  };

  // Handle CTA - Agendar Cita
  const handleBooking = () => {
    setShowBookingWidget(true);
  };

  // Handle comments
  const handleOpenComments = async (postId: number) => {
    setSelectedPostId(postId);
    setShowComments(true);
    setLoadingComments(true);

    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedPostId(null);
    setComments([]);
    setNewComment('');
    setUserName('');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userName.trim() || !selectedPostId) return;

    try {
      const response = await axios.post(`/api/posts/${selectedPostId}/comments`, {
        comment: newComment,
        user_name: userName.trim()
      });

      if (response.data.success) {
        setComments(prev => [...prev, response.data.data]);
        setNewComment('');
        // Mantener el nombre para futuros comentarios
        // setUserName('');

        // Actualizar el contador de comentarios en el post
        setPosts(prev => prev.map(post =>
          post.id === selectedPostId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head title={`Posts - ${accountSlug}`} />

      <div
        className="fixed inset-0 bg-black"
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 9999
        }}
      >
        {/* Header con CTA */}
        <div
          className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between"
        >
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Botón CTA - Agendar Cita */}
          <button
            onClick={handleBooking}
            className="px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg"
            style={{
              backgroundColor: accentColor,
              color: '#fff'
            }}
          >
            <FaClock className="w-4 h-4" />
            Agendar Cita
          </button>
        </div>

        {/* Posts Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto snap-y snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="relative w-full snap-start snap-always"
              style={{
                height: '100vh',
                minHeight: '100vh'
              }}
            >
              {/* Media */}
              {post.type === 'video' ? (
                <video
                  ref={(el) => { videoRefs.current[post.id] = el; }}
                  src={getMediaUrl(post.media[0])}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  playsInline
                  muted={false}
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

              {/* Actions Sidebar - Estilo TikTok */}
              <div className="absolute right-2 bottom-32 flex flex-col gap-4 z-10">
                {/* Like */}
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex flex-col items-center gap-1 text-white transition-all active:scale-90"
                >
                  <div className="w-14 h-14 flex items-center justify-center">
                    <FaHeart
                      className="w-8 h-8 drop-shadow-lg"
                      style={{
                        color: accentColor,
                        filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md">{post.likes_count}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => handleOpenComments(post.id)}
                  className="flex flex-col items-center gap-1 text-white transition-all active:scale-90"
                >
                  <div className="w-14 h-14 flex items-center justify-center">
                    <FaComment
                      className="w-7 h-7 drop-shadow-lg"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md">{post.comments_count}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-1 text-white transition-all active:scale-90">
                  <div className="w-14 h-14 flex items-center justify-center">
                    <FaShare
                      className="w-7 h-7 drop-shadow-lg"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold drop-shadow-md">{post.shares_count || 0}</span>
                </button>
              </div>

              {/* Post Info */}
              <div className="absolute bottom-0 left-0 right-20 p-4 pb-8 text-white z-10">
                {/* Account */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg font-bold">
                      {post.account?.name?.charAt(0) || accountSlug.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="font-bold text-lg">{post.account?.name || accountSlug}</span>
                </div>

                {/* Title & Description */}
                {post.title && (
                  <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                )}
                {post.description && (
                  <p className="text-sm leading-relaxed opacity-90 line-clamp-3">
                    {post.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Loading More */}
          {isLoading && posts.length > 0 && (
            <div className="h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-1 z-10">
          {posts.map((_, index) => (
            <div
              key={index}
              className="w-1 h-1 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? accentColor : 'rgba(255,255,255,0.3)',
                height: index === currentIndex ? '16px' : '4px'
              }}
            />
          ))}
        </div>

        {/* Hide scrollbar */}
        <style>{`
          .snap-y::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Booking Widget - Siempre renderizado pero oculto cuando no se necesita */}
      {profileId && (
        <div style={{
          visibility: showBookingWidget ? 'visible' : 'hidden',
          position: showBookingWidget ? 'relative' : 'absolute',
          pointerEvents: showBookingWidget ? 'auto' : 'none'
        }}>
          <BookingWidget
            config={{
              profileId,
              businessName,
              services,
              accentColor,
              socialLinks
            }}
            className=""
          />
        </div>
      )}

      {/* Comments Panel - Estilo TikTok */}
      {showComments && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
          onClick={handleCloseComments}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black rounded-t-3xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-bold text-lg">
                {comments.length} {comments.length === 1 ? 'Comentario' : 'Comentarios'}
              </h3>
              <button
                onClick={handleCloseComments}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaComment className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay comentarios aún</p>
                  <p className="text-sm">Sé el primero en comentar</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-800/50 rounded-2xl px-4 py-3">
                        <p className="text-white font-semibold text-sm mb-1">
                          {comment.user_name || 'Usuario'}
                        </p>
                        <p className="text-gray-200 text-sm">{comment.comment}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 px-4">
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-800 bg-black space-y-3">
              {/* Nombre del usuario */}
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': accentColor
                  } as React.CSSProperties}
                />
              </div>

              {/* Comentario */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full px-4 py-3 rounded-2xl bg-gray-800 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all"
                    style={{
                      '--tw-ring-color': accentColor
                    } as React.CSSProperties}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || !userName.trim()}
                  className="px-6 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: (newComment.trim() && userName.trim()) ? accentColor : '#374151',
                    color: '#fff'
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
