import { conflictError, notFoundError } from "@/errors";
import { noVacancyError } from "@/errors/no-vacancy-error";
import { insertActivityEnroll, selectActivities, selectActivitiesWithEnrolls, selectActivity, selectActivityEnrolls, selectUserEnrollsByUserId } from "@/repositories/activities-repository";
import dayjs from "dayjs";

export async function getAllActivities() {
  const activities = await selectActivities();

  return activities;
}

export async function getActivitiesByDate(date: Date) {
  const activities = await selectActivitiesWithEnrolls(date);

  if(activities.length < 1) throw notFoundError();

  activities.forEach(activity => {
    activity.vacancy -= activity.ActivityEnroll.length;
  });

  return activities;
}

export async function createActivityEnroll(userId: number, activityId: number) {
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
