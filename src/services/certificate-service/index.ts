import { forbiddenError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { countUserActivitiesEnroll } from "@/repositories/activities-repository";
import eventsService from "../events-service";
import dayjs from "dayjs";

async function validateEventIsOver(): Promise<boolean> {
  await checkEventisOngoing();
  return true;
}

async function createCertificate(userId: number) {
  const { event, eventEndsAt, eventStartsAt } = await checkEventisOngoing();
  const { enrollment, ticket } = await checkPossibility(userId);

  return {
    event: event.title,
    logo: event.logoImageUrl,
    startsAt: eventStartsAt,
    endsAt: eventEndsAt,
    ticketType: ticket.TicketType.isRemote ? "ONLINE" : "IN-PERSON",
    user: {
      name: enrollment.name,
      cpf: enrollment.cpf,
    },
  };
}

async function checkPossibility(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError("Cannot Find Enrollment");
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED") {
    throw forbiddenError("Ticket not paid");
  }

  if (!ticket.TicketType.isRemote) {
    const minimalAmount = 5;
    const activitiesAmount = await countUserActivitiesEnroll(userId);
    if (activitiesAmount < minimalAmount) {
      throw forbiddenError("Not enough activities enrolled");
    }
  }
  return { enrollment, ticket };
}

async function checkEventisOngoing() {
  const event = await eventsService.getFirstEvent();
  if (!event) {
    throw notFoundError("No event was found");
  }
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);
  const now = dayjs();
  const eventEnded = now.isAfter(eventEndsAt);

  if (!eventEnded) {
    throw forbiddenError("Event is still ongoing");
  }

  return { event, eventEndsAt, eventStartsAt };
}

const certificateService = {
  validateEventIsOver,
  createCertificate,
};

export default certificateService;
