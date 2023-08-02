import hotelRepository from "@/repositories/hotel-repository";
import cacheHotelRepository from "@/repositories/hotel-repository/cache";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { formatHotels } from "@/utils/hotel-format";

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED") {
    throw cannotListHotelsError("Payment Required");
  }
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw cannotListHotelsError("Invalid ticket type");
}

async function getHotels(userId: number) {
  await listHotels(userId);

  let hotels = await cacheHotelRepository.findHotels();
  if (hotels.length === 0) {
    hotels = await hotelRepository.findHotels();
  }

  return formatHotels(hotels);
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);

  let hotel = await cacheHotelRepository.findRoomsByHotelId(hotelId);
  if (!hotel) {
    hotel = await hotelRepository.findRoomsByHotelId(hotelId);
  }

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
