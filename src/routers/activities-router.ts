import { getActivities, postActivityEnroll } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { activityEnrollSchema } from "@/schemas";
import { Router } from "express";

const activitiesRouter = Router();

activitiesRouter.all("/*", authenticateToken);
activitiesRouter.get("", getActivities);
activitiesRouter.post("", validateBody(activityEnrollSchema), postActivityEnroll);

export { activitiesRouter };
