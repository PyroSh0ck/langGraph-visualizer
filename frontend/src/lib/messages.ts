import type { Message, MessageRole } from "./types";

export function serializeMessages(messages: Message[]): Message[] {
  return messages.filter((msg) => msg.content.trim() !== "");
}

export function deserializeMessages(value: unknown): Message[] {
  // If already an array of proper Messages
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        role: (
          item.role === "system" || item.role === "human"
            ? item.role
            : "human"
        ) as MessageRole,
        content: String(item.content ?? ""),
      }));
  }

  // Try to parse as JSON string
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return deserializeMessages(parsed);
    } catch {
      return [];
    }
  }

  // Handle legacy shape: { message: "..." }
  if (value && typeof value === "object" && "message" in value) {
    const legacyValue = value as { message?: unknown };
    return [
      {
        role: "human",
        content: String(legacyValue.message ?? ""),
      },
    ];
  }

  return [];
}

export function toLangChain(
  messages: Message[]
): Array<{ type: "system" | "human"; content: string }> {
  // TODO: real langchain BaseMessage[]
  return messages.map((m) => ({
    type: m.role === "system" ? "system" : "human",
    content: m.content,
  }));
}
