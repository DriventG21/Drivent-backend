import Joi from "joi";

export const activitiesSchema = Joi.object({
  date: Joi.date().iso().required()
});

export const activityEnrollSchema = Joi.object({
  activityId: Joi.number().required()
});
