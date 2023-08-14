import { prisma } from "@/config";

export async function selectActivities() {
  return prisma.activity.findMany({
    include: {
      _count: {
        select: {
          ActivityEnroll: true
        }
      }
    }
  });
}

export async function selectActivity(id: number) {
  return prisma.activity.findUnique({
    where: {
      id,
    },
  });
}

export async function selectActivityEnrolls(activityId: number) {
  return prisma.activityEnroll.findMany({
    where: {
      activityId,
    },
  });
}

export async function insertActivityEnroll(userId: number, activityId: number) {
  return prisma.activityEnroll.create({
    data: {
      userId,
      activityId,
    },
  });
}

export async function countUserActivitiesEnroll(userId: number) {
  return await prisma.activityEnroll.count({
    where: {
      userId,
    },
  });
}

export async function selectUserEnrollsByUserId(userId: number) {
  return prisma.activityEnroll.findMany({
    where: {
      userId
    },
    include: {
      Activity: true
    }
  });
}

export async function selectActivitiesEnrolls() {
  return prisma.activityEnroll.findMany();
}
