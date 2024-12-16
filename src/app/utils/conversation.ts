import { Logger } from "./logger";
import { redis } from "./redis";

const logger = new Logger("conversation");

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  parentId?: string; // Original conversation ID if this is a shared version
}

function isValidContent(content: string): boolean {
  try {
    // First clean the content
    const cleanedContent = cleanContent(content);
    // Then try to stringify it
    JSON.stringify({ content: cleanedContent });
    return true;
  } catch (error) {
    logger.error("Content validation failed:", error);
    return false;
  }
}

function cleanContent(content: string): string {
  if (typeof content !== "string") {
    logger.warn("Non-string content received:", { content });
    return "";
  }

  return content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[^;]+;/g, "") // Remove HTML entities
    .replace(/<!DOCTYPE[^>]*>/g, "") // Remove DOCTYPE declarations
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\uFFFF]/g, "") // Keep only printable characters
    .trim();
}

export async function saveConversation(conversation: Conversation) {
  console.log(
    "conversation.ts save Redis URL:",
    process.env.UPSTASH_REDIS_REST_URL
  );
  console.log(
    "conversation.ts save Redis Token exists:",
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );

  try {
    if (!conversation.id || !Array.isArray(conversation.messages)) {
      throw new Error("Invalid conversation structure");
    }

    // Clean and validate each message
    const cleanedMessages = conversation.messages.map(msg => {
      if (typeof msg.content !== "string") {
        logger.warn("Invalid message content type:", { message: msg });
        return { ...msg, content: "" };
      }
      return {
        role: msg.role,
        content: cleanContent(msg.content),
      };
    });

    // Validate all messages after cleaning
    const isValid = cleanedMessages.every(msg => isValidContent(msg.content));
    if (!isValid) {
      throw new Error("Invalid message content after cleaning");
    }

    const cleanedConversation = {
      id: conversation.id,
      messages: cleanedMessages,
      createdAt: conversation.createdAt || Date.now(),
      parentId: conversation.parentId,
    };

    // Stringify with error handling
    const jsonString = JSON.stringify(cleanedConversation);
    if (!jsonString) {
      throw new Error("Failed to stringify conversation");
    }

    const key = `conversation:${conversation.id}`;
    logger.info(`Saving conversation: ${key}`);

    await redis.set(key, jsonString);
    // Set expiration to 7 days
    await redis.expire(key, 7 * 24 * 60 * 60);

    return true;
  } catch (error) {
    logger.error(`Failed to save conversation:`, error);
    throw error;
  }
}

export async function getConversation(
  id: string
): Promise<Conversation | null> {
  console.log(
    "conversation.ts get Redis URL:",
    process.env.UPSTASH_REDIS_REST_URL
  );
  console.log(
    "conversation.ts get Redis Token exists:",
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
  try {
    const key = `conversation:${id}`;
    const data = await redis.get(key);

    if (!data) {
      logger.info(`No conversation found for id: ${id}`);
      return null;
    }

    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      // Validate the structure
      if (!parsed || typeof parsed !== "object") {
        logger.error(`Invalid conversation data structure for id: ${id}`);
        return null;
      }

      // Validate and clean messages
      if (!Array.isArray(parsed.messages)) {
        logger.error(`Invalid messages array for conversation: ${id}`);
        return null;
      }

      const cleanedMessages = parsed.messages.map((msg: Message) => ({
        role:
          msg.role === "assistant" || msg.role === "user" ? msg.role : "user",
        content: cleanContent(msg.content || ""),
      }));

      return {
        id: parsed.id,
        messages: cleanedMessages,
        createdAt: parsed.createdAt || Date.now(),
        parentId: parsed.parentId,
      };
    } catch (parseError) {
      logger.error(`Failed to parse conversation data:`, parseError);
      return null;
    }
  } catch (error) {
    logger.error(`Failed to get conversation:`, error);
    throw error;
  }
}

export async function createSharedConversation(
  originalId: string
): Promise<string> {
  try {
    const original = await getConversation(originalId);
    if (!original) {
      throw new Error(`Original conversation not found: ${originalId}`);
    }

    const sharedId = generateId();
    const sharedConversation: Conversation = {
      id: sharedId,
      messages: original.messages.map(msg => ({
        role: msg.role,
        content: cleanContent(msg.content),
      })),
      createdAt: Date.now(),
      parentId: originalId,
    };

    const success = await saveConversation(sharedConversation);
    if (!success) {
      throw new Error("Failed to save shared conversation");
    }

    return sharedId;
  } catch (error) {
    logger.error(`Failed to create shared conversation:`, error);
    throw error;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
