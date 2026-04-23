import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const userTools: Tool[] = [
  {
    name: "tv_list_users",
    description: "Returns company users with optional filtering by email, name, or permissions.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Filter by email address" },
        name: { type: "string", description: "Filter by display name" },
        permissions: { type: "string", description: "Filter by permission" },
        full_list: { type: "boolean", description: "Include deactivated users" },
      },
    },
  },
  {
    name: "tv_create_user",
    description: "Creates a new user in the company.",
    inputSchema: {
      type: "object",
      required: ["email", "name", "language"],
      properties: {
        email: { type: "string", description: "User email address" },
        name: { type: "string", description: "Display name" },
        language: { type: "string", description: "Language code (e.g. 'en')" },
        password: { type: "string", description: "Password (if not using SSO)" },
        userRoleId: { type: "string", description: "User role ID to assign" },
        license_key: { type: "string", description: "License key" },
        log_sessions: { type: "boolean", description: "Enable session logging" },
        show_comment_window: { type: "boolean", description: "Show comment window after sessions" },
        tfa_enforcement: { type: "boolean", description: "Enforce two-factor authentication" },
      },
    },
  },
  {
    name: "tv_get_user",
    description: "Returns a specific user by ID.",
    inputSchema: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "string", description: "User ID (e.g. 'u123456')" },
      },
    },
  },
  {
    name: "tv_update_user",
    description: "Updates a user's properties.",
    inputSchema: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "string", description: "User ID" },
        email: { type: "string", description: "New email address" },
        name: { type: "string", description: "New display name" },
        password: { type: "string", description: "New password" },
        active: { type: "boolean", description: "Activate or deactivate the user" },
        AssignUserRoleIds: {
          type: "array",
          items: { type: "string" },
          description: "User role IDs to assign",
        },
        UnassignUserRoleIds: {
          type: "array",
          items: { type: "string" },
          description: "User role IDs to unassign",
        },
        log_sessions: { type: "boolean", description: "Enable session logging" },
        show_comment_window: { type: "boolean", description: "Show comment window after sessions" },
        tfa_enforcement: { type: "boolean", description: "Enforce two-factor authentication" },
        license_key: { type: "string", description: "License key" },
      },
    },
  },
  {
    name: "tv_delete_user",
    description: "Deletes a user.",
    inputSchema: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "string", description: "User ID to delete" },
        is_permanent_delete: { type: "boolean", description: "Permanently delete (true) or deactivate (false)" },
      },
    },
  },
  {
    name: "tv_deactivate_user_tfa",
    description: "Deactivates two-factor authentication for a user.",
    inputSchema: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "string", description: "User ID" },
      },
    },
  },
  {
    name: "tv_get_user_effective_permissions",
    description: "Returns the consolidated permissions from all roles assigned to the current user.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_user_roles",
    description: "Returns the roles assigned to a specific user.",
    inputSchema: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "string", description: "User ID" },
        pagination_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  {
    name: "tv_respond_to_join_company_request",
    description: "Approves or rejects a user's request to join the company.",
    inputSchema: {
      type: "object",
      required: ["user_id", "approve"],
      properties: {
        user_id: { type: "string", description: "User ID requesting to join" },
        approve: { type: "boolean", description: "true to approve, false to reject" },
      },
    },
  },
];

export async function handleUserTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_users":
      return client.get("/users", {
        email: args.email as string | undefined,
        name: args.name as string | undefined,
        permissions: args.permissions as string | undefined,
        full_list: args.full_list as boolean | undefined,
      });

    case "tv_create_user": {
      const { user_id: _id, ...body } = args as { user_id?: string } & Record<string, unknown>;
      return client.post("/users", body);
    }

    case "tv_get_user":
      return client.get(`/users/${args.user_id}`);

    case "tv_update_user": {
      const { user_id, ...body } = args as { user_id: string } & Record<string, unknown>;
      return client.put(`/users/${user_id}`, body);
    }

    case "tv_delete_user":
      return client.delete(`/users/${args.user_id}`, undefined, {
        isPermanentDelete: args.is_permanent_delete as boolean | undefined,
      });

    case "tv_deactivate_user_tfa":
      return client.delete(`/users/${args.user_id}/tfa`);

    case "tv_get_user_effective_permissions":
      return client.get("/users/effectivepermissions");

    case "tv_get_user_roles":
      return client.get(`/users/${args.user_id}/userroles`, {
        paginationToken: args.pagination_token as string | undefined,
      });

    case "tv_respond_to_join_company_request":
      return client.post("/users/respondtojointocompanyrequest", {
        userId: args.user_id,
        approve: args.approve,
      });

    default:
      throw new Error(`Unknown user tool: ${name}`);
  }
}
