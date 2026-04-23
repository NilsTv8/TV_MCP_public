import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const accountTools: Tool[] = [
  {
    name: "tv_get_account",
    description: "Returns the account associated with the used API token.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_update_account",
    description: "Modifies account settings such as email, name, or password.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "New email address" },
        name: { type: "string", description: "Account display name" },
        password: { type: "string", description: "New password" },
      },
    },
  },
  {
    name: "tv_create_account",
    description: "Creates a new TeamViewer account.",
    inputSchema: {
      type: "object",
      required: ["email", "password", "name"],
      properties: {
        email: { type: "string", description: "Email address for new account" },
        password: { type: "string", description: "Password for new account" },
        name: { type: "string", description: "Display name for new account" },
        language: { type: "string", description: "Preferred language code (e.g. 'en')" },
      },
    },
  },
  {
    name: "tv_get_tenant_ids",
    description: "Retrieves tenant associations for the current account.",
    inputSchema: { type: "object", properties: {} },
  },
];

export async function handleAccountTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_get_account":
      return client.get("/account");

    case "tv_update_account":
      return client.put("/account", args);

    case "tv_create_account":
      return client.post("/account", args);

    case "tv_get_tenant_ids":
      return client.get("/account/TenantIds");

    default:
      throw new Error(`Unknown account tool: ${name}`);
  }
}
