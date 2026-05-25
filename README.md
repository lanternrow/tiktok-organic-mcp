# tiktok-organic-mcp

[![npm version](https://img.shields.io/npm/v/tiktok-organic-mcp.svg)](https://www.npmjs.com/package/tiktok-organic-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **TikTok organic analytics** — video performance, engagement metrics, and profile insights via the TikTok Developer API.

Built for [Claude Code](https://claude.ai/claude-code) and any MCP-compatible AI tool. Gives your AI assistant direct access to your TikTok account data — videos, views, likes, comments, shares, and follower stats.

Part of **[The SEO Engine](https://lanternrow.com)** toolkit by [Lantern Row](https://lanternrow.com) — AI-powered SEO and social media tooling for agencies and businesses.

## Why this exists

- **No open-source TikTok organic MCP existed.** Ads MCPs exist. Organic analytics? Nobody built one.
- **Paid alternatives cost money.** The commercial options require monthly subscriptions. This is free and open source.
- **Your AI should see your TikTok data.** Ask "how are my TikTok videos performing?" and get a real answer.

## Quick start

### Option 1: npx (no install)

```json
{
  "mcpServers": {
    "tiktok-organic": {
      "command": "npx",
      "args": ["-y", "tiktok-organic-mcp"],
      "env": {
        "TIKTOK_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Option 2: Clone and build

```bash
git clone https://github.com/lanternrow/tiktok-organic-mcp.git
cd tiktok-organic-mcp
npm install
npm run build
```

Then add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "tiktok-organic": {
      "command": "node",
      "args": ["/path/to/tiktok-organic-mcp/dist/index.js"],
      "env": {
        "TIKTOK_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

## Getting your TikTok Access Token

### Step 1: Create a TikTok Developer App

1. Go to the [TikTok Developer Portal](https://developers.tiktok.com/) and log in
2. Click **Manage apps** → **Connect an app**
3. Fill in your app details and submit for review

### Step 2: Add Login Kit and request scopes

1. In your app dashboard, add the **Login Kit** product
2. Request these scopes:
   - `user.info.basic` — profile name, avatar
   - `user.info.profile` — bio, verification status
   - `user.info.stats` — follower/following counts, total likes
   - `video.list` — access to video listing and metrics

### Step 3: Complete the OAuth flow

1. Direct users to TikTok's authorization URL:
   ```
   https://www.tiktok.com/v2/auth/authorize/
     ?client_key={your_client_key}
     &scope=user.info.basic,user.info.profile,user.info.stats,video.list
     &response_type=code
     &redirect_uri={your_redirect_uri}
   ```
2. Exchange the authorization code for tokens:
   ```
   POST https://open.tiktokapis.com/v2/oauth/token/
   Content-Type: application/x-www-form-urlencoded

   client_key={client_key}
   &client_secret={client_secret}
   &code={auth_code}
   &grant_type=authorization_code
   &redirect_uri={redirect_uri}
   ```
3. Save the `access_token` and `refresh_token` from the response

> **Tip:** Access tokens expire after 24 hours. Use the `refresh_token` tool or set `TIKTOK_REFRESH_TOKEN` to enable automatic renewal.

## Tools

### Read tools

| Tool | Description |
|------|-------------|
| `get_user_info` | Profile metadata: username, bio, follower/following counts, total likes, video count, verification status |
| `get_videos` | Paginated list of public videos with engagement metrics (views, likes, comments, shares) |
| `get_video_details` | Detailed metrics for specific video IDs (batch up to 20) |

### Utility tools

| Tool | Description |
|------|-------------|
| `refresh_token` | Exchange refresh token for a new access token (requires `TIKTOK_CLIENT_KEY` and `TIKTOK_REFRESH_TOKEN`) |

## Architecture

```
src/
  index.ts          # MCP server entry point, tool registration
  client.ts         # TikTok API HTTP client (native fetch, no dependencies)
  types.ts          # TypeScript interfaces for API responses
  tools/
    user.ts         # get_user_info
    videos.ts       # get_videos, get_video_details
    utils.ts        # refresh_token
```

- **Zero external HTTP dependencies** — uses Node 18+ native `fetch`
- **Cursor-based pagination** — video listing supports pagination via cursor
- **Zod validation** — all tool inputs validated with descriptive error messages
- **Batch video queries** — get details for up to 20 videos in one request

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TIKTOK_ACCESS_TOKEN` | Yes | OAuth access token from Login Kit flow |
| `TIKTOK_CLIENT_KEY` | For refresh | App Client Key (needed for token refresh) |
| `TIKTOK_REFRESH_TOKEN` | For refresh | Refresh token (needed for token refresh) |

## Development

```bash
npm run dev    # Watch mode — recompiles on save
npm run build  # Production build
npm start      # Run the server
```

## Contributing

Issues and PRs welcome. If TikTok changes their API, please open an issue.

## License

MIT — see [LICENSE](LICENSE).

---

Built as part of **The SEO Engine** by [Lantern Row](https://lanternrow.com).
