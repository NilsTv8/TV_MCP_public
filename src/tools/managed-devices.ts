import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const managedDeviceTools: Tool[] = [
  {
    name: "tv_list_managed_devices",
    description: "Lists all directly managed devices of the manager.",
    inputSchema: {
      type: "object",
      properties: {
        pagination_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  {
    name: "tv_list_company_managed_devices",
    description: "Lists one page of company-managed devices.",
    inputSchema: {
      type: "object",
      properties: {
        pagination_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  {
    name: "tv_get_managed_device_assignment_data",
    description: "Creates an AssignmentData object for the currently logged-in account (used for onboarding).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_managed_device",
    description: "Gets details for a single managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_update_managed_device",
    description: "Changes properties of a managed device (name, policy, group, permission inheritance).",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
        name: { type: "string", description: "New device name" },
        teamviewerPolicyId: { type: "string", description: "TeamViewer policy ID to assign" },
        managedGroupId: { type: "string", description: "Managed group ID to assign device to" },
        permissionInheritanceType: {
          type: "number",
          description: "Permission inheritance type (0 = inherit from group, 1 = no inheritance)",
        },
      },
    },
  },
  {
    name: "tv_update_managed_device_description",
    description: "Changes the description of a managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id", "description"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
        description: { type: "string", description: "New device description" },
      },
    },
  },
  {
    name: "tv_delete_managed_device",
    description: "Removes management from a device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_remove_managed_device_policy",
    description: "Removes the assigned policy from a managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_get_managed_device_groups",
    description: "Lists managed groups a device is part of.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_update_managed_device_groups",
    description: "Edits the groups a managed device belongs to.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
        added_chain_ids: {
          type: "array",
          items: { type: "string" },
          description: "Group chain IDs to add device to",
        },
        removed_chain_ids: {
          type: "array",
          items: { type: "string" },
          description: "Group chain IDs to remove device from",
        },
      },
    },
  },
  {
    name: "tv_list_managed_device_managers",
    description: "Lists direct managers of a managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_add_managed_device_managers",
    description: "Adds direct managers to a managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id", "managers"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
        managers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Manager account ID" },
              permissions: { type: "array", items: { type: "string" } },
            },
          },
          description: "Managers to add with their permissions",
        },
      },
    },
  },
  {
    name: "tv_remove_managed_device_manager",
    description: "Removes a specific manager from a managed device.",
    inputSchema: {
      type: "object",
      required: ["device_id", "manager_id"],
      properties: {
        device_id: { type: "string", description: "Managed device ID (UUID)" },
        manager_id: { type: "string", description: "Manager account ID to remove" },
      },
    },
  },
];

export async function handleManagedDeviceTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_managed_devices":
      return client.get("/managed/devices", {
        paginationToken: args.pagination_token as string | undefined,
      });

    case "tv_list_company_managed_devices":
      return client.get("/managed/devices/company", {
        paginationToken: args.pagination_token as string | undefined,
      });

    case "tv_get_managed_device_assignment_data":
      return client.get("/managed/devices/assignment-data");

    case "tv_get_managed_device":
      return client.get(`/managed/devices/${args.device_id}`);

    case "tv_update_managed_device": {
      const { device_id, ...body } = args as { device_id: string } & Record<string, unknown>;
      return client.put(`/managed/devices/${device_id}`, body);
    }

    case "tv_update_managed_device_description": {
      const { device_id, description } = args as { device_id: string; description: string };
      return client.put(`/managed/devices/${device_id}/description`, {
        deviceDescription: description,
      });
    }

    case "tv_delete_managed_device":
      return client.delete(`/managed/devices/${args.device_id}`);

    case "tv_remove_managed_device_policy":
      return client.put(`/managed/devices/${args.device_id}/policy/remove`, {});

    case "tv_get_managed_device_groups":
      return client.get(`/managed/devices/${args.device_id}/groups`);

    case "tv_update_managed_device_groups": {
      const { device_id, added_chain_ids, removed_chain_ids } = args as {
        device_id: string;
        added_chain_ids?: string[];
        removed_chain_ids?: string[];
      };
      return client.put(`/managed/devices/${device_id}/groups`, {
        AddedChainIds: added_chain_ids,
        RemovedChainIds: removed_chain_ids,
      });
    }

    case "tv_list_managed_device_managers":
      return client.get(`/managed/devices/${args.device_id}/managers`);

    case "tv_add_managed_device_managers": {
      const { device_id, managers } = args as { device_id: string; managers: unknown[] };
      return client.post(`/managed/devices/${device_id}/managers`, managers);
    }

    case "tv_remove_managed_device_manager":
      return client.delete(`/managed/devices/${args.device_id}/managers/${args.manager_id}`);

    default:
      throw new Error(`Unknown managed device tool: ${name}`);
  }
}
