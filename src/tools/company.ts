import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const companyTools: Tool[] = [
  {
    name: "tv_get_company",
    description: "Returns details about the company associated with the API token.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_update_company",
    description: "Modifies company information.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Company name" },
        email: { type: "string", description: "Company email" },
      },
    },
  },
  {
    name: "tv_get_company_license",
    description: "Retrieves company licensing data.",
    inputSchema: { type: "object", properties: {} },
  },
];

export async function handleCompanyTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_get_company":
      return client.get("/company");

    case "tv_update_company":
      return client.put("/company", args);

    case "tv_get_company_license":
      return client.get("/company/license");

    default:
      throw new Error(`Unknown company tool: ${name}`);
  }
}
