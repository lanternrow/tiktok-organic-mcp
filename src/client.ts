/**
 * TikTok API HTTP client — native fetch, zero external dependencies.
 *
 * Base URL: https://open.tiktokapis.com
 *
 * All endpoints require an OAuth 2.0 bearer token obtained through
 * TikTok's Login Kit authorization flow.
 *
 * Token is passed explicitly to support multi-account usage.
 */

const BASE_URL = "https://open.tiktokapis.com";

/**
 * Make a GET request to the TikTok API.
 */
export async function tiktokGet<T>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(path, BASE_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TikTok API error ${res.status}: ${body}`);
  }

  return (await res.json()) as T;
}

/**
 * Make a POST request to the TikTok API.
 */
export async function tiktokPost<T>(
  path: string,
  token: string,
  body: Record<string, unknown>,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(path, BASE_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(`TikTok API error ${res.status}: ${bodyText}`);
  }

  return (await res.json()) as T;
}

/**
 * Refresh an access token using a refresh token.
 * This does NOT require an existing valid access token.
 */
export async function refreshAccessToken(
  clientKey: string,
  refreshToken: string
): Promise<Record<string, unknown>> {
  const url = new URL("/v2/oauth/token/", BASE_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed ${res.status}: ${body}`);
  }

  return (await res.json()) as Record<string, unknown>;
}
