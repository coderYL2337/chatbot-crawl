// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeUrl, urlPattern } from "@/app/utils/scraper";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    console.log("message received:", message);

    let scrapedContent = "";
    let userQuery = message;

    // Use the existing urlPattern
    const urlMatch = message.match(urlPattern);

    if (urlMatch) {
      // Get the complete matched URL (first element of match array)
      const url = urlMatch[0];
      console.log("URL to scrape:", url);

      try {
        const scraperResponse = await scrapeUrl(url);
        scrapedContent = scraperResponse.content;

        // Remove the matched URL from user query
        userQuery = message.replace(url, "").trim();

        console.log("Scraped content length:", scrapedContent.length);
      } catch (error) {
        console.error("Error processing URL:", error);
        return NextResponse.json({
          message:
            "Unable to access the provided URL. Please ensure the URL is correct and accessible.",
        });
      }
    }

    const prompt = `
    Answer my question: "${userQuery}"

    Based on the following content:
    <content>
      ${scrapedContent}
    </content>
    `;
    console.log("Constructed prompt:", prompt);

    const response = await getGroqResponse(prompt);
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Route handler error:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
