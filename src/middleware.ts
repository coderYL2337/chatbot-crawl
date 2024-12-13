// // TODO: Implement the code here to add rate limiting with Redis
// // Refer to the Next.js Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
// // Refer to Redis docs on Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms

// // import { NextResponse } from "next/server";
// // import type { NextRequest } from "next/server";

// // export async function middleware(request: NextRequest) {
// //   try {

// //     const response = NextResponse.next();

// //     return response;

// //   } catch (error) {

// //   }
// // }

// // // Configure which paths the middleware runs on
// // export const config = {
// //   matcher: [
// //     /*
// //      * Match all request paths except static files and images
// //      */
// //     "/((?!_next/static|_next/image|favicon.ico).*)",
// //   ],
// // };

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { RateLimiter } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_URL,
//   token: process.env.UPSTASH_REDIS_TOKEN,
// });
// const rateLimiter = new RateLimiter({
//   redis,
//   limiter: RateLimiter.fixedWindow(10, "60 s"), // 10 requests per minute
// });

// export async function middleware(request: NextRequest) {
//   try {
//     const ip = request.ip || "127.0.0.1"; // Fallback for local testing
//     const { success } = await rateLimiter.limit(ip);

//     if (!success) {
//       return NextResponse.json(
//         { error: "Rate limit exceeded. Please try again later." },
//         { status: 429 }
//       );
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error("Middleware Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };

// TODO: Implement the code here to add rate limiting with Redis
// Refer to the Next.js Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
// Refer to Redis docs on Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();

    return response;
  } catch (error) {}
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
