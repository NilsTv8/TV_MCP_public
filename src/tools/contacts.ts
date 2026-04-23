import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const contactTools: Tool[] = [
  {
    name: "tv_list_contacts",
    description: "Retrieves the contact listing for the account.",
    inputSchema: {
      type: "object",
      properties: {
        online_state: {
          type: "string",
          enum: ["Online", "Busy", "Away", "Offline"],
          description: "Filter contacts by online state",
        },
      },
    },
  },
  {
    name: "tv_get_contact",
    description: "Gets details for a specific contact.",
    inputSchema: {
      type: "object",
      required: ["contact_id"],
      properties: {
        contact_id: { type: "string", description: "Contact ID" },
      },
    },
  },
  {
    name: "tv_create_contact",
    description: "Adds a new contact by invite.",
    inputSchema: {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string", description: "Email address of the contact to invite" },
        groupid: { type: "string", description: "Group ID to assign the contact to" },
      },
    },
  },
  {
    name: "tv_delete_contact",
    description: "Removes a contact.",
    inputSchema: {
      type: "object",
      required: ["contact_id"],
      properties: {
        contact_id: { type: "string", description: "Contact ID to delete" },
      },
    },
  },
];

export async function handleContactTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_contacts":
      return client.get("/contacts", { online_state: args.online_state as string | undefined });

    case "tv_get_contact":
      return client.get(`/contacts/${args.contact_id}`);

    case "tv_create_contact": {
      const { contact_id: _id, ...body } = args as { contact_id?: string } & Record<string, unknown>;
      return client.post("/contacts", body);
    }

    case "tv_delete_contact":
      return client.delete(`/contacts/${args.contact_id}`);

    default:
      throw new Error(`Unknown contact tool: ${name}`);
  }
}
