import { Booking, Hotel, Room } from "@prisma/client";

type FullHotel = (Hotel & {
  Rooms: (Room & {
    Booking: Booking[];
  })[];
})[];

type FormatedHotel = (Hotel & { vacancy: number } & { type: string[] })[];

export function formatHotels(hotels: FullHotel) {
  const result: FormatedHotel = [];

  hotels.forEach((h) => {
    let vacancy = 0;
    const roomHash: { [capacity: number]: boolean } = {};
    const type: string[] = [];

    for (let i = 0; i < h.Rooms.length; i++) {
      vacancy += h.Rooms[i].capacity - h.Rooms[i].Booking.length;
      roomHash[h.Rooms[i].capacity] = true;
    }

    if (roomHash[1]) {
      type.push("Single");
    }
    if (roomHash[2]) {
      type.push("Double");
    }
    if (roomHash[3]) {
      type.push("Triple");
    }

    const hotel = {
      id: h.id,
      name: h.name,
      image: h.image,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
      vacancy,
      type,
    };
    result.push(hotel);
  });

  return result;
}
