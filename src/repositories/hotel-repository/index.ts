import { prisma } from "@/config";
import { Booking, Hotel, Room } from "@prisma/client";

async function findHotels(): Promise<FindHotelsReturn[]> {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        include: {
          Booking: true,
        },
      },
    },
  });
}

export type FindHotelsReturn = (Hotel & {
  Rooms: (Room & {
    Booking: Booking[];
  })[];
});

async function findRoomsByHotelId(hotelId: number): Promise<FindHotelsReturn> {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: {
        include: {
          Booking: true
        }
      },
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};

export default hotelRepository;
