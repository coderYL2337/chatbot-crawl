import { Redis } from "@upstash/redis";
import { Logger } from "./logger";
//import dotenv from "dotenv";
const logger = new Logger("redis");

logger.info("Redis URL:", {
  url: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 10) + "...",
});
logger.info("Redis Token exists:", {
  hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log("redis REDIS_URL:", process.env.UPSTASH_REDIS_REST_URL);
console.log("redis REDIS_TOKEN:", process.env.UPSTASH_REDIS_REDIS_TOKEN);
