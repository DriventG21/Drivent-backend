import { prisma } from "@/config";

async function findFirst() {
  return prisma.event.findFirst();
}

async function findAll() {
  return prisma.event.findMany();
}

const eventRepository = {
  findFirst,
  findAll,
};

export default eventRepository;
