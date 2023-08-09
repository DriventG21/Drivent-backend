import { prisma } from "@/config";
import dayjs from "dayjs";

export async function selectActivitiesWithEnrolls(date: Date) {
  return prisma.activity.findMany({
    where: {
      startAt: {
        gte: date,
        lte: dayjs(date).add(1, "day").toDate()
      }
    },
    include: {
      ActivityEnroll: true
    }
  });
}

export async function selectActivities() {
  return prisma.activity.findMany({});
}

export async function selectActivity(id: number) {
  return prisma.activity.findUnique({
    where: {
      id
    }
  });
}

export async function selectActivityEnrolls(activityId: number) {
  return prisma.activityEnroll.findMany({
    where: {
      activityId
    }
  });
}

export async function insertActivityEnroll(userId: number, activityId: number) {
  return prisma.activityEnroll.create({
    data: {
      userId,
      activityId
    }
  });
}
