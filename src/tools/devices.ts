import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const deviceTools: Tool[] = [
  {
    name: "tv_list_devices",
    description: "Lists all devices with optional filtering by group, online status, or alias.",
    inputSchema: {
      type: "object",
      properties: {
        groupid: { type: "string", description: "Filter by group ID" },
        online_state: {
          type: "string",
          enum: ["Online", "Busy", "NotSupported", "Offline"],
          description: "Filter by online state",
        },
        full_list: { type: "boolean", description: "Return all devices including deleted ones" },
      },
    },
  },
  {
    name: "tv_get_device",
    description: "Retrieves details of a specific device by ID.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
      },
    },
  },
  {
    name: "tv_create_device",
    description: "Creates a new device entry.",
    inputSchema: {
      type: "object",
      required: ["remotecontrol_id"],
      properties: {
        remotecontrol_id: { type: "string", description: "TeamViewer remote control ID (e.g. 'r123456789')" },
        groupid: { type: "string", description: "Group to assign device to" },
        alias: { type: "string", description: "Display name for the device" },
        description: { type: "string", description: "Device description" },
        password: { type: "string", description: "Personal password" },
      },
    },
  },
  {
    name: "tv_update_device",
    description: "Updates properties of an existing device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID to update" },
        alias: { type: "string", description: "New display name" },
        description: { type: "string", description: "New description" },
        password: { type: "string", description: "New personal password" },
        groupid: { type: "string", description: "Move device to this group ID" },
      },
    },
  },
  {
    name: "tv_delete_device",
    description: "Removes a device from the device list.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID to delete" },
      },
    },
  },
  {
    name: "tv_assign_device",
    description: "Assigns a device to the current user account.",
    inputSchema: {
      type: "object",
      required: ["remotecontrol_id"],
      properties: {
        remotecontrol_id: { type: "string", description: "TeamViewer remote control ID" },
        alias: { type: "string", description: "Display name for the device" },
        groupid: { type: "string", description: "Group to assign device to" },
      },
    },
  },
  {
    name: "tv_list_iot_sensors",
    description: "Lists all IoT sensors associated with a device.",
    inputSchema: {
      type: "object",
      required: ["device_id"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
      },
    },
  },
  {
    name: "tv_create_iot_sensor",
    description: "Creates a new IoT sensor on a device.",
    inputSchema: {
      type: "object",
      required: ["device_id", "name", "type"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
        name: { type: "string", description: "Sensor name" },
        type: { type: "string", description: "Sensor type" },
        unit: { type: "string", description: "Measurement unit" },
      },
    },
  },
  {
    name: "tv_get_iot_sensor",
    description: "Retrieves configuration for a specific IoT sensor.",
    inputSchema: {
      type: "object",
      required: ["device_id", "sensor_id"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
        sensor_id: { type: "string", description: "Sensor ID" },
      },
    },
  },
  {
    name: "tv_update_iot_sensor",
    description: "Modifies settings of an IoT sensor.",
    inputSchema: {
      type: "object",
      required: ["device_id", "sensor_id"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
        sensor_id: { type: "string", description: "Sensor ID" },
        name: { type: "string", description: "New sensor name" },
        unit: { type: "string", description: "New measurement unit" },
      },
    },
  },
  {
    name: "tv_delete_iot_sensor",
    description: "Removes an IoT sensor from a device.",
    inputSchema: {
      type: "object",
      required: ["device_id", "sensor_id"],
      properties: {
        device_id: { type: "string", description: "Device ID" },
        sensor_id: { type: "string", description: "Sensor ID" },
      },
    },
  },
];

export async function handleDeviceTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_devices": {
      const { groupid, online_state, full_list } = args as {
        groupid?: string;
        online_state?: string;
        full_list?: boolean;
      };
      return client.get("/devices", { groupid, online_state, full_list });
    }

    case "tv_get_device":
      return client.get(`/devices/${args.device_id}`);

    case "tv_create_device": {
      const { device_id: _id, ...body } = args as { device_id?: string } & Record<string, unknown>;
      return client.post("/devices", body);
    }

    case "tv_update_device": {
      const { device_id, ...body } = args as { device_id: string } & Record<string, unknown>;
      return client.put(`/devices/${device_id}`, body);
    }

    case "tv_delete_device":
      return client.delete(`/devices/${args.device_id}`);

    case "tv_assign_device": {
      const { device_id: _id, ...body } = args as { device_id?: string } & Record<string, unknown>;
      return client.post("/devices/assign", body);
    }

    case "tv_list_iot_sensors":
      return client.get(`/devices/${args.device_id}/iot/sensors`);

    case "tv_create_iot_sensor": {
      const { device_id, ...body } = args as { device_id: string } & Record<string, unknown>;
      return client.post(`/devices/${device_id}/iot/sensors`, body);
    }

    case "tv_get_iot_sensor":
      return client.get(`/devices/${args.device_id}/iot/sensors/${args.sensor_id}`);

    case "tv_update_iot_sensor": {
      const { device_id, sensor_id, ...body } = args as { device_id: string; sensor_id: string } & Record<string, unknown>;
      return client.put(`/devices/${device_id}/iot/sensors/${sensor_id}`, body);
    }

    case "tv_delete_iot_sensor":
      return client.delete(`/devices/${args.device_id}/iot/sensors/${args.sensor_id}`);

    default:
      throw new Error(`Unknown device tool: ${name}`);
  }
}
