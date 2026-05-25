#!/usr/bin/env node

/**
 * TikTok Organic MCP Server
 *
 * Provides organic analytics for TikTok accounts:
 *   - Profile info and follower stats
 *   - Video listing with engagement metrics
 *   - Per-video performance details
 *   - Token refresh utility
 *
 * Part of The SEO Engine toolkit by Lantern Row.
 * https://lanternrow.com
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { getUserInfo } from "./tools/user.js";
import { getVideos, getVideoDetails } from "./tools/videos.js";
import { refreshToken } from "./tools/utils.js";

const server = new McpServer({
  name: "tiktok-organic-mcp",
  version: "1.0.0",
});

// ─── Helper ───────────────────────────────────────────────────────

function wrapHandler(fn: () => Promise<string>) {
  return async () => {
    try {
      const text = await fn();
      return { content: [{ type: "text" as const, text }] };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
    }
  };
}

// ─── Tools ────────────────────────────────────────────────────────

// 1. get_user_info
server.tool(
  "get_user_info",
  "Get the authenticated TikTok user's profile info: username, bio, follower/following counts, total likes, video count, and verification status.",
  {},
  wrapHandler(() => getUserInfo())
);

// 2. get_videos
server.tool(
  "get_videos",
  "Get a paginated list of the user's public TikTok videos with engagement metrics (views, likes, comments, shares). Returns up to 20 videos per page.",
  {
    max_count: z
      .number()
      .min(1)
      .max(20)
      .default(10)
      .describe("Number of videos to return (1-20, default 10)"),
    cursor: z
      .number()
      .optional()
      .describe(
        "Pagination cursor (UTC Unix timestamp in ms). Pass the cursor from the previous response to get the next page."
      ),
  },
  async (args) => {
    try {
      const text = await getVideos(args.max_count, args.cursor);
      return { content: [{ type: "text" as const, text }] };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
    }
  }
);

// 3. get_video_details
server.tool(
  "get_video_details",
  "Get detailed performance metrics for specific TikTok videos by ID. Returns views, likes, comments, shares, duration, and more. Max 20 video IDs per request.",
  {
    video_ids: z
      .array(z.string())
      .min(1)
      .max(20)
      .describe("Array of TikTok video IDs to query (max 20)"),
  },
  async (args) => {
    try {
      const text = await getVideoDetails(args.video_ids);
      return { content: [{ type: "text" as const, text }] };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
    }
  }
);

// 4. refresh_token
server.tool(
  "refresh_token",
  "Refresh the TikTok access token using the stored refresh token. Returns new access and refresh tokens. Requires TIKTOK_CLIENT_KEY and TIKTOK_REFRESH_TOKEN env vars.",
  {},
  wrapHandler(() => refreshToken())
);

// ─── Start ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TikTok Organic MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
