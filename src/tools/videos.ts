/**
 * TikTok video tools.
 *
 * Endpoints:
 *   POST /v2/video/list/   — paginated list of user's public videos
 *   POST /v2/video/query/  — detailed info for specific video IDs
 *
 * Scope required: video.list
 */

import { tiktokPost } from "../client.js";
import type { VideoListResponse, VideoQueryResponse, Video } from "../types.js";

// All requestable fields for video objects
const ALL_VIDEO_FIELDS = [
  "id",
  "create_time",
  "cover_image_url",
  "share_url",
  "video_description",
  "duration",
  "height",
  "width",
  "title",
  "embed_html",
  "embed_link",
  "like_count",
  "comment_count",
  "share_count",
  "view_count",
].join(",");

function formatVideo(v: Video) {
  return {
    id: v.id,
    title: v.title || v.video_description || "(no title)",
    created: v.create_time
      ? new Date(v.create_time * 1000).toISOString()
      : undefined,
    duration_seconds: v.duration,
    views: v.view_count,
    likes: v.like_count,
    comments: v.comment_count,
    shares: v.share_count,
    share_url: v.share_url,
    cover_image: v.cover_image_url,
  };
}

/**
 * Get a paginated list of the user's public videos with engagement metrics.
 */
export async function getVideos(
  maxCount: number = 10,
  cursor?: number
): Promise<string> {
  const body: Record<string, unknown> = {
    max_count: Math.min(maxCount, 20),
  };

  if (cursor) {
    body.cursor = cursor;
  }

  const data = await tiktokPost<VideoListResponse>(
    "/v2/video/list/",
    body,
    { fields: ALL_VIDEO_FIELDS }
  );

  if (data.error?.code !== "ok") {
    throw new Error(
      `TikTok API error: ${data.error?.code} — ${data.error?.message}`
    );
  }

  const videos = (data.data.videos || []).map(formatVideo);

  return JSON.stringify(
    {
      videos,
      cursor: data.data.cursor,
      has_more: data.data.has_more,
      count: videos.length,
    },
    null,
    2
  );
}

/**
 * Get detailed info for specific video IDs (up to 20 at a time).
 */
export async function getVideoDetails(videoIds: string[]): Promise<string> {
  if (videoIds.length === 0) {
    throw new Error("At least one video ID is required.");
  }
  if (videoIds.length > 20) {
    throw new Error("Maximum 20 video IDs per request.");
  }

  const data = await tiktokPost<VideoQueryResponse>(
    "/v2/video/query/",
    { filters: { video_ids: videoIds } },
    { fields: ALL_VIDEO_FIELDS }
  );

  if (data.error?.code !== "ok") {
    throw new Error(
      `TikTok API error: ${data.error?.code} — ${data.error?.message}`
    );
  }

  const videos = (data.data.videos || []).map(formatVideo);

  return JSON.stringify(
    {
      videos,
      count: videos.length,
    },
    null,
    2
  );
}
