import { conflictError, notFoundError } from "@/errors";
import { noVacancyError } from "@/errors/no-vacancy-error";
import { insertActivityEnroll, selectActivities, selectActivitiesEnrolls, selectActivity, selectActivityEnrolls, selectUserEnrollsByUserId } from "@/repositories/activities-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { Activity } from "@prisma/client";
import { otherStepsError, paymentRequiredError } from "./errors";
import bookingRepository from "@/repositories/booking-repository";

type returnActivities = Activity & {
  userIsRegistered?: boolean
} & { _count: { ActivityEnroll: number } }

export async function getAllActivities(userId: number) {
  await checkTicketBookingAndEnrollment(userId);

  const activities: returnActivities[] = await selectActivities();

  const activitiesEnrolls = await selectActivitiesEnrolls();

  const userEnrollsHash: { [id: number]: boolean } = {};

  activitiesEnrolls?.forEach(enroll => {
    if(enroll.userId === userId) userEnrollsHash[enroll.activityId] = true;
  });

  activities?.forEach(act => {
    act.vacancy -= act._count.ActivityEnroll;
    delete act._count;
    if(userEnrollsHash[act.id]) act.userIsRegistered = true;
    else act.userIsRegistered = false;
  });

  return activities;
}

export async function createActivityEnroll(userId: number, activityId: number) {
  await checkTicketBookingAndEnrollment(userId);
  
  const activity = await selectActivity(activityId);

  if(!activity) throw notFoundError();

  const userEnrolls = await selectUserEnrollsByUserId(userId);

  userEnrolls?.forEach(enroll => {
    if((activity.startAt.getTime() >= enroll.Activity.startAt.getTime() && activity.startAt.getTime() < enroll.Activity.endAt.getTime()) ||
    (activity.startAt.getTime() < enroll.Activity.startAt.getTime() && activity.endAt.getTime() > enroll.Activity.startAt.getTime())
    ) throw conflictError("User cannot enroll to two activities that happen simultaneously");
  }); 

  const enrolls = await selectActivityEnrolls(activityId);

  if(activity.vacancy - enrolls.length === 0) throw noVacancyError();

  return await insertActivityEnroll(userId, activityId);
}

async function checkTicketBookingAndEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithTicketAndTicketTypeByUserId(userId);
  const ticket = enrollment?.Ticket[0];
  const ticketType = enrollment?.Ticket[0]?.TicketType;
  const booking = await bookingRepository.findByUserId(userId);

  if(!enrollment || !ticket || ticket?.status !== "PAID" || (ticketType.includesHotel && !booking)) throw paymentRequiredError();

  if(ticketType.isRemote) throw otherStepsError();
}
