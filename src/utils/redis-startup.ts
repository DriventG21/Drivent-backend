import { redis } from "@/config";
import hotelRepository from "@/repositories/hotel-repository";

export async function redisStartup() {
    await redisHotelsStartup();
}

async function redisHotelsStartup() {
    const hotels = await hotelRepository.findHotels();
    console.log(hotels);
}