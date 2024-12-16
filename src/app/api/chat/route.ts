// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeUrl, urlPattern } from "@/app/utils/scraper";
import { Logger } from "@/app/utils/logger";

const logger = new Logger("api");

export async function POST(req: Request) {
  try {
    const { message, messages } = await req.json();
    logger.info("Processing message:", { message });

    let processedMessage = message;
    let scrapedContent = "";

    // Find URLs in the message
    const matches = message.match(urlPattern);
    if (matches && matches.length > 0) {
      // Get the first matched URL
      const url = matches[0];
      logger.info("Found URL:", { url });

      try {
        const scraperResponse = await scrapeUrl(url);
        if (scraperResponse && scraperResponse.content) {
          // Get the most relevant parts of the content
          const relevantContent = extractRelevantContent(
            scraperResponse.content,
            15000 // Target around 8000 tokens to leave room for system prompt and response
          );
          scrapedContent = relevantContent;
          // Remove the matched URL from the message
          processedMessage = message.replace(url, "").trim();
          logger.info("Successfully scraped content", {
            contentLength: scrapedContent.length,
          });
        }
      } catch (error) {
        logger.error("Error processing URL", error);
      }
    }

    const userPrompt = `
    Answer my question: "${processedMessage}"

    Based on the following content:
    <content>
      ${scrapedContent}
    </content>
    `;

    const llmMessages = [
      ...messages,
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const response = await getGroqResponse(llmMessages);
    return NextResponse.json({ message: response });
  } catch (error) {
    logger.error("Route handler error", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
// Helper function to extract the most relevant content while staying within token limits
function extractRelevantContent(content: string, targetTokens: number): string {
  // Rough estimate of 4 characters per token
  const targetLength = targetTokens * 4;
  const MAX_TOKENS = 15000; // Leave room for system prompts and responses

  // Get the first few paragraphs as they usually contain the most important info
  const paragraphs = content.split("\n\n");
  let result = "";

  // Always include the first paragraph
  if (paragraphs[0]) {
    result += paragraphs[0] + "\n\n";
  }

  // Add more paragraphs until we approach the target length
  let currentLength = result.length;
  for (let i = 1; i < paragraphs.length && currentLength < targetLength; i++) {
    const nextParagraph = paragraphs[i];
    if (currentLength + nextParagraph.length > targetLength) {
      break;
    }
    result += nextParagraph + "\n\n";
    currentLength += nextParagraph.length + 2;
  }

  return result.trim();
}
