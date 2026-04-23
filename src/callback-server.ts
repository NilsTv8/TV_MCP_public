import { createServer, Server } from "https";
import { parse as parseUrl } from "url";
import { saveTokens, TokenData } from "./token-store.js";

const TOKEN_URL = "https://webapi.teamviewer.com/api/v1/OAuth2/token";

// Self-signed cert for localhost (valid 100 years). The browser will warn
// about the untrusted issuer — the user must click "proceed anyway" once.
const LOCALHOST_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZWqSOd2CLVHED
TSohfTgkYDjsd7s+GCzz4m09+o8BCTL9HvMlmTWwiZGruvA1LVrSrDLIa+yC6XMx
vrT9hlXkb6niQrZox9osvdkyN8+lQfGUuQcOtG2BzwHDDNbqWJTytVZevFimWelO
pN/Hu4X6UM2aePlEXGxb4eb+xp4TXUhH+J9WBgfAj4IT72C+2uKdhD2/gnHwpZJf
PeyERtArBm3RrPrDQWeN0MqjKwIxw5Xfr72qcopfuMoG0kYdlyBlVPxbYfUr57dM
DCjw15fVibaIxsvn4nkluNdoN22YpfvUJTtGvJmqsVHJQ85JqNmNfg/lSceKujrA
eVBMcSnzAgMBAAECggEAdbZ+al3CnpKzxerzh0GOtzyZd498i6uCJO8a5Lce3ZvC
zo0Fd/Zaumo2xz+tuc7/Yhs6QYsZgui1p1o2IRuwxs+mvNAOg/7AbPzAdU7+mOx2
zmnKpa8Xo3ad6Km6dx5URIHq7dGpXSZSkXH/c+deLuu1/hPIQ7qeQMC+Xnrov2kE
uPfpgAU73g/9xTHuUL0O9EdHu/G8oUbSHx9JumVzOsSPtsbi2avHH5WUcc4aARvK
q+Snz3z7yjq8q4W3GvDAve55BQ5AeM2Vn55I+TSuLaFHfhJjAmsJXBZeXQnezQOP
rvuY1ncnPukeAtUNG/Gy4hHEz3pQHbBnC30MqBKmkQKBgQD6VHU5XOniYMQN0p93
U6lXbPeSjO2QnN0TLwDwcv8botJBJiiJSC2IAsB2gAJAaUvTOogaDqexWhK123zn
fivf5Nd2gDMAsC0bfEGUO8No/Hz9kJMrhgX8BIeDbt2HnEAk8VKJ8BTSwQLHi1Op
abTIEcmnLEckzaA6FwiKXgnTWwKBgQDeRvlUY5fCBGsOx0hmUsEV7jZyulIsT3Aa
OcGKYEs4cX/wuQ73NuYU0hxlMUyiXsvRkDFBeL9Vk5OFcVRxHllQ+IPgqteOF3F7
umngR0LLvG0rdDthKhmCfri6hWfOPEGgbSGsSC34n0mZVqX2Ql1eGvTKWDybZWnF
BzRuRkm/SQKBgQDXS75KKKQrA8h6jvSBn12ciGZhD33ei1sD/cAUDQNllGK6j4P7
li06tgsrn6rQFP+W2tdlecc2HF7NM8m4G2bGuD2reFTlOaCB7BtGzyOgbs9dEXPR
0gHhn0+hdb9nu7XbUAYKBocSP9gRIL5CjVxjWhESC13gxE0SyO6aeoh+0wKBgE+T
DROfC+dTeZgy08J+Ac3+F9P+zAg88B8TaixFyOgOCgV92tO5/aiah7vaaFsAoOsH
Ofr8ZVMXoAp3xgkxGjyYm23E+6JM1j27QMgf+tPBQzv5QoDId5V2FGAB/mWgwMXU
C+gHdx24uLqCgKummpJkCBqgeCIRrknxCF4qH6CxAoGBALKC1qxJ2Bt33oN6Nr/x
GBSE265TdOWpKXnldesttQyDSFJtNITDF4sudwGi/SYuBli933S5EwQDubUoJP5P
z2Tw14FROrZACEgUxx6RPeKDb+9Y3vw4eEjM2nvBIWlRD1dHuIYH7z8wPyu/ps2p
6ovaalOeSruj+55Dqx1ddls+
-----END PRIVATE KEY-----`;

const LOCALHOST_CERT = `-----BEGIN CERTIFICATE-----
MIICyzCCAbOgAwIBAgIJAISqvqnGNVNCMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDAgFw0yNjA0MjMwOTQ1MDNaGA8yMTI2MDMzMDA5NDUwM1ow
FDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA2Vqkjndgi1RxA00qIX04JGA47He7Phgs8+JtPfqPAQky/R7zJZk1sImR
q7rwNS1a0qwyyGvsgulzMb60/YZV5G+p4kK2aMfaLL3ZMjfPpUHxlLkHDrRtgc8B
wwzW6liU8rVWXrxYplnpTqTfx7uF+lDNmnj5RFxsW+Hm/saeE11IR/ifVgYHwI+C
E+9gvtrinYQ9v4Jx8KWSXz3shEbQKwZt0az6w0FnjdDKoysCMcOV36+9qnKKX7jK
BtJGHZcgZVT8W2H1K+e3TAwo8NeX1Ym2iMbL5+J5JbjXaDdtmKX71CU7RryZqrFR
yUPOSajZjX4P5UnHiro6wHlQTHEp8wIDAQABox4wHDAaBgNVHREEEzARgglsb2Nh
bGhvc3SHBH8AAAEwDQYJKoZIhvcNAQELBQADggEBAGRSMpwCvLkOtKFMWvwpBsUz
1oFzy41cY89ZhghEZWmOfwuzKejyJPzByyT1HlV6HkMFRPdN4uWRth9k5HVnGF3U
hlCEGygbshqnFTygV07ztANxh7q7gdmID9bsFDMBlrVNfTfZGqn+nvnqEHlmg5vQ
XN2niyBkAJWHHLLrZ4zC1Xq+4W2Hynov9dd8AlK4Eucur4rzmEoROl6RHcdDnm/q
VxyYP28aFwuZ9RrQARi93kwkmkEpdj+xU8QmLvGNb2h+pC31xJkn4CyfWh5aW1GR
QCN/WByE7p23PEJi0s+V7jxEguojj0W4K0fHwq0c2x5xKxXzzMRv5dsKns0Z89w=
-----END CERTIFICATE-----`;

let activeServer: Server | null = null;

export interface CallbackResult {
  code: string;
  state: string;
}

export function startCallbackServer(
  expectedState: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  port = 443,
  timeoutMs = 5 * 60 * 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    stopCallbackServer();

    const timeout = setTimeout(() => {
      stopCallbackServer();
      reject(new Error("OAuth callback timed out after 5 minutes. Run tv_oauth_get_auth_url again."));
    }, timeoutMs);

    const server = createServer(
      { key: LOCALHOST_KEY, cert: LOCALHOST_CERT },
      async (req, res) => {
        const { query } = parseUrl(req.url ?? "/", true);
        const { code, state, error, error_description } = query;

        res.setHeader("Content-Type", "text/html");

        if (error) {
          res.end(htmlPage("Authorization failed", `<p>TeamViewer returned an error: <strong>${error}</strong>${error_description ? ` — ${error_description}` : ""}</p>`, false));
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

        // Exchange code for token
        try {
          const tokenResp = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grant_type: 0,
              code: String(code),
              redirect_uri: redirectUri,
              client_id: clientId,
              client_secret: clientSecret,
            }),
          });

          if (!tokenResp.ok) {
            const errBody = await tokenResp.text();
            throw new Error(`${tokenResp.status} ${tokenResp.statusText} — ${errBody}`);
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
          const msg = err instanceof Error ? err.message : String(err);
          res.end(htmlPage("Token exchange failed", `<pre style="text-align:left;background:#f5f5f5;padding:12px;border-radius:4px;overflow:auto;font-size:13px;">${msg}</pre>`, false));
          clearTimeout(timeout);
          stopCallbackServer();
          reject(err instanceof Error ? err : new Error(msg));
        }
      }
    );

    server.on("error", (err: NodeJS.ErrnoException) => {
      clearTimeout(timeout);
      if (err.code === "EACCES") {
        reject(new Error(
          `Cannot bind to port ${port} — permission denied. ` +
            "On macOS/Linux, run the MCP server with elevated privileges (sudo) or change TEAMVIEWER_REDIRECT_URI to use a high port such as https://localhost:8443."
        ));
      } else if (err.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Stop the other process or change TEAMVIEWER_REDIRECT_URI to a different port.`));
      } else {
        reject(err);
      }
    });

    activeServer = server;
    server.listen(port, "127.0.0.1", () => {
      console.error(`[teamviewer-mcp] OAuth callback server listening on https://localhost:${port}`);
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — TeamViewer MCP</title>
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
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`;
}
