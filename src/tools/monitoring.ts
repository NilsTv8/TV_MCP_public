import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const monitoringTools: Tool[] = [
  {
    name: "tv_list_monitoring_alarms",
    description: "Gets the list of monitoring alarms for the account, with optional filtering.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by alarm status (e.g. 'open', 'closed')" },
        device_id: { type: "string", description: "Filter alarms by device ID" },
        group_id: { type: "string", description: "Filter alarms by group ID" },
        start_date: { type: "string", description: "Filter alarms from this date (ISO 8601)" },
        end_date: { type: "string", description: "Filter alarms until this date (ISO 8601)" },
        continuation_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  {
    name: "tv_list_monitoring_devices",
    description: "Returns devices that have monitoring enabled.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_activate_monitoring",
    description: "Activates patch management and monitoring services on a device.",
    inputSchema: {
      type: "object",
      required: ["teamviewer_id"],
      properties: {
        teamviewer_id: { type: "number", description: "TeamViewer numeric device ID" },
        monitoring_policy_id: { type: "string", description: "Monitoring policy ID to apply" },
        patch_management_policy_id: { type: "string", description: "Patch management policy ID to apply" },
      },
    },
  },
  {
    name: "tv_get_device_hardware_info",
    description: "Gets hardware information for a monitored device (CPU, RAM, disk, etc.).",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_get_device_system_info",
    description: "Gets system information for a monitored device (OS, hostname, etc.).",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID (UUID)" },
      },
    },
  },
  {
    name: "tv_get_device_software_info",
    description: "Gets installed software data for a monitored device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID (UUID)" },
      },
    },
  },
];

export async function handleMonitoringTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_monitoring_alarms":
      return client.get("/monitoring/alarms", {
        "parameters.status": args.status as string | undefined,
        "parameters.deviceId": args.device_id as string | undefined,
        "parameters.groupId": args.group_id as string | undefined,
        "parameters.startDate": args.start_date as string | undefined,
        "parameters.endDate": args.end_date as string | undefined,
        "parameters.continuationToken": args.continuation_token as string | undefined,
      });

    case "tv_list_monitoring_devices":
      return client.get("/monitoring/devices");

    case "tv_activate_monitoring":
      return client.post("/monitoring/devices", {
        teamviewer_id: args.teamviewer_id,
        monitoring_policy_id: args.monitoring_policy_id,
        patch_management_policy_id: args.patch_management_policy_id,
      });

    case "tv_get_device_hardware_info":
      return client.get(`/monitoring/devices/${args.device_id}/hardware`);

    case "tv_get_device_system_info":
      return client.get(`/monitoring/devices/${args.device_id}/information`);

    case "tv_get_device_software_info":
      return client.get(`/monitoring/devices/${args.device_id}/software`);

    default:
      throw new Error(`Unknown monitoring tool: ${name}`);
  }
}
