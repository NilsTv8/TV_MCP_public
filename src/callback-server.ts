import { createServer, Server } from "http";
import { parse as parseUrl } from "url";
import { saveTokens, TokenData } from "./token-store.js";

const TOKEN_URL = "https://webapi.teamviewer.com/api/v1/OAuth2/token";

let activeServer: Server | null = null;

export interface CallbackResult {
  code: string;
  state: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function startCallbackServer(
  expectedState: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  port = 8080,
  codeVerifier?: string,
  timeoutMs = 5 * 60 * 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    stopCallbackServer();

    const timeout = setTimeout(() => {
      stopCallbackServer();
      reject(new Error("OAuth callback timed out after 5 minutes. Run tv_oauth_get_auth_url again."));
    }, timeoutMs);

    const server = createServer(async (req, res) => {
      const { query } = parseUrl(req.url ?? "/", true);
      const { code, state, error, error_description } = query;

      res.setHeader("Content-Type", "text/html");

      if (error) {
        const safeError = escapeHtml(String(error));
        const safeDesc = error_description ? escapeHtml(String(error_description)) : "";
        res.end(htmlPage(
          "Authorization failed",
          `<p>TeamViewer returned an error: <strong>${safeError}</strong>${safeDesc ? ` — ${safeDesc}` : ""}</p>`,
          false
        ));
        clearTimeout(timeout);
        stopCallbackServer();
        reject(new Error(`OAuth error: ${error}${error_description ? ` — ${error_description}` : ""}`));
        return;
      }

      if (!code) {
        res.end(htmlPage("Missing code", "<p>No authorization code in the callback URL.</p>", false));
        return;
      }

      if (state !== expectedState) {
        res.end(htmlPage("Security error", "<p>State parameter mismatch. The request may have been tampered with.</p>", false));
        clearTimeout(timeout);
        stopCallbackServer();
        reject(new Error("State mismatch — possible CSRF attack"));
        return;
      }

      try {
        const tokenBody: Record<string, unknown> = {
          grant_type: 0,
          code: String(code),
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        };
        if (codeVerifier) tokenBody.code_verifier = codeVerifier;

        const tokenResp = await fetch(TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tokenBody),
        });

        if (!tokenResp.ok) {
          throw new Error(`${tokenResp.status} ${tokenResp.statusText}`);
        }

        const token = (await tokenResp.json()) as {
          access_token: string;
          refresh_token?: string;
          expires_in?: number;
          token_type?: string;
          scope?: string;
        };

        const data: TokenData = {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          token_type: token.token_type,
          scope: token.scope,
          expires_at: token.expires_in ? Date.now() + token.expires_in * 1000 : undefined,
        };
        saveTokens(data);

        res.end(htmlPage(
          "Authorization successful",
          "<p>You have successfully authorized the TeamViewer MCP server.</p><p>You can close this window.</p>",
          true
        ));

        clearTimeout(timeout);
        stopCallbackServer();
        resolve();
      } catch (err) {
        const msg = escapeHtml(err instanceof Error ? err.message : String(err));
        res.end(htmlPage(
          "Token exchange failed",
          `<pre style="text-align:left;background:#f5f5f5;padding:12px;border-radius:4px;overflow:auto;font-size:13px;">${msg}</pre>`,
          false
        ));
        clearTimeout(timeout);
        stopCallbackServer();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      clearTimeout(timeout);
      if (err.code === "EACCES") {
        reject(new Error(
          `Cannot bind to port ${port} — permission denied. ` +
            "Change TEAMVIEWER_REDIRECT_URI to use a high port such as http://localhost:8080."
        ));
      } else if (err.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Stop the other process or change TEAMVIEWER_REDIRECT_URI to a different port.`));
      } else {
        reject(err);
      }
    });

    activeServer = server;
    server.listen(port, "127.0.0.1", () => {
      console.error(`[teamviewer-mcp] OAuth callback server listening on http://localhost:${port}`);
    });
  });
}

export function stopCallbackServer(): void {
  if (activeServer) {
    activeServer.close();
    activeServer = null;
  }
}

export function isCallbackServerRunning(): boolean {
  return activeServer !== null;
}

function htmlPage(title: string, body: string, success: boolean): string {
  const color = success ? "#0a7c42" : "#c0392b";
  const icon = success ? "✓" : "✗";
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — TeamViewer MCP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; border-radius: 8px; padding: 40px 48px;
            box-shadow: 0 2px 12px rgba(0,0,0,.1); max-width: 420px; text-align: center; }
    .icon { font-size: 48px; color: ${color}; }
    h1 { color: #1a1a1a; font-size: 22px; margin: 16px 0 8px; }
    p { color: #555; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${safeTitle}</h1>
    ${body}
  </div>
</body>
</html>`;
}
