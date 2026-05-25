/**
 * Multi-account support for TikTok Organic MCP.
 *
 * Accounts can be configured two ways:
 *
 * 1. Multi-account (recommended): Set TIKTOK_ACCOUNTS as a JSON array:
 *    [
 *      {
 *        "name": "lanternrow",
 *        "access_token": "act.xxx",
 *        "refresh_token": "rft.xxx",
 *        "client_key": "abc123"
 *      },
 *      { "name": "otherbrand", ... }
 *    ]
 *
 * 2. Single-account (legacy): Set individual env vars:
 *    TIKTOK_ACCESS_TOKEN, TIKTOK_REFRESH_TOKEN, TIKTOK_CLIENT_KEY
 *
 * When using multi-account mode, pass the account name to any tool.
 * If omitted, the first account in the array is used as default.
 */

export interface AccountConfig {
  name: string;
  access_token: string;
  refresh_token?: string;
  client_key?: string;
}

/**
 * Parse all configured accounts from environment.
 * Returns at least one account or throws.
 */
export function getAccounts(): AccountConfig[] {
  const accountsJson = process.env.TIKTOK_ACCOUNTS;

  if (accountsJson) {
    try {
      const parsed = JSON.parse(accountsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("TIKTOK_ACCOUNTS must be a non-empty JSON array.");
      }

      return parsed.map((entry: Record<string, unknown>, i: number) => {
        if (!entry.name || !entry.access_token) {
          throw new Error(
            `TIKTOK_ACCOUNTS[${i}] must have at least "name" and "access_token" fields.`
          );
        }
        return {
          name: String(entry.name),
          access_token: String(entry.access_token),
          refresh_token: entry.refresh_token
            ? String(entry.refresh_token)
            : undefined,
          client_key: entry.client_key ? String(entry.client_key) : undefined,
        };
      });
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(
          "TIKTOK_ACCOUNTS environment variable is not valid JSON. " +
            "It should be a JSON array of account objects."
        );
      }
      throw err;
    }
  }

  // Legacy single-account fallback
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "No TikTok accounts configured. Set either:\n" +
        "  • TIKTOK_ACCOUNTS (JSON array for multi-account), or\n" +
        "  • TIKTOK_ACCESS_TOKEN (single account mode)\n\n" +
        "See: https://github.com/lanternrow/tiktok-organic-mcp#readme"
    );
  }

  return [
    {
      name: "default",
      access_token: token,
      refresh_token: process.env.TIKTOK_REFRESH_TOKEN,
      client_key: process.env.TIKTOK_CLIENT_KEY,
    },
  ];
}

/**
 * Resolve an account by name. If accountName is undefined, returns the first (default) account.
 */
export function resolveAccount(accountName?: string): AccountConfig {
  const accounts = getAccounts();

  if (!accountName) {
    return accounts[0];
  }

  const match = accounts.find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase()
  );

  if (!match) {
    const available = accounts.map((a) => a.name).join(", ");
    throw new Error(
      `Account "${accountName}" not found. Available accounts: ${available}`
    );
  }

  return match;
}

/**
 * List all configured account names (for the list_accounts tool).
 */
export function listAccountNames(): string[] {
  return getAccounts().map((a) => a.name);
}
