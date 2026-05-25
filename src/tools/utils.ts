/**
 * TikTok utility tools.
 *
 * - refresh_token: Exchange a refresh token for a new access token
 */

import { refreshAccessToken } from "../client.js";

/**
 * Refresh the TikTok access token using the stored refresh token.
 * Returns the new token details (the user should update their env).
 */
export async function refreshToken(): Promise<string> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const refreshTokenValue = process.env.TIKTOK_REFRESH_TOKEN;

  if (!clientKey) {
    throw new Error(
      "TIKTOK_CLIENT_KEY environment variable is not set. " +
        "This is your app's Client Key from the TikTok Developer Portal."
    );
  }

  if (!refreshTokenValue) {
    throw new Error(
      "TIKTOK_REFRESH_TOKEN environment variable is not set. " +
        "This is obtained during the OAuth authorization flow."
    );
  }

  const data = await refreshAccessToken(clientKey, refreshTokenValue);

  return JSON.stringify(
    {
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      refresh_expires_in: data.refresh_expires_in,
      scope: data.scope,
      token_type: data.token_type,
      note: "Update your TIKTOK_ACCESS_TOKEN and TIKTOK_REFRESH_TOKEN environment variables with these new values.",
    },
    null,
    2
  );
}
