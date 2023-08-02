import { redis } from "@/config";
import { Event } from "@prisma/client";

async function findFirst(): Promise<Event> {
    return JSON.parse(await redis.get('event:1'));
}

const cacheEventRepository = {
    findFirst,
}

export default cacheEventRepository;