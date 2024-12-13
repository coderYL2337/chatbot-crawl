// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

// import { NextResponse } from "next/server";
// import * as cheerio from "cheerio";
// import puppeteer from "puppeteer";
// import { GroqClient } from "groq-sdk";
// import { Configuration, OpenAIApi } from "openai";

// const groqClient = new GroqClient({ apiKey: process.env.GROQ_API_KEY });
// const openai = new OpenAIApi(
//   new Configuration({ apiKey: process.env.OPENAI_API_KEY })
// );

// // Dynamic LLM selection
// const getDynamicLLM = (fallback = "openai") => {
//   if (process.env.GROQ_API_KEY) {
//     return { type: "groq", client: groqClient };
//   } else if (process.env.GEMINI_API_KEY) {
//     return { type: "gemini", client: "Gemini API Integration Here" }; // Placeholder for Gemini
//   } else if (fallback === "openai") {
//     return { type: "openai", client: openai };
//   }
//   throw new Error("No LLM API key available");
// };

// export async function POST(req: Request) {
//   try {
//     const { message, urls = [] } = await req.json();

//     // Case 1: General questions that don’t require web scraping
//     if (!urls.length) {
//       const llm = getDynamicLLM();
//       const response =
//         llm.type === "groq"
//           ? await llm.client.chat({ prompt: message })
//           : await llm.client.createChatCompletion({
//               model: "gpt-4",
//               messages: [{ role: "user", content: message }],
//             });
//       return NextResponse.json({ answer: response.data });
//     }

//     // Case 2: Perform web scraping for URLs
//     const scrapedData = await Promise.all(
//       urls.map(async (url: string) => {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.goto(url);
//         const html = await page.content();
//         await browser.close();

//         const $ = cheerio.load(html);
//         return {
//           url,
//           content: $("body").text().trim(),
//         };
//       })
//     );

//     // Combine scraped data into a prompt for the LLM
//     const prompt = `
//       Summarize the following information from these sources:
//       ${scrapedData
//         .map(({ url, content }) => `Source: ${url}\nContent: ${content}`)
//         .join("\n\n")}
//     `;

//     const llm = getDynamicLLM();
//     const response =
//       llm.type === "groq"
//         ? await llm.client.chat({ prompt })
//         : await llm.client.createChatCompletion({
//             model: "gpt-4",
//             messages: [{ role: "user", content: prompt }],
//           });

//     return NextResponse.json({
//       answer: response.data,
//       sources: scrapedData.map(data => data.url),
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json(
//       { error: "Failed to process the request" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {

//   } catch (error) {

//   }
// }
// import { NextResponse } from "next/server";
// import { getGroqResponse } from "@/app/utils/groqClient";
// import { scrapeUrl, urlPattern } from "@/app/utils/scraper";

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();
//     console.log("message received:", message);
//     const url = message.match(urlPattern);

//     let scrapedContent = "";

//     if (url) {
//       console.log("Url found", url);
//       const scraperResponse = await scrapeUrl(url);
//       // const scrapedContent = await scrapeUrl(url);
//       scrapedContent = scraperResponse.content;
//       console.log("Scraped content", scrapedContent);
//     }
//     // Extract the user's query by removing the URL if present
//     const userQuery = message.replace(url ? url[0] : "", "").trim();
//     const prompt = `
//     Answer my question: "${userQuery}"

//     Based on the following content:
//     <content>
//       ${scrapedContent}
//     </content>
//     `;
//     console.log("Prompt:", prompt);

//     const response = await getGroqResponse(prompt);
//     return NextResponse.json({ message: response });
//   } catch (error) {
//     return NextResponse.json({ message: "Error" });
//   }
// }

// import { NextResponse } from "next/server";
// import { getGroqResponse } from "@/app/utils/groqClient";
// import { scrapeUrl, urlPattern } from "@/app/utils/scraper";

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();
//     console.log("message received:", message);

//     let scrapedContent = "";
//     let userQuery = message;

//     // Find URL in the message
//     const urlMatch = message.match(urlPattern);
//     if (urlMatch) {
//       // Extract the full matched URL (first element in the array)
//       const matchedUrl = urlMatch[0];

//       // Add https:// prefix if not present
//       const url = matchedUrl.startsWith("http")
//         ? matchedUrl
//         : `https://${matchedUrl}`;
//       console.log("URL to scrape:", url);

//       try {
//         const scraperResponse = await scrapeUrl(url);
//         scrapedContent = scraperResponse.content;

//         // Remove the matched URL from the user query
//         userQuery = message.replace(matchedUrl, "").trim();

//         console.log("Scraped content length:", scrapedContent.length);
//       } catch (error) {
//         console.error("Error processing URL:", error);
//         return NextResponse.json({
//           message:
//             "Unable to access the provided URL. Please ensure the URL is correct and accessible.",
//         });
//       }
//     }

//     const prompt = `
//     Answer my question: "${userQuery}"

//     Based on the following content:
//     <content>
//       ${scrapedContent}
//     </content>
//     `;
//     console.log("Constructed prompt:", prompt);

//     const response = await getGroqResponse(prompt);
//     return NextResponse.json({ message: response });
//   } catch (error) {
//     console.error("Route handler error:", error);
//     return NextResponse.json(
//       {
//         message: "An error occurred while processing your request.",
//       },
//       { status: 500 }
//     );
//   }
// }

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
