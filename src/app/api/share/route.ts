import { NextResponse } from "next/server";
import { createSharedConversation } from "@/app/utils/conversation";
import { Logger } from "@/app/utils/logger";

const logger = new Logger("share-api");

export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();
    logger.info(`Creating share link for conversation: ${conversationId}`);

    const sharedId = await createSharedConversation(conversationId);
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/chat/${sharedId}`;

    return NextResponse.json({ shareUrl });
  } catch (error) {
    logger.error("Share creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
