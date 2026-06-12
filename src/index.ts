#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TeamViewerClient } from "./client.js";
import { loadTokens, saveTokens, isExpired } from "./token-store.js";

import { accountTools, handleAccountTool } from "./tools/account.js";
import { companyTools, handleCompanyTool } from "./tools/company.js";
import { deviceGroupTools, handleDeviceGroupTool } from "./tools/device-groups.js";
import { deviceTools, handleDeviceTool } from "./tools/devices.js";
import { contactTools, handleContactTool } from "./tools/contacts.js";
import { eventLoggingTools, handleEventLoggingTool } from "./tools/event-logging.js";
import { managedDeviceTools, handleManagedDeviceTool } from "./tools/managed-devices.js";
import { managedGroupTools, handleManagedGroupTool } from "./tools/managed-groups.js";
import { monitoringTools, handleMonitoringTool } from "./tools/monitoring.js";
import { policyTools, handlePolicyTool } from "./tools/policies.js";
import { reportTools, handleReportTool } from "./tools/reports.js";
import { sessionTools, handleSessionTool } from "./tools/sessions.js";
import { userTools, handleUserTool } from "./tools/users.js";
import { userRoleTools, handleUserRoleTool } from "./tools/user-roles.js";
import { oauthTools, handleOAuthTool } from "./tools/oauth.js";
import { remoteControlTools, handleRemoteControlTool } from "./tools/remote-control.js";

const ALL_TOOLS = [
  ...accountTools,
  ...companyTools,
  ...deviceGroupTools,
  ...deviceTools,
  ...contactTools,
  ...eventLoggingTools,
  ...managedDeviceTools,
  ...managedGroupTools,
  ...monitoringTools,
  ...policyTools,
  ...reportTools,
  ...sessionTools,
  ...userTools,
  ...userRoleTools,
  ...oauthTools,
  ...remoteControlTools,
];

const TOOL_HANDLERS: Record<
  string,
  (name: string, args: Record<string, unknown>, client: TeamViewerClient) => Promise<unknown>
> = {
  ...Object.fromEntries(accountTools.map((t) => [t.name, handleAccountTool])),
  ...Object.fromEntries(companyTools.map((t) => [t.name, handleCompanyTool])),
  ...Object.fromEntries(deviceGroupTools.map((t) => [t.name, handleDeviceGroupTool])),
  ...Object.fromEntries(deviceTools.map((t) => [t.name, handleDeviceTool])),
  ...Object.fromEntries(contactTools.map((t) => [t.name, handleContactTool])),
  ...Object.fromEntries(eventLoggingTools.map((t) => [t.name, handleEventLoggingTool])),
  ...Object.fromEntries(managedDeviceTools.map((t) => [t.name, handleManagedDeviceTool])),
  ...Object.fromEntries(managedGroupTools.map((t) => [t.name, handleManagedGroupTool])),
  ...Object.fromEntries(monitoringTools.map((t) => [t.name, handleMonitoringTool])),
  ...Object.fromEntries(policyTools.map((t) => [t.name, handlePolicyTool])),
  ...Object.fromEntries(reportTools.map((t) => [t.name, handleReportTool])),
  ...Object.fromEntries(sessionTools.map((t) => [t.name, handleSessionTool])),
  ...Object.fromEntries(userTools.map((t) => [t.name, handleUserTool])),
  ...Object.fromEntries(userRoleTools.map((t) => [t.name, handleUserRoleTool])),
};

function getClient(): TeamViewerClient {
  // 1. Prefer env var (static token / permanent token)
  const envToken = process.env.TEAMVIEWER_API_TOKEN;
  if (envToken) return new TeamViewerClient(envToken);

  // 2. Fall back to stored OAuth token
  const stored = loadTokens();
  if (!stored?.access_token) {
    throw new Error(
      "Not authenticated. Call tv_oauth_get_auth_url to start the OAuth flow, " +
        "or set the TEAMVIEWER_API_TOKEN environment variable."
    );
  }

  // Warn if expired and no refresh token available
  if (isExpired(stored) && !stored.refresh_token) {
    throw new Error("Stored access token has expired and no refresh token is available. Re-authenticate with tv_oauth_get_auth_url.");
  }

  return new TeamViewerClient(stored.access_token);
}

const server = new Server(
  { name: "teamviewer-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  const typedArgs = args as Record<string, unknown>;

  // Remote control — opens a local URL, no API client needed
  if (name === "tv_connect_device") {
    try {
      const result = await handleRemoteControlTool(name, typedArgs);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  // OAuth tools manage their own auth state — no client needed
  if (name.startsWith("tv_oauth_")) {
    try {
      const result = await handleOAuthTool(name, typedArgs);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }

  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const client = getClient();
    const result = await handler(name, typedArgs, client);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : undefined); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

async function startHttp() {
  const port = parseInt(process.env.HTTP_PORT ?? process.env.PORT ?? "3000", 10);
  const bearerSecret = process.env.MCP_BEARER_TOKEN;

  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (bearerSecret) {
      const authHeader = req.headers["authorization"] ?? "";
      if (!authHeader.startsWith("Bearer ") || authHeader.slice(7) !== bearerSecret) {
        res.writeHead(401, { "WWW-Authenticate": 'Bearer realm="teamviewer-mcp"' }).end("Unauthorized");
        return;
      }
    }

    const url = new URL(req.url ?? "/", `http://localhost`);
    if (url.pathname !== "/mcp") {
      res.writeHead(404).end("Not found");
      return;
    }

    res.setHeader("Content-Type", "application/json");

    try {
      const body = req.method === "POST" ? await readBody(req) : undefined;
      const msg = body as { jsonrpc: string; id?: unknown; method: string; params?: unknown };

      // Notifications (no id) — acknowledge and ignore
      if (!msg || !("id" in msg)) {
        res.writeHead(202).end();
        return;
      }

      const jsonrpc = "2.0";
      const { id, method, params } = msg;

      if (method === "initialize") {
        res.writeHead(200).end(JSON.stringify({
          jsonrpc, id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "teamviewer-mcp", version: "1.0.0" },
          },
        }));
        return;
      }

      if (method === "tools/list") {
        res.writeHead(200).end(JSON.stringify({ jsonrpc, id, result: { tools: ALL_TOOLS } }));
        return;
      }

      if (method === "tools/call") {
        const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> };
        const handler = TOOL_HANDLERS[name];
        if (!handler) {
          res.writeHead(200).end(JSON.stringify({ jsonrpc, id, error: { code: -32601, message: `Unknown tool: ${name}` } }));
          return;
        }
        const client = getClient();
        const result = await handler(name, args ?? {}, client);
        res.writeHead(200).end(JSON.stringify({ jsonrpc, id, result }));
        return;
      }

      res.writeHead(200).end(JSON.stringify({ jsonrpc, id, error: { code: -32601, message: `Method not found: ${method}` } }));
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      if (!res.headersSent) res.writeHead(500).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: msg2 } }));
    }
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(port, "0.0.0.0", () => {
      console.error(`TeamViewer MCP server running on HTTP port ${port}`);
      resolve();
    });
  });
}

async function main() {
  const useHttp = process.argv.includes("--http") || process.env.HTTP_PORT || process.env.PORT;

  if (useHttp) {
    await startHttp();
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TeamViewer MCP server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
