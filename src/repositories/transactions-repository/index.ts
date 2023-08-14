import enrollmentRepository, { CreateEnrollmentParams, UpdateEnrollmentParams } from "../enrollment-repository";
import addressRepository, { CreateAddressParams } from "../address-repository";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config";

export async function enrollmentAndAddressTransaction(
  userId: number, 
  createdEnrollment: CreateEnrollmentParams, 
  updatedEnrollment: UpdateEnrollmentParams, 
  address: CreateAddressParams
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newEnrollment = await enrollmentRepository.upsert(userId, createdEnrollment, updatedEnrollment, tx);
    await addressRepository.upsert(newEnrollment.id, address, address, tx);
  });
}
