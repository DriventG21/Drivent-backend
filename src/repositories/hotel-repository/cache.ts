import { redis } from "@/config";
import { FindHotelsReturn } from ".";

async function findHotels(): Promise<FindHotelsReturn[]> {
  const keys = await redis.keys("hotel:*");
  const hotels: FindHotelsReturn[] = [];
  for (let i = 0; i < keys.length; i++) {
    hotels.push(JSON.parse(await redis.get(keys[i])));
  }
  return hotels;
}

async function findRoomsByHotelId(hotelId: number): Promise<FindHotelsReturn> {
  return JSON.parse(await redis.get(`hotel:${hotelId}`));
}

async function updateHotelById(hotelId: number, data: FindHotelsReturn) {
  return redis.set(`hotel:${hotelId}`, JSON.stringify(data));
}

const cacheHotelRepository = {
  findHotels,
  findRoomsByHotelId,
  updateHotelById,
};

export default cacheHotelRepository;
