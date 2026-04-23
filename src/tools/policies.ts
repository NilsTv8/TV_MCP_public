import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const policyTools: Tool[] = [
  // TeamViewer Policies
  {
    name: "tv_list_teamviewer_policies",
    description: "Returns a list of TeamViewer configuration policies.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_create_teamviewer_policy",
    description: "Creates a new TeamViewer configuration policy.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Policy name" },
        settings: {
          type: "array",
          items: { type: "object" },
          description: "Array of policy setting objects",
        },
        default: { type: "boolean", description: "Set as the default policy" },
      },
    },
  },
  {
    name: "tv_get_teamviewer_policy",
    description: "Gets details of a specific TeamViewer policy.",
    inputSchema: {
      type: "object",
      required: ["policy_id"],
      properties: {
        policy_id: { type: "string", description: "Policy ID" },
      },
    },
  },
  {
    name: "tv_update_teamviewer_policy",
    description: "Updates an existing TeamViewer policy.",
    inputSchema: {
      type: "object",
      required: ["policy_id"],
      properties: {
        policy_id: { type: "string", description: "Policy ID" },
        name: { type: "string", description: "New policy name" },
        settings: {
          type: "array",
          items: { type: "object" },
          description: "Updated array of policy setting objects",
        },
        default: { type: "boolean", description: "Set as the default policy" },
      },
    },
  },
  {
    name: "tv_delete_teamviewer_policy",
    description: "Deletes a TeamViewer policy.",
    inputSchema: {
      type: "object",
      required: ["policy_id"],
      properties: {
        policy_id: { type: "string", description: "Policy ID to delete" },
      },
    },
  },
  // Monitoring Policies
  {
    name: "tv_list_monitoring_policies",
    description: "Returns the list of monitoring policies.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_monitoring_policy",
    description: "Gets details of a specific monitoring policy.",
    inputSchema: {
      type: "object",
      required: ["policy_id"],
      properties: {
        policy_id: { type: "string", description: "Monitoring policy ID" },
      },
    },
  },
  {
    name: "tv_assign_monitoring_policy",
    description: "Assigns or updates monitoring policies on devices or groups.",
    inputSchema: {
      type: "object",
      properties: {
        assignments: {
          type: "array",
          items: { type: "object" },
          description: "Array of assignment objects specifying devices/groups and policy IDs",
        },
      },
    },
  },
  // Patch Management Policies
  {
    name: "tv_list_patch_management_policies",
    description: "Returns the list of patch management policies.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_patch_management_policy",
    description: "Gets details of a specific patch management policy.",
    inputSchema: {
      type: "object",
      required: ["policy_id"],
      properties: {
        policy_id: { type: "string", description: "Patch management policy ID" },
      },
    },
  },
  {
    name: "tv_assign_patch_management_policy",
    description: "Assigns or updates patch management policies on devices or groups.",
    inputSchema: {
      type: "object",
      properties: {
        assignments: {
          type: "array",
          items: { type: "object" },
          description: "Array of assignment objects specifying devices/groups and policy IDs",
        },
      },
    },
  },
];

export async function handlePolicyTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_teamviewer_policies":
      return client.get("/TeamViewerPolicies");

    case "tv_create_teamviewer_policy": {
      const { policy_id: _id, ...body } = args as { policy_id?: string } & Record<string, unknown>;
      return client.post("/TeamViewerPolicies", body);
    }

    case "tv_get_teamviewer_policy":
      return client.get(`/TeamViewerPolicies/${args.policy_id}`);

    case "tv_update_teamviewer_policy": {
      const { policy_id, ...body } = args as { policy_id: string } & Record<string, unknown>;
      return client.put(`/TeamViewerPolicies/${policy_id}`, body);
    }

    case "tv_delete_teamviewer_policy":
      return client.delete(`/TeamViewerPolicies/${args.policy_id}`);

    case "tv_list_monitoring_policies":
      return client.get("/Monitoring/Policy");

    case "tv_get_monitoring_policy":
      return client.get(`/Monitoring/Policy/${args.policy_id}`);

    case "tv_assign_monitoring_policy":
      return client.post("/Monitoring/Policy/Assign", args.assignments);

    case "tv_list_patch_management_policies":
      return client.get("/PatchManagement/Policy");

    case "tv_get_patch_management_policy":
      return client.get(`/PatchManagement/Policy/${args.policy_id}`);

    case "tv_assign_patch_management_policy":
      return client.post("/PatchManagement/Policy/Assign", args.assignments);

    default:
      throw new Error(`Unknown policy tool: ${name}`);
  }
}
