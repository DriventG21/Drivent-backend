import { AuthenticatedRequest } from "@/middlewares";
import { createActivityEnroll, getAllActivities } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  
  try{
    res.send(await getAllActivities(userId));
  }catch(err) {
    if(err.name === "otherStepsError") return res.status(httpStatus.FORBIDDEN).send(err.message);

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
    if(err.name === "otherStepsError") return res.status(httpStatus.FORBIDDEN).send(err.message);
        
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
}
