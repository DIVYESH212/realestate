import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { sendEmail } from "../../../../services/email";

export const sendEmailSchema = Joi.object({
  lead_id: Joi.string().trim().optional().allow('', null),
  from: Joi.string().email().trim().optional().allow('', null),
  senderName: Joi.string().trim().optional().allow('', null),
  to: Joi.string().email().trim().required(),
  recipientName: Joi.string().trim().optional().allow('', null),
  subject: Joi.string().trim().required(),
  message: Joi.string().trim().required(),
  status: Joi.string().valid('sent', 'delivered', 'failed').optional()
});

const router = Router();

router.post(
  "/send",
  commonResolver.bind({
    modelService: sendEmail,
    isRequestValidateRequired: true,
    schemaValidate: sendEmailSchema
  })
);

export default router;
