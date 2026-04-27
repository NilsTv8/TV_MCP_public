import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export const remoteControlTools: Tool[] = [
  {
    name: "tv_connect_device",
    description:
      "Opens a TeamViewer remote control session to a device. " +
      "The teamviewer_id is the numeric TV ID visible on the managed device (e.g. from tv_list_managed_devices or tv_get_managed_device). " +
      "Launches the TeamViewer desktop app on this machine.",
    inputSchema: {
      type: "object",
      required: ["teamviewer_id"],
      properties: {
        teamviewer_id: {
          type: "string",
          description: "The TeamViewer ID of the remote device (numeric, e.g. '123456789')",
        },
      },
    },
  },
];

export async function handleRemoteControlTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (name !== "tv_connect_device") {
    throw new Error(`Unknown remote control tool: ${name}`);
  }

  const { teamviewer_id } = args as { teamviewer_id: string };

  if (!teamviewer_id || !/^\d+$/.test(teamviewer_id.replace(/\s/g, ""))) {
    throw new Error("teamviewer_id must be a numeric TeamViewer ID (digits only)");
  }

  const tvId = teamviewer_id.replace(/\s/g, "");
  const url = `teamviewerapi://remotecontrol/?remotecontrolid=${tvId}&thirdpartyname=tv_claude`;

  const openCmd =
    process.platform === "win32" ? `start "" "${url}"` :
    process.platform === "darwin" ? `open "${url}"` :
    `xdg-open "${url}"`;

  await execAsync(openCmd);

  return {
    message: `Remote control session initiated for device ${tvId}.`,
    url,
  };
}
