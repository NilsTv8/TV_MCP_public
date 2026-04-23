# TeamViewer MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes the [TeamViewer Web API](https://webapi.teamviewer.com/api/v1/docs) as tools for AI assistants such as Claude.

## Features

125 tools across 15 functional groups:

| Group | Tools |
|---|---|
| Account | Get/update/create account, tenant IDs |
| Company | Get/update company, license info |
| Device Groups | CRUD, share/unshare |
| Devices + IoT Sensors | CRUD devices, assign, full IoT sensor management |
| Contacts | CRUD |
| Event Logging | Query audit logs by date, type, email, session |
| Managed Devices | List, update, delete, managers, groups, policy removal |
| Managed Groups | CRUD, manager management |
| Monitoring | Alarms, device hardware/software/system info, activation |
| Policy Management | TeamViewer policies (CRUD), monitoring & patch management policies |
| Connection Reports | List/get/delete reports, AI summary, chat & voice transcripts, screenshots |
| Sessions | CRUD service case sessions |
| User Management | CRUD users, TFA, effective permissions, role assignments |
| User Roles + User Groups | Full role CRUD, assign/unassign to accounts & groups, user group management |
| OAuth2 | Authorization code flow with PKCE, token refresh, permanent tokens |

---

## Requirements

- [Node.js](https://nodejs.org) 18 or later
- A TeamViewer account
- An OAuth2 app created in the [TeamViewer Developer Portal](https://login.teamviewer.com/nav#app/myapps)

---

## Step 1 — Create an OAuth2 App

Before running the server you must register an OAuth2 application in the TeamViewer Developer Portal. This provides the `client_id` and `client_secret` the server uses to exchange tokens on your behalf.

1. Go to **[login.teamviewer.com/nav#app/myapps](https://login.teamviewer.com/nav#app/myapps)** and sign in.
2. Click **Create app**.
3. Fill in the required fields:
   - **Name** — any descriptive name (e.g. `My MCP Server`)
   - **Description** — optional
   - **Redirect URI** — the URI TeamViewer will redirect to after the user authorizes. For local use `http://localhost` works (you only need to copy the `code` from the redirect URL — no server required).
   - **Scopes** — select the permissions your app needs (see [Available Scopes](#available-scopes) below).
4. Click **Save**. Copy the **Client ID** and **Client Secret** — you will need them in the next step.

---

## Step 2 — Install

```bash
git clone https://github.com/NilsTv8/TV_MCP_public.git
cd TV_MCP_public
npm install
npm run build
```

---

## Step 3 — Configure Environment Variables

The server reads credentials from environment variables. Set these in your MCP client configuration (see [MCP Client Setup](#mcp-client-setup)):

| Variable | Required | Description |
|---|---|---|
| `TEAMVIEWER_CLIENT_ID` | Yes | OAuth2 client ID from the Developer Portal |
| `TEAMVIEWER_CLIENT_SECRET` | Yes | OAuth2 client secret from the Developer Portal |
| `TEAMVIEWER_REDIRECT_URI` | Yes | Redirect URI registered in the Developer Portal |
| `TEAMVIEWER_API_TOKEN` | Optional | Static/permanent API token (bypasses OAuth entirely) |

> **Note:** If `TEAMVIEWER_API_TOKEN` is set, the server uses it directly and skips the OAuth flow. This is the simplest option if you already have a permanent token.

---

## Step 4 — MCP Client Setup

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "teamviewer": {
      "command": "node",
      "args": ["/absolute/path/to/TV_MCP_public/dist/index.js"],
      "env": {
        "TEAMVIEWER_CLIENT_ID": "your-client-id",
        "TEAMVIEWER_CLIENT_SECRET": "your-client-secret",
        "TEAMVIEWER_REDIRECT_URI": "http://localhost"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code (CLI)

```bash
claude mcp add teamviewer \
  -e TEAMVIEWER_CLIENT_ID=your-client-id \
  -e TEAMVIEWER_CLIENT_SECRET=your-client-secret \
  -e TEAMVIEWER_REDIRECT_URI=http://localhost \
  -- node /absolute/path/to/TV_MCP_public/dist/index.js
```

### Other MCP Clients

The server communicates over **stdio** and is compatible with any MCP-capable client. Pass the three environment variables when spawning the process.

---

## Step 5 — Authenticate

Once the server is connected, run the OAuth flow from within your AI assistant:

**1. Get the authorization URL**

Call `tv_oauth_get_auth_url` (optionally pass a `scope`). The tool returns an `authorization_url`.

**2. Open the URL in your browser**

Log in to TeamViewer and click **Allow**. You will be redirected to your `TEAMVIEWER_REDIRECT_URI` with a `code` parameter in the URL, e.g.:

```
http://localhost/?code=ABC123XYZ&state=...
```

**3. Exchange the code**

Call `tv_oauth_exchange_code` and pass the `code` value. The access token and refresh token are saved to `~/.teamviewer-mcp/tokens.json` (permissions `0600`). All subsequent API calls use this token automatically.

**Check status at any time** with `tv_oauth_token_status`.

---

## Authentication Reference

| Tool | Description |
|---|---|
| `tv_oauth_get_auth_url` | Generates the authorization URL (PKCE) |
| `tv_oauth_exchange_code` | Exchanges the auth code for tokens and saves them |
| `tv_oauth_refresh_token` | Refreshes the access token using the stored refresh token |
| `tv_oauth_revoke_token` | Revokes the active token and clears local storage |
| `tv_oauth_create_permanent_token` | Creates a non-expiring permanent API token |
| `tv_oauth_delete_permanent_token` | Deletes the permanent token |
| `tv_oauth_token_status` | Shows current authentication state (source, expiry, scopes) |
| `tv_oauth_clear_tokens` | Clears locally stored tokens (logout) |

---

## Available Scopes

Select the scopes your app needs when creating it in the Developer Portal:

| Scope | Access |
|---|---|
| `UserInfo.View` | Read account and user info |
| `Computers.View` | Read device list |
| `Computers.Edit` | Modify devices |
| `SessionCode.Create` | Create service case sessions |
| `Reports.View` | Read connection reports |
| `ManagedGroups.View` | Read managed groups |
| `ManagedGroups.Edit` | Modify managed groups |
| `UserManagement.View` | Read users |
| `UserManagement.Edit` | Create and modify users |
| `EventLogging.View` | Read audit logs |

For full access during development you can select all scopes.

---

## Development

```bash
# Run in development mode (no build step)
TEAMVIEWER_CLIENT_ID=xxx TEAMVIEWER_CLIENT_SECRET=yyy TEAMVIEWER_REDIRECT_URI=http://localhost npm run dev

# Rebuild after changes
npm run build
```

---

## Tool Reference

### Account Management
| Tool | Description |
|---|---|
| `tv_get_account` | Returns the account associated with the API token |
| `tv_update_account` | Updates account settings |
| `tv_create_account` | Creates a new account |
| `tv_get_tenant_ids` | Retrieves tenant associations |

### Company
| Tool | Description |
|---|---|
| `tv_get_company` | Returns company details |
| `tv_update_company` | Updates company information |
| `tv_get_company_license` | Retrieves licensing data |

### Device Groups
| Tool | Description |
|---|---|
| `tv_list_device_groups` | Lists groups with optional name filter |
| `tv_create_device_group` | Creates a new group |
| `tv_get_device_group` | Returns a group by ID |
| `tv_update_device_group` | Updates a group |
| `tv_delete_device_group` | Deletes a group |
| `tv_share_device_group` | Shares a group with users |
| `tv_unshare_device_group` | Removes group sharing |

### Devices
| Tool | Description |
|---|---|
| `tv_list_devices` | Lists devices with optional filtering |
| `tv_get_device` | Returns a device by ID |
| `tv_create_device` | Adds a device to the list |
| `tv_update_device` | Updates device properties |
| `tv_delete_device` | Removes a device |
| `tv_assign_device` | Assigns a device to the account |
| `tv_list_iot_sensors` | Lists IoT sensors on a device |
| `tv_create_iot_sensor` | Creates a new IoT sensor |
| `tv_get_iot_sensor` | Returns a sensor by ID |
| `tv_update_iot_sensor` | Updates sensor settings |
| `tv_delete_iot_sensor` | Removes a sensor |

### Contacts
| Tool | Description |
|---|---|
| `tv_list_contacts` | Lists contacts |
| `tv_get_contact` | Returns a contact by ID |
| `tv_create_contact` | Sends a contact invite |
| `tv_delete_contact` | Removes a contact |

### Event Logging
| Tool | Description |
|---|---|
| `tv_get_event_logs` | Queries audit logs by date range, event type, account email, or session |

### Managed Devices
| Tool | Description |
|---|---|
| `tv_list_managed_devices` | Lists directly managed devices |
| `tv_list_company_managed_devices` | Lists company-managed devices |
| `tv_get_managed_device_assignment_data` | Returns assignment data for onboarding |
| `tv_get_managed_device` | Returns a managed device by ID |
| `tv_update_managed_device` | Updates device name, policy, or group |
| `tv_update_managed_device_description` | Updates device description |
| `tv_delete_managed_device` | Removes management from a device |
| `tv_remove_managed_device_policy` | Removes the assigned policy |
| `tv_get_managed_device_groups` | Lists groups a device belongs to |
| `tv_update_managed_device_groups` | Edits group membership |
| `tv_list_managed_device_managers` | Lists managers of a device |
| `tv_add_managed_device_managers` | Adds managers to a device |
| `tv_remove_managed_device_manager` | Removes a manager from a device |

### Managed Groups
| Tool | Description |
|---|---|
| `tv_list_managed_groups` | Lists managed groups |
| `tv_get_managed_group` | Returns a group by ID |
| `tv_create_managed_group` | Creates a managed group |
| `tv_update_managed_group` | Updates a group |
| `tv_delete_managed_group` | Marks a group as deleted |
| `tv_list_group_managers` | Lists managers of a group |
| `tv_add_group_managers` | Adds managers to a group |
| `tv_update_group_managers` | Updates manager permissions |
| `tv_remove_group_managers` | Removes managers from a group |

### Monitoring
| Tool | Description |
|---|---|
| `tv_list_monitoring_alarms` | Lists alarms with optional filters |
| `tv_list_monitoring_devices` | Lists monitored devices |
| `tv_activate_monitoring` | Activates monitoring on a device |
| `tv_get_device_hardware_info` | Returns hardware data (CPU, RAM, disk) |
| `tv_get_device_system_info` | Returns OS and system information |
| `tv_get_device_software_info` | Returns installed software |

### Policy Management
| Tool | Description |
|---|---|
| `tv_list_teamviewer_policies` | Lists TeamViewer configuration policies |
| `tv_create_teamviewer_policy` | Creates a policy |
| `tv_get_teamviewer_policy` | Returns a policy by ID |
| `tv_update_teamviewer_policy` | Updates a policy |
| `tv_delete_teamviewer_policy` | Deletes a policy |
| `tv_list_monitoring_policies` | Lists monitoring policies |
| `tv_get_monitoring_policy` | Returns a monitoring policy by ID |
| `tv_assign_monitoring_policy` | Assigns monitoring policies to devices/groups |
| `tv_list_patch_management_policies` | Lists patch management policies |
| `tv_get_patch_management_policy` | Returns a patch policy by ID |
| `tv_assign_patch_management_policy` | Assigns patch policies to devices/groups |

### Connection Reports
| Tool | Description |
|---|---|
| `tv_list_connection_reports` | Lists session reports (max 1000 per call) |
| `tv_get_connection_report` | Returns a report by ID |
| `tv_update_connection_report` | Updates report notes |
| `tv_delete_connection_report` | Deletes a report |
| `tv_get_connection_ai_summary` | Returns AI-generated session summary |
| `tv_get_connection_chat_transcript` | Returns chat transcript |
| `tv_get_connection_voice_transcript` | Returns voice call transcript |
| `tv_list_connection_screenshots` | Lists available screenshots |
| `tv_get_connection_screenshot` | Downloads a specific screenshot |
| `tv_list_device_reports` | Lists device reports |

### Sessions
| Tool | Description |
|---|---|
| `tv_list_sessions` | Lists service case sessions |
| `tv_get_session` | Returns a session by code |
| `tv_create_session` | Creates a service case session |
| `tv_update_session` | Updates a session |
| `tv_delete_session` | Closes a session |

### User Management
| Tool | Description |
|---|---|
| `tv_list_users` | Lists users with optional filtering |
| `tv_create_user` | Creates a user |
| `tv_get_user` | Returns a user by ID |
| `tv_update_user` | Updates user properties |
| `tv_delete_user` | Deletes a user |
| `tv_deactivate_user_tfa` | Deactivates two-factor authentication |
| `tv_get_user_effective_permissions` | Returns consolidated permissions |
| `tv_get_user_roles` | Returns roles assigned to a user |
| `tv_respond_to_join_company_request` | Approves or rejects a join request |

### User Roles
| Tool | Description |
|---|---|
| `tv_list_user_roles` | Lists all user roles |
| `tv_create_user_role` | Creates a role with permissions |
| `tv_update_user_role` | Updates a role |
| `tv_delete_user_role` | Deletes a role |
| `tv_get_user_role_permissions` | Returns available permission definitions |
| `tv_get_predefined_user_role` | Returns the predefined default role |
| `tv_set_predefined_user_role` | Sets a role as the default |
| `tv_clear_predefined_user_role` | Clears the default role |
| `tv_assign_user_role_to_accounts` | Assigns a role to user accounts |
| `tv_assign_user_role_to_usergroup` | Assigns a role to a user group |
| `tv_unassign_user_role_from_accounts` | Removes a role from user accounts |
| `tv_unassign_user_role_from_usergroup` | Removes a role from a user group |
| `tv_get_user_role_account_assignments` | Lists accounts assigned to a role |
| `tv_get_user_role_group_assignments` | Lists groups assigned to a role |

### User Groups
| Tool | Description |
|---|---|
| `tv_list_user_groups` | Lists all user groups |
| `tv_create_user_group` | Creates a user group |
| `tv_get_user_group` | Returns a group by ID |
| `tv_update_user_group` | Updates a group name |
| `tv_delete_user_group` | Removes a group |
| `tv_list_user_group_members` | Lists group members |
| `tv_add_user_group_members` | Adds users to a group |
| `tv_remove_user_group_members` | Removes users from a group |
| `tv_remove_user_group_member` | Removes a single user from a group |
| `tv_get_user_group_role` | Returns the role assigned to a group |

---

## License

MIT
