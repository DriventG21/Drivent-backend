import { prisma } from "@/config";
import faker from "@faker-js/faker";
import dayjs from "dayjs";

export async function createActivity(date: Date, vacancy?: number, local?: "MAIN" | "SIDE" | "WORKSHOP") {
  return prisma.activity.create({
    data: {
      name: faker.name.jobTitle(),
      vacancy: vacancy || 10,
      local: local || "MAIN",
      startAt: date,
      endAt: dayjs(date).add(1, "hour").toDate()
    }
  });
}

export async function createActivityEnroll(activityId: number, userId: number) {
  return prisma.activityEnroll.create({
    data: {
      activityId,
      userId
    }
  });
}
