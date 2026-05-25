/**
 * TikTok user/profile tools.
 *
 * Endpoints:
 *   GET /v2/user/info/  — profile metadata + stats
 *
 * Scopes required: user.info.basic, user.info.profile, user.info.stats
 */

import { tiktokGet } from "../client.js";
import type { UserInfoResponse } from "../types.js";

// All requestable fields across the three user.info.* scopes
const ALL_USER_FIELDS = [
  "open_id",
  "union_id",
  "display_name",
  "avatar_url",
  "avatar_url_100",
  "avatar_large_url",
  "bio_description",
  "is_verified",
  "username",
  "profile_deep_link",
  "follower_count",
  "following_count",
  "likes_count",
  "video_count",
].join(",");

/**
 * Get the authenticated user's profile info and stats.
 */
export async function getUserInfo(): Promise<string> {
  const data = await tiktokGet<UserInfoResponse>("/v2/user/info/", {
    fields: ALL_USER_FIELDS,
  });

  if (data.error?.code !== "ok") {
    throw new Error(
      `TikTok API error: ${data.error?.code} — ${data.error?.message}`
    );
  }

  const user = data.data.user;

  return JSON.stringify(
    {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio_description,
      is_verified: user.is_verified,
      profile_url: user.profile_deep_link,
      avatar_url: user.avatar_url,
      follower_count: user.follower_count,
      following_count: user.following_count,
      total_likes: user.likes_count,
      video_count: user.video_count,
    },
    null,
    2
  );
}
