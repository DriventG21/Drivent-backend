import { redis } from "@/config";
import hotelRepository from "@/repositories/hotel-repository";
import eventRepository from "@/repositories/event-repository";

export async function redisStartup() {
    await redisHotelsStartup();
    await redisEventsStartup();
}

async function redisHotelsStartup() {
    const hotels = await hotelRepository.findHotels();
    if (hotels.length === 0) return;
    hotels.forEach(e => {
        redis.set(`hotel:${e.id}`, JSON.stringify(e));
    })
}

async function redisEventsStartup() {
    const events = await eventRepository.findAll();
    if (events.length === 0) return;
    events.forEach(e => {
        redis.set(`event:${e.id}`, JSON.stringify(e));
    })
}