import { prisma } from "@/config";
import { Booking } from "@prisma/client";

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;
type UpdateParams = Omit<Booking, "createdAt" | "updatedAt">;

async function create({ roomId, userId }: CreateParams): Promise<Booking & { Room: { hotelId: number } }> {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
    include: {
      Room: {
        select: {
          hotelId: true,
        }
      }
    }
  });
}

async function findByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
    include: {
      Room: true,
    }
  });
}

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: {
        include: {
          Hotel: true,
          Booking: true,
        } 
      }
    }
  });
}

async function upsertBooking({ id, roomId, userId }: UpdateParams): Promise<Booking & { Room: { hotelId: number } }> {
  return prisma.booking.upsert({
    where: {
      id,
    },
    create: {
      roomId,
      userId,
    },
    update: {
      roomId,
    },
    include: {
      Room: {
        select: {
          hotelId: true,
        }
      }
    }
  });
}

const bookingRepository = {
  create,
  findByRoomId,
  findByUserId,
  upsertBooking,
};

export default bookingRepository;
