import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const deviceGroupTools: Tool[] = [
  {
    name: "tv_list_device_groups",
    description: "Returns device groups, optionally filtered by name.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Filter by group name" },
        shared: { type: "boolean", description: "Filter shared groups only" },
        shouldMatchFullName: { type: "boolean", description: "Match full name exactly" },
      },
    },
  },
  {
    name: "tv_create_device_group",
    description: "Creates a new device group.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Group name" },
      },
    },
  },
  {
    name: "tv_get_device_group",
    description: "Returns a device group by ID.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Group ID" },
      },
    },
  },
  {
    name: "tv_update_device_group",
    description: "Updates a device group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Group ID" },
        name: { type: "string", description: "New group name" },
      },
    },
  },
  {
    name: "tv_delete_device_group",
    description: "Deletes a device group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Group ID to delete" },
      },
    },
  },
  {
    name: "tv_share_device_group",
    description: "Shares a device group with specified users.",
    inputSchema: {
      type: "object",
      required: ["group_id", "users"],
      properties: {
        group_id: { type: "string", description: "Group ID to share" },
        users: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to share the group with",
        },
      },
    },
  },
  {
    name: "tv_unshare_device_group",
    description: "Removes group sharing from users.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Group ID to unshare" },
        users: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to remove sharing from (omit to remove all)",
        },
      },
    },
  },
];

export async function handleDeviceGroupTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_device_groups":
      return client.get("/groups", {
        name: args.name as string | undefined,
        shared: args.shared as boolean | undefined,
        shouldMatchFullName: args.shouldMatchFullName as boolean | undefined,
      });

    case "tv_create_device_group": {
      const { group_id: _id, ...body } = args as { group_id?: string } & Record<string, unknown>;
      return client.post("/groups", body);
    }

    case "tv_get_device_group":
      return client.get(`/groups/${args.group_id}`);

    case "tv_update_device_group": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.put(`/groups/${group_id}`, body);
    }

    case "tv_delete_device_group":
      return client.delete(`/groups/${args.group_id}`);

    case "tv_share_device_group": {
      const { group_id, users } = args as { group_id: string; users: string[] };
      return client.post(`/groups/${group_id}/share_group`, { users });
    }

    case "tv_unshare_device_group": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.post(`/groups/${group_id}/unshare_group`, body);
    }

    default:
      throw new Error(`Unknown device group tool: ${name}`);
  }
}
