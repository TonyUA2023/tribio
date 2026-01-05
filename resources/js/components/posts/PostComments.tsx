import React, { useState } from 'react';
import { Post, PostComment } from '@/types/post';
import { FaReply, FaTimes } from 'react-icons/fa';
import axios from 'axios';

interface PostCommentsProps {
  post: Post;
  onClose: () => void;
  onCommentAdded?: (comment: PostComment) => void;
}

const PostComments: React.FC<PostCommentsProps> = ({ post, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !userName.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(`/api/posts/${post.id}/comments`, {
        user_name: userName,
        user_email: userEmail || null,
        comment: commentText,
        parent_id: replyingTo,
      });

      const newComment = response.data.data;

      if (replyingTo) {
        // Añadir respuesta al comentario padre
        setComments(
          comments.map((comment) =>
            comment.id === replyingTo
              ? { ...comment, replies: [...(comment.replies || []), newComment] }
              : comment
          )
        );
      } else {
        // Añadir comentario de nivel superior
        setComments([newComment, ...comments]);
      }

      // Limpiar formulario
      setCommentText('');
      setReplyingTo(null);

      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error al agregar comentario. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CommentItem: React.FC<{ comment: PostComment; isReply?: boolean }> = ({
    comment,
    isReply = false,
  }) => {
    const avatarUrl =
      comment.user_avatar ||
      comment.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        comment.user_name
      )}&background=9dc74a&color=1a5c3a`;

    return (
      <div className={`${isReply ? 'ml-12' : ''}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt={comment.user_name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/5 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{comment.user_name}</span>
                {comment.is_pinned && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-white/90 text-sm break-words">{comment.comment}</p>
            </div>

            {/* Comment actions */}
            <div className="flex items-center gap-4 mt-1 px-4">
              <span className="text-xs text-white/40">
                {new Date(comment.created_at).toLocaleDateString('es', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  <FaReply className="w-3 h-3" />
                  Responder
                </button>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-slate-900 w-full md:max-w-2xl md:rounded-t-3xl rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">
            Comentarios ({post.comments_count})
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">No hay comentarios aún</p>
              <p className="text-white/30 text-sm mt-1">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </div>

        {/* Comment form */}
        {post.comments_enabled && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 space-y-3">
            {replyingTo && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Respondiendo a comentario</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-white/80 hover:text-white"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            )}

            {!userName && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                           placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                           placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                         placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim() || !userName.trim()}
                className="bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a] px-6 py-2 rounded-xl
                         font-semibold hover:scale-105 active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostComments;
