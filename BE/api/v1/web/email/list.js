import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { getEmails } from "../../../../services/email";
import joi from "joi";


const listSchema = joi.object({
  lead_id: joi.string().trim().optional().allow('', null),
  search: joi.string().trim().optional().allow('', null),
  page: joi.number().integer().min(1).optional().allow('', null),
  limit: joi.number().integer().min(1).max(100).optional().allow('', null)
});

const router = Router();

router.get(
  "/",
  commonResolver.bind({
    modelService: getEmails,
    isRequestValidateRequired: false,
    schemaValidate: listSchema
  })
);

export default router;
