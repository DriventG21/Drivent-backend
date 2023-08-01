import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { loadEnv } from "./envs";

loadEnv();

export let prisma: PrismaClient;
export function connectDb(): void {
  prisma = new PrismaClient();
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
}


export const redis = createClient({
  url: process.env.REDIS_URL
});

export async function connectRedis() {
  await redis.connect();
}

export async function disconnectRedis() {
  await redis.disconnect();
}