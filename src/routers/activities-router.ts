import { getActivities, getDateActivities, postActivityEnroll } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { activitiesSchema, activityEnrollSchema } from "@/schemas";
import { Router } from "express";

const activitiesRouter = Router();

activitiesRouter.all("/*", authenticateToken);
activitiesRouter.get("", getActivities);
activitiesRouter.get("/:date", validateParams(activitiesSchema), getDateActivities);
activitiesRouter.post("", validateBody(activityEnrollSchema), postActivityEnroll);

export { activitiesRouter };
