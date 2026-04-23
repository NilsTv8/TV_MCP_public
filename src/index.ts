#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TeamViewerClient } from "./client.js";

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
  const token = process.env.TEAMVIEWER_API_TOKEN;
  if (!token) {
    throw new Error("TEAMVIEWER_API_TOKEN environment variable is not set.");
  }
  return new TeamViewerClient(token);
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

  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const client = getClient();
    const result = await handler(name, args as Record<string, unknown>, client);
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TeamViewer MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
