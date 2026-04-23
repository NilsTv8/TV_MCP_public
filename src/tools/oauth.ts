import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { createHash, randomBytes } from "crypto";
import { loadTokens, saveTokens, clearTokens, TokenData } from "../token-store.js";

const AUTHORIZE_URL = "https://login.teamviewer.com/oauth2/authorize";
const TOKEN_URL = "https://webapi.teamviewer.com/api/v1/OAuth2/token";
const PERMANENT_TOKEN_URL = "https://webapi.teamviewer.com/api/v1/OAuth2/accessToken";
const REVOKE_URL = "https://webapi.teamviewer.com/api/v1/OAuth2/revoke";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function getOAuthCredentials(): { clientId: string; clientSecret: string; redirectUri: string } {
  const clientId = process.env.TEAMVIEWER_CLIENT_ID;
  const clientSecret = process.env.TEAMVIEWER_CLIENT_SECRET;
  const redirectUri = process.env.TEAMVIEWER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    const missing = [
      !clientId && "TEAMVIEWER_CLIENT_ID",
      !clientSecret && "TEAMVIEWER_CLIENT_SECRET",
      !redirectUri && "TEAMVIEWER_REDIRECT_URI",
    ].filter(Boolean).join(", ");
    throw new Error(
      `Missing required environment variables: ${missing}. ` +
        "Create an OAuth2 app at https://login.teamviewer.com/nav#app/myapps and set these variables in your MCP server configuration."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

// In-memory PKCE verifier store (lives for the duration of the auth flow)
const pkceStore = new Map<string, string>();

export const oauthTools: Tool[] = [
  {
    name: "tv_oauth_get_auth_url",
    description:
      "Starts the OAuth2 authorization code flow. Returns a URL for the user to open in their browser. " +
      "Requires TEAMVIEWER_CLIENT_ID, TEAMVIEWER_CLIENT_SECRET, and TEAMVIEWER_REDIRECT_URI to be set. " +
      "After authorizing, the user receives a code to pass to tv_oauth_exchange_code.",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description: "Space-separated OAuth scopes (e.g. 'UserInfo.View Computers.View'). Defaults to all scopes if omitted.",
        },
      },
    },
  },
  {
    name: "tv_oauth_exchange_code",
    description:
      "Exchanges the authorization code (from the redirect URL after browser login) for an access token. " +
      "Saves the token locally to ~/.teamviewer-mcp/tokens.json for subsequent API calls.",
    inputSchema: {
      type: "object",
      required: ["code"],
      properties: {
        code: { type: "string", description: "Authorization code from the 'code' query parameter of the redirect URL" },
      },
    },
  },
  {
    name: "tv_oauth_refresh_token",
    description: "Uses the stored refresh token to obtain a new access token. Updates the local token store.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_oauth_revoke_token",
    description: "Revokes the current access token and clears the local token store.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_oauth_create_permanent_token",
    description: "Creates a permanent (non-expiring) access token for the current session. Requires an active OAuth token.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Token name (5–20 characters)" },
        scope: { type: "string", description: "Comma-separated scopes for the permanent token" },
      },
    },
  },
  {
    name: "tv_oauth_delete_permanent_token",
    description: "Deletes the permanent access token associated with the current session.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_oauth_token_status",
    description: "Shows the current authentication status: token source, expiry, and scopes.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_oauth_clear_tokens",
    description: "Clears locally stored tokens. Use this to log out or switch accounts.",
    inputSchema: { type: "object", properties: {} },
  },
];

export async function handleOAuthTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "tv_oauth_get_auth_url": {
      const { clientId, redirectUri } = getOAuthCredentials();
      const { verifier, challenge } = generatePKCE();
      const state = base64url(randomBytes(16));

      pkceStore.set(state, verifier);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });
      if (args.scope) params.set("scope", args.scope as string);

      return {
        authorization_url: `${AUTHORIZE_URL}?${params.toString()}`,
        state,
        instructions:
          "1. Open the authorization_url in a browser.\n" +
          "2. Log in to TeamViewer and grant access.\n" +
          "3. Copy the 'code' query parameter from the redirect URL.\n" +
          "4. Call tv_oauth_exchange_code with that code.",
      };
    }

    case "tv_oauth_exchange_code": {
      const { clientId, clientSecret, redirectUri } = getOAuthCredentials();
      const { code } = args as { code: string };

      const verifier = pkceStore.size > 0
        ? [...pkceStore.values()].at(-1)!
        : undefined;

      const body: Record<string, string> = {
        grant_type: "0",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      };
      if (verifier) body.code_verifier = verifier;

      const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Token exchange failed: ${resp.status} ${err}`);
      }

      const token = (await resp.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
        scope?: string;
      };

      pkceStore.clear();

      const data: TokenData = {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        token_type: token.token_type,
        scope: token.scope,
        expires_at: token.expires_in
          ? Date.now() + token.expires_in * 1000
          : undefined,
      };
      saveTokens(data);

      return {
        message: "Authentication successful. Token saved to ~/.teamviewer-mcp/tokens.json.",
        token_type: token.token_type,
        scope: token.scope,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : "no expiry",
        has_refresh_token: !!token.refresh_token,
      };
    }

    case "tv_oauth_refresh_token": {
      const { clientId, clientSecret } = getOAuthCredentials();
      const tokens = loadTokens();
      if (!tokens?.refresh_token) {
        throw new Error("No refresh token found. Run tv_oauth_get_auth_url to re-authenticate.");
      }

      const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "1",
          refresh_token: tokens.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Token refresh failed: ${resp.status} ${err}`);
      }

      const token = (await resp.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
        scope?: string;
      };

      const data: TokenData = {
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? tokens.refresh_token,
        token_type: token.token_type,
        scope: token.scope,
        expires_at: token.expires_in
          ? Date.now() + token.expires_in * 1000
          : undefined,
      };
      saveTokens(data);

      return {
        message: "Token refreshed and saved.",
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : "no expiry",
      };
    }

    case "tv_oauth_revoke_token": {
      const tokens = loadTokens();
      if (!tokens?.access_token) {
        return { message: "No active token to revoke." };
      }

      await fetch(REVOKE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      clearTokens();
      return { message: "Token revoked and local store cleared." };
    }

    case "tv_oauth_create_permanent_token": {
      const tokens = loadTokens();
      const envToken = process.env.TEAMVIEWER_API_TOKEN;
      const bearerToken = tokens?.access_token ?? envToken;
      if (!bearerToken) throw new Error("No active token. Authenticate first with tv_oauth_get_auth_url.");

      const resp = await fetch(PERMANENT_TOKEN_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: args.name, scope: args.scope }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to create permanent token: ${resp.status} ${err}`);
      }

      const result = (await resp.json()) as { AccessToken: string };
      return {
        message: "Permanent access token created. Store it securely — it will not be shown again.",
        access_token: result.AccessToken,
      };
    }

    case "tv_oauth_delete_permanent_token": {
      const tokens = loadTokens();
      const envToken = process.env.TEAMVIEWER_API_TOKEN;
      const bearerToken = tokens?.access_token ?? envToken;
      if (!bearerToken) throw new Error("No active token. Authenticate first with tv_oauth_get_auth_url.");

      const resp = await fetch(PERMANENT_TOKEN_URL, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${bearerToken}` },
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to delete permanent token: ${resp.status} ${err}`);
      }

      return { message: "Permanent access token deleted." };
    }

    case "tv_oauth_token_status": {
      const tokens = loadTokens();
      const envToken = process.env.TEAMVIEWER_API_TOKEN;

      if (!tokens?.access_token && !envToken) {
        return {
          authenticated: false,
          message: "No token found. Call tv_oauth_get_auth_url to authenticate.",
        };
      }

      if (envToken && !tokens?.access_token) {
        return {
          authenticated: true,
          source: "TEAMVIEWER_API_TOKEN environment variable",
          token_type: "static",
        };
      }

      return {
        authenticated: true,
        source: "~/.teamviewer-mcp/tokens.json",
        token_type: tokens!.token_type ?? "Bearer",
        scope: tokens!.scope ?? "unknown",
        expires_at: tokens!.expires_at ? new Date(tokens!.expires_at).toISOString() : "no expiry",
        expired: tokens!.expires_at ? Date.now() >= tokens!.expires_at - 60_000 : false,
        has_refresh_token: !!tokens!.refresh_token,
      };
    }

    case "tv_oauth_clear_tokens":
      clearTokens();
      return { message: "Local token store cleared." };

    default:
      throw new Error(`Unknown OAuth tool: ${name}`);
  }
}
