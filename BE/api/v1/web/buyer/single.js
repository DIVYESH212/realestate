import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { getBuyerById } from "../../../../services/buyer/getBuyerById";

export const buyerSingleSchema = Joi.object({
  id: Joi.string().trim().optional(),
}).unknown(true);

const router = Router();

router.get("/:id", commonResolver.bind({ modelService: getBuyerById, isRequestValidateRequired: false, schemaValidate: buyerSingleSchema }));

export default router;
