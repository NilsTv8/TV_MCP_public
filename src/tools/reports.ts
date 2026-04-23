import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const reportTools: Tool[] = [
  {
    name: "tv_list_connection_reports",
    description: "Retrieves connection reports. Returns a maximum of 1000 records per call.",
    inputSchema: {
      type: "object",
      properties: {
        userid: { type: "string", description: "Filter by user ID" },
        groupid: { type: "string", description: "Filter by group ID" },
        deviceid: { type: "string", description: "Filter by device ID" },
        from_date: { type: "string", description: "Start date (ISO 8601, e.g. '2024-01-01T00:00:00Z')" },
        to_date: { type: "string", description: "End date (ISO 8601)" },
        limit: { type: "number", description: "Maximum number of results (up to 1000)" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
  },
  {
    name: "tv_get_connection_report",
    description: "Fetches a specific connection report by ID.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
      },
    },
  },
  {
    name: "tv_update_connection_report",
    description: "Updates metadata (e.g. notes) on a connection report.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
        notes: { type: "string", description: "Updated notes for the connection" },
      },
    },
  },
  {
    name: "tv_delete_connection_report",
    description: "Removes a connection report.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID to delete" },
      },
    },
  },
  {
    name: "tv_get_connection_ai_summary",
    description: "Retrieves an AI-generated summary for a session connection.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
      },
    },
  },
  {
    name: "tv_get_connection_chat_transcript",
    description: "Retrieves the chat messaging transcript for a connection.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
      },
    },
  },
  {
    name: "tv_get_connection_voice_transcript",
    description: "Retrieves the voice call transcript for a connection.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
      },
    },
  },
  {
    name: "tv_list_connection_screenshots",
    description: "Lists available screenshots for a connection.",
    inputSchema: {
      type: "object",
      required: ["connection_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
      },
    },
  },
  {
    name: "tv_get_connection_screenshot",
    description: "Downloads a specific screenshot from a connection.",
    inputSchema: {
      type: "object",
      required: ["connection_id", "screenshot_id"],
      properties: {
        connection_id: { type: "string", description: "Connection report ID" },
        screenshot_id: { type: "string", description: "Screenshot ID" },
      },
    },
  },
  {
    name: "tv_list_device_reports",
    description: "Retrieves device inventory/activity reports.",
    inputSchema: {
      type: "object",
      properties: {
        from_date: { type: "string", description: "Start date (ISO 8601)" },
        to_date: { type: "string", description: "End date (ISO 8601)" },
      },
    },
  },
];

export async function handleReportTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_connection_reports":
      return client.get("/reports/connections", args as Record<string, string | number | boolean | undefined>);

    case "tv_get_connection_report":
      return client.get(`/reports/connections/${args.connection_id}`);

    case "tv_update_connection_report": {
      const { connection_id, ...body } = args as { connection_id: string } & Record<string, unknown>;
      return client.put(`/reports/connections/${connection_id}`, body);
    }

    case "tv_delete_connection_report":
      return client.delete(`/reports/connections/${args.connection_id}`);

    case "tv_get_connection_ai_summary":
      return client.get(`/reports/connections/${args.connection_id}/ai-summary`);

    case "tv_get_connection_chat_transcript":
      return client.get(`/reports/connections/${args.connection_id}/chat-transcript`);

    case "tv_get_connection_voice_transcript":
      return client.get(`/reports/connections/${args.connection_id}/voice-transcript`);

    case "tv_list_connection_screenshots":
      return client.get(`/reports/connections/${args.connection_id}/screenshots`);

    case "tv_get_connection_screenshot":
      return client.get(`/reports/connections/${args.connection_id}/${args.screenshot_id}/screenshot`);

    case "tv_list_device_reports":
      return client.get("/reports/devices", args as Record<string, string | number | boolean | undefined>);

    default:
      throw new Error(`Unknown report tool: ${name}`);
  }
}
