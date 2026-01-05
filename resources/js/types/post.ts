export interface Post {
  id: number;
  account_id: number;
  title?: string;
  description?: string;
  type: 'image' | 'video' | 'carousel';
  media: string[];
  thumbnail_url?: string;
  duration?: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  comments_enabled: boolean;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  has_liked?: boolean;
  account?: {
    id: number;
    name: string;
    slug: string;
  };
  comments?: PostComment[];
}

export interface PostComment {
  id: number;
  post_id: number;
  parent_id?: number;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  comment: string;
  likes_count: number;
  is_approved: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  replies?: PostComment[];
  avatar_url?: string;
}

export interface PostLike {
  id: number;
  post_id: number;
  user_identifier: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}
