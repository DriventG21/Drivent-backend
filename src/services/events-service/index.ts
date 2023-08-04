import { notFoundError } from "@/errors";
import eventRepository from "@/repositories/event-repository";
import cacheEventRepository from "@/repositories/event-repository/cache";
import { exclude } from "@/utils/prisma-utils";
import { Event } from "@prisma/client";
import dayjs from "dayjs";

async function getFirstEvent(): Promise<GetFirstEventResult> {
  const redisEvent = await cacheEventRepository.findFirst();
  if (redisEvent) {
    return exclude(redisEvent, "createdAt", "updatedAt");
  } else {
    const event = await eventRepository.findFirst();
    if (!event) throw notFoundError();

    return exclude(event, "createdAt", "updatedAt");
  }
}

export type GetFirstEventResult = Omit<Event, "createdAt" | "updatedAt">;

async function isCurrentEventActive(): Promise<boolean> {
  let event = await cacheEventRepository.findFirst();
  if (!event) {
    event = await eventRepository.findFirst();
    if (!event) return false;
  }

  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};

export default eventsService;
