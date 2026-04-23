import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const managedGroupTools: Tool[] = [
  {
    name: "tv_list_managed_groups",
    description: "Lists managed device groups with pagination support.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum number of groups to return" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
  },
  {
    name: "tv_get_managed_group",
    description: "Retrieves details of a specific managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
      },
    },
  },
  {
    name: "tv_create_managed_group",
    description: "Creates a new managed group.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Group name" },
        policy_id: { type: "string", description: "Policy ID to assign to the group" },
      },
    },
  },
  {
    name: "tv_update_managed_group",
    description: "Modifies properties of a managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
        name: { type: "string", description: "New group name" },
        policy_id: { type: "string", description: "New policy ID" },
      },
    },
  },
  {
    name: "tv_delete_managed_group",
    description: "Marks a managed group as deleted.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Managed group ID to delete" },
      },
    },
  },
  {
    name: "tv_list_group_managers",
    description: "Lists all managers assigned to a managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
      },
    },
  },
  {
    name: "tv_add_group_managers",
    description: "Adds managers to a managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_ids"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of account IDs to add as managers",
        },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Permissions to grant (e.g. ['TeamViewerPolicyManagement'])",
        },
      },
    },
  },
  {
    name: "tv_update_group_managers",
    description: "Updates permissions for managers in a managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_ids"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to update",
        },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Updated permissions",
        },
      },
    },
  },
  {
    name: "tv_remove_group_managers",
    description: "Removes managers from a managed group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_ids"],
      properties: {
        group_id: { type: "string", description: "Managed group ID" },
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to remove",
        },
      },
    },
  },
];

export async function handleManagedGroupTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_managed_groups":
      return client.get("/managed/groups", {
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
      });

    case "tv_get_managed_group":
      return client.get(`/managed/groups/${args.group_id}`);

    case "tv_create_managed_group": {
      const { group_id: _id, ...body } = args as { group_id?: string } & Record<string, unknown>;
      return client.post("/managed/groups", body);
    }

    case "tv_update_managed_group": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.put(`/managed/groups/${group_id}`, body);
    }

    case "tv_delete_managed_group":
      return client.delete(`/managed/groups/${args.group_id}`);

    case "tv_list_group_managers":
      return client.get(`/managed/groups/${args.group_id}/managers`);

    case "tv_add_group_managers": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.post(`/managed/groups/${group_id}/managers`, body);
    }

    case "tv_update_group_managers": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.put(`/managed/groups/${group_id}/managers`, body);
    }

    case "tv_remove_group_managers": {
      const { group_id, ...body } = args as { group_id: string } & Record<string, unknown>;
      return client.delete(`/managed/groups/${group_id}/managers`, body);
    }

    default:
      throw new Error(`Unknown managed group tool: ${name}`);
  }
}
