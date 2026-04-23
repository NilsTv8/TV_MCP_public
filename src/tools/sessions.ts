import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const sessionTools: Tool[] = [
  {
    name: "tv_list_sessions",
    description: "Lists service case sessions with optional filtering.",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["open", "closed"],
          description: "Filter by session state",
        },
        tag: { type: "string", description: "Filter by tag" },
      },
    },
  },
  {
    name: "tv_get_session",
    description: "Gets details for a specific service case session.",
    inputSchema: {
      type: "object",
      required: ["session_code"],
      properties: {
        session_code: { type: "string", description: "Session code" },
      },
    },
  },
  {
    name: "tv_create_session",
    description: "Creates a new service case session.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string", description: "Session description" },
        end_customer: {
          type: "object",
          description: "End customer information",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
          },
        },
        tag: { type: "string", description: "Session tag for categorization" },
        notes: { type: "string", description: "Internal notes for the session" },
        supporter_name: { type: "string", description: "Name of the supporter" },
      },
    },
  },
  {
    name: "tv_update_session",
    description: "Modifies an existing service case session.",
    inputSchema: {
      type: "object",
      required: ["session_code"],
      properties: {
        session_code: { type: "string", description: "Session code to update" },
        description: { type: "string", description: "New session description" },
        tag: { type: "string", description: "New tag" },
        notes: { type: "string", description: "Updated notes" },
      },
    },
  },
  {
    name: "tv_delete_session",
    description: "Closes/terminates a service case session.",
    inputSchema: {
      type: "object",
      required: ["session_code"],
      properties: {
        session_code: { type: "string", description: "Session code to delete" },
      },
    },
  },
];

export async function handleSessionTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_sessions":
      return client.get("/sessions", {
        state: args.state as string | undefined,
        tag: args.tag as string | undefined,
      });

    case "tv_get_session":
      return client.get(`/sessions/${args.session_code}`);

    case "tv_create_session": {
      const { session_code: _code, ...body } = args as { session_code?: string } & Record<string, unknown>;
      return client.post("/sessions", body);
    }

    case "tv_update_session": {
      const { session_code, ...body } = args as { session_code: string } & Record<string, unknown>;
      return client.put(`/sessions/${session_code}`, body);
    }

    case "tv_delete_session":
      return client.delete(`/sessions/${args.session_code}`);

    default:
      throw new Error(`Unknown session tool: ${name}`);
  }
}
