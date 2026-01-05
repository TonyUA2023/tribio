import React, { useState, useEffect } from 'react';
import { Post, PostComment } from '@/types/post';
import PostCard from './PostCard';
import PostComments from './PostComments';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

interface PostFeedProps {
  accountSlug: string;
  initialPosts?: Post[];
  className?: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ accountSlug, initialPosts = [], className = '' }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialPosts.length === 0) {
      loadPosts();
    }
  }, []);

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

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadPosts(page + 1);
    }
  };

  const handleLikeToggle = (postId: number, liked: boolean, likesCount: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, has_liked: liked, likes_count: likesCount } : post
      )
    );
  };

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCommentAdded = (comment: PostComment) => {
    if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments_count: selectedPost.comments_count + 1,
        comments: [comment, ...(selectedPost.comments || [])],
      };
      setSelectedPost(updatedPost);

      // Update in posts list
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        )
      );
    }
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-white/40 text-lg">No hay publicaciones aún</div>
        <p className="text-white/30 text-sm mt-2">Próximamente verás contenido aquí</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            accountSlug={accountSlug}
            onLikeToggle={handleLikeToggle}
            onCommentClick={handleCommentClick}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl
                     font-semibold transition-all hover:scale-105 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && posts.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      )}

      {/* Comments modal */}
      {selectedPost && (
        <PostComments
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};

export default PostFeed;
