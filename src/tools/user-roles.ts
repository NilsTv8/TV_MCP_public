import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const userRoleTools: Tool[] = [
  // User Roles
  {
    name: "tv_list_user_roles",
    description: "Returns all user roles defined in the company.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_create_user_role",
    description: "Creates a new user role with specified permissions.",
    inputSchema: {
      type: "object",
      required: ["name", "permissions"],
      properties: {
        name: { type: "string", description: "User role name" },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "List of permission strings to grant",
        },
      },
    },
  },
  {
    name: "tv_update_user_role",
    description: "Updates an existing user role's name or permissions.",
    inputSchema: {
      type: "object",
      required: ["user_role_id", "name", "permissions"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to update" },
        name: { type: "string", description: "New role name" },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Updated list of permissions",
        },
      },
    },
  },
  {
    name: "tv_delete_user_role",
    description: "Deletes a user role.",
    inputSchema: {
      type: "object",
      required: ["user_role_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to delete" },
      },
    },
  },
  {
    name: "tv_get_user_role_permissions",
    description: "Returns the available permission definitions for user roles.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_predefined_user_role",
    description: "Returns the predefined (default) user role.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_set_predefined_user_role",
    description: "Sets a specific role as the predefined (default) role for new users.",
    inputSchema: {
      type: "object",
      required: ["user_role_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to set as predefined" },
      },
    },
  },
  {
    name: "tv_clear_predefined_user_role",
    description: "Clears the predefined user role.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_assign_user_role_to_accounts",
    description: "Assigns a user role to one or more user accounts.",
    inputSchema: {
      type: "object",
      required: ["user_role_id", "user_ids"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to assign" },
        user_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of user account IDs (must start with 'u', e.g. 'u123456')",
        },
      },
    },
  },
  {
    name: "tv_assign_user_role_to_usergroup",
    description: "Assigns a user role to a user group.",
    inputSchema: {
      type: "object",
      required: ["user_role_id", "user_group_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to assign" },
        user_group_id: { type: "number", description: "User group ID" },
      },
    },
  },
  {
    name: "tv_unassign_user_role_from_accounts",
    description: "Removes a user role assignment from user accounts.",
    inputSchema: {
      type: "object",
      required: ["user_role_id", "user_ids"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to unassign" },
        user_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of user account IDs to unassign from",
        },
      },
    },
  },
  {
    name: "tv_unassign_user_role_from_usergroup",
    description: "Removes a user role assignment from a user group.",
    inputSchema: {
      type: "object",
      required: ["user_role_id", "user_group_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID to unassign" },
        user_group_id: { type: "number", description: "User group ID" },
      },
    },
  },
  {
    name: "tv_get_user_role_account_assignments",
    description: "Returns user accounts assigned to a specific user role.",
    inputSchema: {
      type: "object",
      required: ["user_role_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID" },
        continuation_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  {
    name: "tv_get_user_role_group_assignments",
    description: "Returns user groups assigned to a specific user role.",
    inputSchema: {
      type: "object",
      required: ["user_role_id"],
      properties: {
        user_role_id: { type: "string", description: "User role ID" },
        continuation_token: { type: "string", description: "Pagination continuation token" },
      },
    },
  },
  // User Groups
  {
    name: "tv_list_user_groups",
    description: "Returns all user groups.",
    inputSchema: {
      type: "object",
      properties: {
        pagination_token: { type: "string", description: "Pagination continuation token" },
        limit: { type: "number", description: "Maximum number of groups to return" },
      },
    },
  },
  {
    name: "tv_create_user_group",
    description: "Creates a new user group.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "User group display name" },
      },
    },
  },
  {
    name: "tv_get_user_group",
    description: "Returns a specific user group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
      },
    },
  },
  {
    name: "tv_update_user_group",
    description: "Changes a user group's display name.",
    inputSchema: {
      type: "object",
      required: ["group_id", "name"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
        name: { type: "string", description: "New display name" },
      },
    },
  },
  {
    name: "tv_delete_user_group",
    description: "Removes a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "User group ID to delete" },
      },
    },
  },
  {
    name: "tv_list_user_group_members",
    description: "Returns members of a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
        pagination_token: { type: "string", description: "Pagination continuation token" },
        limit: { type: "number", description: "Maximum number of members to return" },
      },
    },
  },
  {
    name: "tv_add_user_group_members",
    description: "Adds users to a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_ids"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to add to the group",
        },
      },
    },
  },
  {
    name: "tv_remove_user_group_members",
    description: "Removes users from a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_ids"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
        account_ids: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to remove from the group",
        },
      },
    },
  },
  {
    name: "tv_remove_user_group_member",
    description: "Removes a single user from a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id", "account_id"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
        account_id: { type: "string", description: "Account ID to remove" },
      },
    },
  },
  {
    name: "tv_get_user_group_role",
    description: "Returns the user role assigned to a user group.",
    inputSchema: {
      type: "object",
      required: ["group_id"],
      properties: {
        group_id: { type: "string", description: "User group ID" },
      },
    },
  },
];

export async function handleUserRoleTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    // User Roles
    case "tv_list_user_roles":
      return client.get("/userroles");

    case "tv_create_user_role":
      return client.post("/userroles", {
        Name: args.name,
        Permissions: args.permissions,
      });

    case "tv_update_user_role":
      return client.put("/userroles", {
        UserRoleId: args.user_role_id,
        Name: args.name,
        Permissions: args.permissions,
      });

    case "tv_delete_user_role":
      return client.delete("/userroles", undefined, {
        userRoleId: args.user_role_id as string,
      });

    case "tv_get_user_role_permissions":
      return client.get("/userroles/permissions");

    case "tv_get_predefined_user_role":
      return client.get("/userroles/predefined");

    case "tv_set_predefined_user_role":
      return client.put(`/userroles/${args.user_role_id}/predefined`, {});

    case "tv_clear_predefined_user_role":
      return client.delete("/userroles/predefined");

    case "tv_assign_user_role_to_accounts":
      return client.post("/userroles/assign/account", {
        UserRoleId: args.user_role_id,
        UserIds: args.user_ids,
      });

    case "tv_assign_user_role_to_usergroup":
      return client.post("/userroles/assign/usergroup", {
        UserRoleId: args.user_role_id,
        UserGroupId: args.user_group_id,
      });

    case "tv_unassign_user_role_from_accounts":
      return client.post("/userroles/unassign/account", {
        UserRoleId: args.user_role_id,
        UserIds: args.user_ids,
      });

    case "tv_unassign_user_role_from_usergroup":
      return client.post("/userroles/unassign/usergroup", {
        UserRoleId: args.user_role_id,
        UserGroupId: args.user_group_id,
      });

    case "tv_get_user_role_account_assignments":
      return client.get("/userroles/assignments/account", {
        userRoleId: args.user_role_id as string,
        continuationToken: args.continuation_token as string | undefined,
      });

    case "tv_get_user_role_group_assignments":
      return client.get("/userroles/assignments/usergroups", {
        userRoleId: args.user_role_id as string,
        continuationToken: args.continuation_token as string | undefined,
      });

    // User Groups
    case "tv_list_user_groups":
      return client.get("/usergroups", {
        paginationToken: args.pagination_token as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "tv_create_user_group":
      return client.post("/usergroups", { name: args.name });

    case "tv_get_user_group":
      return client.get(`/usergroups/${args.group_id}`);

    case "tv_update_user_group":
      return client.put(`/usergroups/${args.group_id}`, { name: args.name });

    case "tv_delete_user_group":
      return client.delete(`/usergroups/${args.group_id}`);

    case "tv_list_user_group_members":
      return client.get(`/usergroups/${args.group_id}/members`, {
        paginationToken: args.pagination_token as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "tv_add_user_group_members":
      return client.post(`/usergroups/${args.group_id}/members`, args.account_ids);

    case "tv_remove_user_group_members":
      return client.delete(`/usergroups/${args.group_id}/members`, args.account_ids);

    case "tv_remove_user_group_member":
      return client.delete(`/usergroups/${args.group_id}/members/${args.account_id}`);

    case "tv_get_user_group_role":
      return client.get(`/usergroups/${args.group_id}/userroles`);

    default:
      throw new Error(`Unknown user role tool: ${name}`);
  }
}
