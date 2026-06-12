# TeamViewer MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes the [TeamViewer Web API](https://webapi.teamviewer.com/api/v1/docs) as tools for AI assistants such as Claude and Microsoft 365 Copilot.

## Features

127 tools across 16 functional groups:

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
| OAuth2 | Authorization code flow, token refresh, permanent tokens |
| Remote Control | One-click connect to devices |

---

## Transports

The server supports two transports:

| Transport | Use case |
|---|---|
| **stdio** | Claude Desktop / Claude Code — the client spawns the server as a local process |
| **HTTP** | M365 Copilot / remote clients — the server runs as an HTTP service on a reachable URL |

---

## Requirements

- [Node.js](https://nodejs.org) 18 or later
- A TeamViewer account
- A TeamViewer API token (script token or OAuth2)

---

## Step 1 — Get a TeamViewer API Token

**Option A — Script token (recommended, simplest)**

1. Go to **[login.teamviewer.com](https://login.teamviewer.com)** and sign in.
2. Click your avatar → **Edit profile** → **Apps** → **Create script token**.
3. Give it a name and select the scopes you need (see [Available Scopes](#available-scopes)).
4. Copy the token — you will use it as `TEAMVIEWER_API_TOKEN`.

**Option B — OAuth2 app (for multi-user / delegated access)**

1. Go to **[login.teamviewer.com/nav#app/myapps](https://login.teamviewer.com/nav#app/myapps)** and sign in.
2. Click **Create app**, fill in a name and redirect URI, and select scopes.
3. Copy the **Client ID** and **Client Secret**.
4. After connecting the server, run the OAuth flow from your AI assistant (see [OAuth2 Flow](#oauth2-flow)).

---

## Step 2 — Install

```bash
git clone https://github.com/NilsTv8/TV_MCP_public.git
cd TV_MCP_public
npm install
npm run build
```

---

## Step 3 — Connect to an AI Client

### Claude Desktop (stdio)

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
        "TEAMVIEWER_API_TOKEN": "your-script-token"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

---

### Claude Code (stdio)

```bash
claude mcp add teamviewer \
  -e TEAMVIEWER_API_TOKEN=your-script-token \
  -- node /absolute/path/to/TV_MCP_public/dist/index.js
```

---

### Claude Desktop — Remote HTTP

If the server is running remotely (e.g. exposed via ngrok), you can connect Claude Desktop without a local Node.js install:

```json
{
  "mcpServers": {
    "teamviewer": {
      "url": "https://your-server-url/mcp"
    }
  }
}
```

---

### Microsoft 365 Copilot / Copilot Studio (HTTP)

M365 Copilot requires the server to be reachable over HTTPS. The server must be started in HTTP mode.

**Start the server in HTTP mode**

```bash
TEAMVIEWER_API_TOKEN=your-script-token node dist/index.js --http
```

The server listens on port `3000` by default. Set `HTTP_PORT` or `PORT` to override.

**Expose it over HTTPS**

For testing, use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

For production, deploy behind a reverse proxy (nginx, Caddy) or to a cloud platform (Azure App Service, etc.) with TLS termination.

**Add to Copilot Studio**

1. Open **Copilot Studio** and select your agent.
2. Go to **Actions** → **Add an action** → **MCP server (preview)**.
3. Set the **Server URL** to `https://your-host/mcp`.
4. Set **Authentication** to **No authentication** (the server relies on network-level access control when no `MCP_BEARER_TOKEN` is set) or configure a static bearer token:
   - Start the server with `MCP_BEARER_TOKEN=your-secret`
   - In Copilot Studio, set auth to **API key**, parameter name `Authorization`, location **Header**, value `Bearer your-secret`
5. Click **Next** — Copilot Studio will discover all 127 tools automatically.

> **Note:** Copilot Studio routes requests through Azure API Management, which strips the `Authorization` header. If you use bearer token auth, set a custom header name (e.g. `X-API-Key`) and update the server check accordingly.

---

## OAuth2 Flow

If you are using Option B (OAuth2 app) instead of a script token, authenticate from within your AI assistant after connecting:

1. Call `tv_oauth_get_auth_url` — returns an authorization URL.
2. Open the URL, log in, and click **Allow**.
3. Call `tv_oauth_exchange_code` with the `code` from the redirect URL.

Tokens are stored in `~/.teamviewer-mcp/tokens.json` (mode `0600`) and used automatically for all subsequent calls.

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
# stdio mode (no build step)
TEAMVIEWER_API_TOKEN=your-token npm run dev

# HTTP mode (no build step)
TEAMVIEWER_API_TOKEN=your-token npm run dev:http

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
