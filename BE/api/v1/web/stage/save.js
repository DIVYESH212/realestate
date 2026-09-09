import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { createStage } from "../../../../services/stage/createStage";

export const stageSaveSchema = Joi.object({
  name: Joi.string().trim().required(),
  order: Joi.number().optional().allow(null),
}).unknown(true);

const router = Router();

router.post("/", commonResolver.bind({ modelService: createStage, isRequestValidateRequired: true, schemaValidate: stageSaveSchema }));

export default router;
