import Joi from "joi";

export const activityEnrollSchema = Joi.object({
  activityId: Joi.number().required()
});
