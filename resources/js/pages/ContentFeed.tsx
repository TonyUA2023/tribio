import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaHeart, FaEye, FaStar, FaShoppingBag, FaCalendarCheck, FaComment, FaTimes } from 'react-icons/fa';
import { router } from '@inertiajs/react';

interface Account {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    cover: string | null;
    bio: string | null;
}

interface Comment {
    id: number;
    user_name: string;
    content: string;
    created_at: string;
}

interface Post {
    id: number;
    title: string;
    description: string | null;
    media_type: 'image' | 'video';
    media_url: string;
    likes_count: number;
    comments_count: number;
    views_count: number;
    created_at: string;
    comments?: Comment[];
}

interface Stats {
    total_likes: number;
    total_orders: number;
    total_bookings: number;
    average_rating: number;
    total_views: number;
    total_posts: number;
}

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ContentFeedProps {
    account: Account;
    posts: PaginatedPosts;
    stats: Stats;
}

const ContentFeed: React.FC<ContentFeedProps> = ({ account, posts: initialPosts, stats }) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts.data);
    const [currentPage, setCurrentPage] = useState(initialPosts.current_page);
    const [hasMore, setHasMore] = useState(initialPosts.current_page < initialPosts.last_page);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Cargar más posts
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/${account.slug}/content/load-more?page=${currentPage + 1}`);
            const data = await response.json();

            if (data.success && data.data.data.length > 0) {
                setPosts(prev => [...prev, ...data.data.data]);
                setCurrentPage(data.data.current_page);
                setHasMore(data.data.current_page < data.data.last_page);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, currentPage, account.slug]);

    // Toggle like
    const toggleLike = async (postId: number) => {
        try {
            const response = await fetch(`/api/content/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? { ...post, likes_count: data.likes_count }
                        : post
                ));

                setLikedPosts(prev => {
                    const newSet = new Set(prev);
                    if (data.liked) {
                        newSet.add(postId);
                    } else {
                        newSet.delete(postId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Incrementar vistas cuando un post es visible
    const incrementView = async (postId: number) => {
        try {
            await fetch(`/api/content/posts/${postId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
                }
            });
        } catch (error) {
            console.error('Error incrementing view:', error);
        }
    };

    // Intersection Observer para scroll infinito y vistas
    useEffect(() => {
        if (!containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        setActiveIndex(index);

                        const postId = parseInt(entry.target.getAttribute('data-post-id') || '0');
                        if (postId) {
                            incrementView(postId);
                        }

                        // Cargar más si estamos cerca del final
                        if (index >= posts.length - 2 && hasMore && !loading) {
                            loadMore();
                        }
                    }
                });
            },
            {
                threshold: 0.75,
                root: containerRef.current
            }
        );

        // Observar todos los posts
        const postElements = containerRef.current.querySelectorAll('[data-post]');
        postElements.forEach(el => observerRef.current?.observe(el));

        return () => {
            observerRef.current?.disconnect();
        };
    }, [posts, hasMore, loading, loadMore]);

    const goBack = () => {
        router.visit(`/${account.slug}`);
    };

    return (
        <>
            <Head title={`${account.name} - Contenido`} />

            <div className="fixed inset-0 bg-black">
                {/* Header simple */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-safe">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={goBack}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            {account.logo && (
                                <img
                                    src={account.logo}
                                    alt={account.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                />
                            )}
                            <div>
                                <h1 className="text-white font-bold text-base">{account.name}</h1>
                                <p className="text-white/70 text-xs">{stats.total_posts} publicaciones</p>
                            </div>
                        </div>

                        <div className="w-10" /> {/* Spacer para centrar */}
                    </div>
                </div>

                {/* Posts container */}
                <div
                    ref={containerRef}
                    className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {posts.map((post, index) => (
                        <TikTokPost
                            key={post.id}
                            post={post}
                            index={index}
                            isActive={index === activeIndex}
                            isLiked={likedPosts.has(post.id)}
                            onLike={() => toggleLike(post.id)}
                        />
                    ))}

                    {loading && (
                        <div className="h-screen flex items-center justify-center snap-start">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                    )}

                    {!hasMore && posts.length > 0 && (
                        <div className="h-screen flex items-center justify-center snap-start">
                            <div className="text-center text-white/60">
                                <p className="text-lg font-medium">¡Has visto todo!</p>
                                <p className="text-sm mt-2">No hay más publicaciones</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

interface TikTokPostProps {
    post: Post;
    index: number;
    isActive: boolean;
    isLiked: boolean;
    onLike: () => void;
}

const TikTokPost: React.FC<TikTokPostProps> = ({ post, index, isActive, isLiked, onLike }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [loadingComments, setLoadingComments] = useState(false);

    // Auto-play/pause video cuando el post está activo
    useEffect(() => {
        if (!videoRef.current || post.media_type !== 'video') return;

        if (isActive) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                setIsPlaying(false);
            });
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, post.media_type]);

    // Cargar comentarios cuando se abre el drawer
    useEffect(() => {
        if (showComments && comments.length === 0 && !loadingComments) {
            loadComments();
        }
    }, [showComments]);

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`);
            const data = await response.json();
            if (data.success) {
                setComments(data.data || []);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const togglePlayPause = () => {
        if (!videoRef.current || post.media_type !== 'video') return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div
            data-post
            data-index={index}
            data-post-id={post.id}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black"
        >
            {/* Media (video o imagen) */}
            {post.media_type === 'video' ? (
                <video
                    ref={videoRef}
                    src={post.media_url}
                    className="w-full h-full object-contain"
                    loop
                    playsInline
                    onClick={togglePlayPause}
                />
            ) : (
                <img
                    src={post.media_url}
                    alt={post.title}
                    className="w-full h-full object-contain"
                />
            )}

            {/* Play/Pause indicator */}
            {post.media_type === 'video' && (
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Información del post (abajo a la izquierda) */}
            <div className="absolute bottom-20 left-0 right-0 px-4 pb-safe">
                <div className="max-w-[70%]">
                    <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">
                        {post.title}
                    </h3>
                    {post.description && (
                        <p className="text-white/90 text-sm line-clamp-3 drop-shadow-lg">
                            {post.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Acciones (derecha) */}
            <div className="absolute bottom-32 right-4 flex flex-col items-center gap-6 pb-safe">
                {/* Like button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onLike}
                    className="flex flex-col items-center gap-1"
                >
                    <motion.div
                        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isLiked
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 backdrop-blur-md text-white'
                        } drop-shadow-lg`}
                    >
                        <FaHeart className="w-6 h-6" />
                    </motion.div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                        {post.likes_count.toLocaleString()}
                    </span>
                </motion.button>

                {/* Comments button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowComments(true)}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center drop-shadow-lg text-white">
                        <FaComment className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                        {post.comments_count.toLocaleString()}
                    </span>
                </motion.button>

                {/* Views */}
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center drop-shadow-lg">
                        <FaEye className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                        {post.views_count.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Drawer de comentarios */}
            <AnimatePresence>
                {showComments && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowComments(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#18181b] rounded-t-3xl z-40"
                            style={{ maxHeight: '60vh' }}
                        >
                            {/* Header del drawer */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="text-white font-bold text-lg">
                                    Comentarios ({post.comments_count})
                                </h3>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Lista de comentarios */}
                            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(60vh - 80px)' }}>
                                {loadingComments ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                {comment.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-white/5 rounded-2xl px-4 py-2">
                                                    <p className="text-white font-semibold text-sm mb-1">
                                                        {comment.user_name}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                                <p className="text-gray-500 text-xs mt-1 ml-4">
                                                    {new Date(comment.created_at).toLocaleDateString('es', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-white/40">
                                        <FaComment className="w-12 h-12 mb-3" />
                                        <p className="text-sm">No hay comentarios aún</p>
                                        <p className="text-xs mt-1">Sé el primero en comentar</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContentFeed;
