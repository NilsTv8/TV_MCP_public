import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const eventLoggingTools: Tool[] = [
  {
    name: "tv_get_event_logs",
    description: "Returns event/audit logs filtered by date range, event types, account emails, or session identifiers.",
    inputSchema: {
      type: "object",
      required: ["start_date", "end_date"],
      properties: {
        start_date: { type: "string", description: "Start date (ISO 8601, e.g. '2024-01-01T00:00:00Z')" },
        end_date: { type: "string", description: "End date (ISO 8601)" },
        event_names: {
          type: "array",
          items: { type: "string" },
          description: "Filter by event names (e.g. ['EditTFAUsage', 'UserCreate'])",
        },
        event_types: {
          type: "array",
          items: { type: "string" },
          description: "Filter by event types (e.g. ['UserProfile', 'Session', 'Device'])",
        },
        account_emails: {
          type: "array",
          items: { type: "string" },
          description: "Filter by account email addresses",
        },
        affected_item: { type: "string", description: "Filter by affected item" },
        rc_session_guid: { type: "string", description: "Filter by remote control session GUID" },
        continuation_token: { type: "string", description: "Pagination continuation token from a previous response" },
      },
    },
  },
];

export async function handleEventLoggingTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_get_event_logs":
      return client.post("/EventLogging", {
        StartDate: args.start_date,
        EndDate: args.end_date,
        EventNames: args.event_names,
        EventTypes: args.event_types,
        AccountEmails: args.account_emails,
        AffectedItem: args.affected_item,
        RCSessionGuid: args.rc_session_guid,
        ContinuationToken: args.continuation_token,
      });

    default:
      throw new Error(`Unknown event logging tool: ${name}`);
  }
}
