/**
 * TikTok utility tools.
 *
 * - refresh_token: Exchange a refresh token for a new access token
 */

import { refreshAccessToken } from "../client.js";
import type { AccountConfig } from "../accounts.js";

/**
 * Refresh the TikTok access token for a specific account.
 * Returns the new token details (the user should update their config).
 */
export async function refreshToken(account: AccountConfig): Promise<string> {
  if (!account.client_key) {
    throw new Error(
      `Account "${account.name}" does not have a client_key configured. ` +
        "This is required for token refresh."
    );
  }

  if (!account.refresh_token) {
    throw new Error(
      `Account "${account.name}" does not have a refresh_token configured. ` +
        "This is obtained during the OAuth authorization flow."
    );
  }

  const data = await refreshAccessToken(account.client_key, account.refresh_token);

  return JSON.stringify(
    {
      account: account.name,
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      refresh_expires_in: data.refresh_expires_in,
      scope: data.scope,
      token_type: data.token_type,
      note: "Update your TIKTOK_ACCOUNTS config (or env vars) with these new token values.",
    },
    null,
    2
  );
}
