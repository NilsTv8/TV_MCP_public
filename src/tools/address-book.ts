import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const addressBookTools: Tool[] = [
  {
    name: "tv_get_address_book",
    description: "Gets the activation state of the company address book.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_update_address_book",
    description: "Modifies the activation status of the company address book.",
    inputSchema: {
      type: "object",
      required: ["active"],
      properties: {
        active: { type: "boolean", description: "Whether the address book is active" },
      },
    },
  },
  {
    name: "tv_list_hidden_members",
    description: "Lists accounts hidden from the company address book.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_hide_members",
    description: "Hides accounts from the company address book.",
    inputSchema: {
      type: "object",
      required: ["account_ids"],
      properties: {
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to hide from the address book",
        },
      },
    },
  },
  {
    name: "tv_unhide_all_members",
    description: "Restores visibility for all hidden accounts in the address book.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_unhide_member",
    description: "Restores visibility for a specific account in the address book.",
    inputSchema: {
      type: "object",
      required: ["account_id"],
      properties: {
        account_id: { type: "string", description: "Account ID to unhide" },
      },
    },
  },
];

export async function handleAddressBookTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_get_address_book":
      return client.get("/companyaddressbook");

    case "tv_update_address_book":
      return client.put("/companyaddressbook", { active: args.active });

    case "tv_list_hidden_members":
      return client.get("/companyaddressbook/hiddenmembers");

    case "tv_hide_members":
      return client.post("/companyaddressbook/hiddenmembers", { account_ids: args.account_ids });

    case "tv_unhide_all_members":
      return client.delete("/companyaddressbook/hiddenmembers");

    case "tv_unhide_member":
      return client.delete(`/companyaddressbook/hiddenmembers/${args.account_id}`);

    default:
      throw new Error(`Unknown address book tool: ${name}`);
  }
}
