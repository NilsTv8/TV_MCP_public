import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TeamViewerClient } from "../client.js";

export const chatTools: Tool[] = [
  {
    name: "tv_list_chat_rooms",
    description: "Lists all available chat rooms.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_get_chat_messages",
    description: "Retrieves messages for a chat room.",
    inputSchema: {
      type: "object",
      required: ["room_id"],
      properties: {
        room_id: { type: "string", description: "Chat room ID" },
        since: { type: "string", description: "Return messages after this ISO 8601 timestamp" },
        limit: { type: "number", description: "Maximum number of messages to return" },
      },
    },
  },
  {
    name: "tv_get_unread_messages",
    description: "Fetches all unread chat messages.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tv_send_chat_message",
    description: "Sends a new message to a chat room.",
    inputSchema: {
      type: "object",
      required: ["room_id", "content"],
      properties: {
        room_id: { type: "string", description: "Chat room ID to send message to" },
        content: { type: "string", description: "Message content" },
      },
    },
  },
  {
    name: "tv_mark_message_as_read",
    description: "Marks messages as read in a chat room.",
    inputSchema: {
      type: "object",
      required: ["room_id"],
      properties: {
        room_id: { type: "string", description: "Chat room ID" },
        message_id: { type: "string", description: "Mark messages up to this message ID as read" },
      },
    },
  },
];

export async function handleChatTool(
  name: string,
  args: Record<string, unknown>,
  client: TeamViewerClient
): Promise<unknown> {
  switch (name) {
    case "tv_list_chat_rooms":
      return client.get("/chat/Rooms");

    case "tv_get_chat_messages":
      return client.get("/chat/Messages", {
        roomId: args.room_id as string,
        since: args.since as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "tv_get_unread_messages":
      return client.get("/chat/UnreadMessages");

    case "tv_send_chat_message":
      return client.post("/chat/SendMessage", {
        room_id: args.room_id,
        content: args.content,
      });

    case "tv_mark_message_as_read":
      return client.put("/chat/MarkMessageAsRead", {
        room_id: args.room_id,
        message_id: args.message_id,
      });

    default:
      throw new Error(`Unknown chat tool: ${name}`);
  }
}
