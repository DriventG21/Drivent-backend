import enrollmentRepository, { CreateEnrollmentParams, UpdateEnrollmentParams } from "../enrollment-repository";
import addressRepository, { CreateAddressParams } from "../address-repository";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config";
import paymentRepository from "../payment-repository";
import ticketRepository from "../ticket-repository";
import { CardPaymentData } from "@/protocols";

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

export async function processPaymentTransaction(
  ticketId: number,
  paymentData: CardPaymentData
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const payment = await paymentRepository.createPayment(ticketId, paymentData, tx);
    await ticketRepository.ticketProcessPayment(ticketId, tx);
    return payment;
  });
}
