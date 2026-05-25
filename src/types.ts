/**
 * TypeScript types for TikTok API responses
 * used by the TikTok Organic MCP server.
 *
 * Based on TikTok Developer API v2:
 *   https://developers.tiktok.com/doc/tiktok-api-scopes
 */

// ─── API Error ────────────────────────────────────────────────────

export interface TikTokError {
  code: string;
  message: string;
  log_id?: string;
}

// ─── User Info ────────────────────────────────────────────────────

export interface UserInfo {
  open_id: string;
  union_id?: string;
  display_name?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  bio_description?: string;
  is_verified?: boolean;
  username?: string;
  profile_deep_link?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

export interface UserInfoResponse {
  data: {
    user: UserInfo;
  };
  error: TikTokError;
}

// ─── Video ────────────────────────────────────────────────────────

export interface Video {
  id: string;
  create_time?: number;
  cover_image_url?: string;
  share_url?: string;
  video_description?: string;
  duration?: number;
  height?: number;
  width?: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

export interface VideoListResponse {
  data: {
    videos: Video[];
    cursor: number;
    has_more: boolean;
  };
  error: TikTokError;
}

export interface VideoQueryResponse {
  data: {
    videos: Video[];
  };
  error: TikTokError;
}

// ─── Token ────────────────────────────────────────────────────────

export interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
}
