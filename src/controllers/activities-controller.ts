import { AuthenticatedRequest } from "@/middlewares";
import { createActivityEnroll, getActivitiesByDate, getAllActivities } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  try{
    res.send(await getAllActivities());
  }catch(err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
}

export async function getDateActivities(req: AuthenticatedRequest, res: Response) {
  const date = new Date(req.params.date);

  try{
    res.send(await getActivitiesByDate(date));
  }catch(err) {
    if(err.name === "NotFoundError") return res.status(httpStatus.NOT_FOUND).send(err.message);

    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
}

export async function postActivityEnroll(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const activityId = req.body.activityId;
    
  try{
    res.status(httpStatus.CREATED).send(await createActivityEnroll(userId, activityId));
  }catch(err) {
    if(err.name === "NotFoundError") return res.status(httpStatus.NOT_FOUND).send(err.message);
    if(err.name === "noVacancyError") return res.status(httpStatus.IM_A_TEAPOT).send(err.message);
    if(err.name === "ConflictError") return res.status(httpStatus.CONFLICT).send(err.message);
        
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
}
