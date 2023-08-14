import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import certificateService from "@/services/certificate-service";

export async function validateEventIsOver(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    await certificateService.validateEventIsOver(userId);
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === "ForbiddenAction") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function generateCertificate(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const certificate = await certificateService.createCertificate(userId);
    return res.status(httpStatus.OK).send(certificate);
  } catch (error) {
    if (error.name === "ForbiddenAction") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
