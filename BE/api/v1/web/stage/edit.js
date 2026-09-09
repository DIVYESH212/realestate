import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { updateStage } from "../../../../services/stage/updateStage";

export const stageEditSchema = Joi.object({
  name: Joi.string().trim().optional(),
  dotColor: Joi.string().trim().optional().allow('', null),
  badgeClass: Joi.string().trim().optional().allow('', null),
  order: Joi.number().optional().allow(null),
}).unknown(true);

const router = Router();

router.put("/:id", commonResolver.bind({ modelService: updateStage, isRequestValidateRequired: true, schemaValidate: stageEditSchema }));

export default router;
