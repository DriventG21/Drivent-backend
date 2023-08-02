import { redis } from "@/config";
import { FindHotelsReturn } from ".";

async function findHotels(): Promise<FindHotelsReturn[]> {
    const keys = await redis.keys('hotel:*');
    const hotels: FindHotelsReturn[] = [];
    for (let i = 0; i < keys.length; i++) {
        hotels.push(JSON.parse(await redis.get(keys[i])));
    }
    return hotels;
}

async function findRoomsByHotelId(hotelId: number): Promise<FindHotelsReturn> {
    return JSON.parse(await redis.get(`hotel:${hotelId}`));
}

const cacheHotelRepository = {
    findHotels,
    findRoomsByHotelId,
}

export default cacheHotelRepository;