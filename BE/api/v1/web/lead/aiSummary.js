import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { getLeadAiSummary } from "../../../../services/lead/getLeadAiSummary";

export const leadAiSummarySchema = Joi.object({
  id: Joi.string().trim().optional(),
}).unknown(true);

const router = Router();

router.get(
  "/ai-summary/:id",
  commonResolver.bind({
    modelService: getLeadAiSummary,
    isRequestValidateRequired: false,
    schemaValidate: leadAiSummarySchema,
  })
);

export default router;
