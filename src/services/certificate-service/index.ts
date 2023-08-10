import { forbiddenError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import tikectRepository from "@/repositories/ticket-repository";
import eventsService from "../events-service";
import dayjs from "dayjs";

async function validateEventIsOver(): Promise<boolean> {
  await checkEventisOngoing();
  return true;
}

async function createCertificate(userId: number) {
  const { enrollment, ticket } = await checkPossibility(userId);
  // - O evento só fica disponível após a conclusão do evento.
  // uncomment to undo mock
  // const { event, eventEndsAt, eventStartsAt } = await checkEventisOngoing();

  // mock
  const event = await eventsService.getFirstEvent();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  // end mock

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

  const ticket = await tikectRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED") {
    throw forbiddenError("Ticket not paid");
  }

  // - Para usuários presenciais, é necessário que ele tenha participado de pelo menos cinco atividades durante todos os dias do evento.
  //TODO: Verificar se usuário da modalidade presencial foi inscrito em pelo menos 5 atividades

  return { enrollment, ticket };
}

async function checkEventisOngoing() {
  const event = await eventsService.getFirstEvent();
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
