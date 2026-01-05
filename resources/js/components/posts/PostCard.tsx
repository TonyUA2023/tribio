import React, { useState } from 'react';
import { Post } from '@/types/post';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaPlay } from 'react-icons/fa';
import axios from 'axios';

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: number, liked: boolean, likesCount: number) => void;
  onCommentClick?: (post: Post) => void;
  accountSlug: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikeToggle,
  onCommentClick,
  accountSlug,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [liked, setLiked] = useState(post.has_liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = liked;
    const previousCount = likesCount;

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await axios.post(`/api/posts/${post.id}/like`);
      const { liked: newLiked, likesCount: newCount } = response.data.data;

      setLiked(newLiked);
      setLikesCount(newCount);

      if (onLikeToggle) {
        onLikeToggle(post.id, newLiked, newCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`/api/posts/${post.id}/share`);

      if (navigator.share) {
        await navigator.share({
          title: post.title || `Publicación de ${post.account?.name}`,
          text: post.description,
          url: window.location.origin + `/${accountSlug}#post-${post.id}`,
        });
      } else {
        // Fallback: copiar al portapapeles
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
    return `/storage/${mediaPath}`;
  };

  const isVideo = post.type === 'video' || post.media[currentMediaIndex]?.includes('.mp4');

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      {/* Media Section */}
      <div className="relative aspect-square bg-black">
        {isVideo ? (
          <video
            src={getMediaUrl(post.media[currentMediaIndex])}
            className="w-full h-full object-cover"
            controls
            playsInline
            poster={post.thumbnail_url ? getMediaUrl(post.thumbnail_url) : undefined}
          />
        ) : (
          <img
            src={getMediaUrl(post.media[currentMediaIndex])}
            alt={post.title || 'Post media'}
            className="w-full h-full object-cover"
          />
        )}

        {/* Carousel indicators */}
        {post.media.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {post.media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMediaIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentMediaIndex
                    ? 'w-8 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Video indicator */}
        {post.type === 'video' && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
            <FaPlay className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 group transition-all"
          >
            {liked ? (
              <FaHeart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
            ) : (
              <FaRegHeart className="w-6 h-6 text-white/70 group-hover:text-red-500 group-hover:scale-110 transition-all" />
            )}
            <span className="text-white/90 font-semibold">{likesCount}</span>
          </button>

          {/* Comment button */}
          {post.comments_enabled && (
            <button
              onClick={() => onCommentClick && onCommentClick(post)}
              className="flex items-center gap-2 group transition-all"
            >
              <FaComment className="w-6 h-6 text-white/70 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
              <span className="text-white/90 font-semibold">{post.comments_count}</span>
            </button>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 group transition-all ml-auto"
          >
            <FaShare className="w-5 h-5 text-white/70 group-hover:text-green-400 group-hover:scale-110 transition-all" />
            <span className="text-white/90 font-semibold">{post.shares_count}</span>
          </button>
        </div>

        {/* Title and Description */}
        {(post.title || post.description) && (
          <div className="space-y-1">
            {post.title && (
              <h3 className="text-white font-bold text-lg">{post.title}</h3>
            )}
            {post.description && (
              <p className="text-white/70 text-sm line-clamp-3">{post.description}</p>
            )}
          </div>
        )}

        {/* Preview comments */}
        {post.comments && post.comments.length > 0 && (
          <div className="space-y-2 pt-2">
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="text-white/90 font-semibold">{comment.user_name}</span>
                {' '}
                <span className="text-white/70">{comment.comment}</span>
              </div>
            ))}
            {post.comments_count > 2 && (
              <button
                onClick={() => onCommentClick && onCommentClick(post)}
                className="text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Ver los {post.comments_count} comentarios
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-white/40 text-xs">
          {new Date(post.created_at).toLocaleDateString('es', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
