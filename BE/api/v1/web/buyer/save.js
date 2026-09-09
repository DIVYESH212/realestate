import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { createBuyer } from "../../../../services/buyer/createBuyer";
import Message from "../../../../utilities/messages";

/**
 * @swagger
 * /buyer:
 *   post:
 *     summary: Save Buyer
 *     description: Save a buyer.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Buyer'
 *     responses:
 *       200:
 *         description: Save buyer successful.
 *       400:
 *         description: Invalid input data.
 *       500: 
 *         description: Internal server error.  
 */


export const buyerSaveSchema = Joi.object({
  name: Joi.string().trim().optional().allow('', null),
  mobilenumber: Joi.string().trim().pattern(/^[+]?[0-9\s().-]{7,15}$/).optional().allow('', null).messages({
    "string.pattern.base": Message.invalidPhone,
  }),
  email: Joi.string().email().trim().optional().allow('', null).messages({
    "string.email": Message.invalidEmail,
  }),
  propertyAddress: Joi.string().trim().optional().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'hold', 'assign').optional().allow('', null).messages({
    "any.only": Message.statusInvalid,
  }),
  lead_id: Joi.alternatives().try(Joi.string().trim().allow('', null), Joi.object()).optional().allow(null),
  lead_ids: Joi.array().items(Joi.alternatives().try(Joi.string().trim().allow('', null), Joi.object())).optional().allow(null),
  notes: Joi.string().trim().optional().allow('', null),
}).unknown(true);

const router = Router();

router.post("/", commonResolver.bind({ modelService: createBuyer, isRequestValidateRequired: true, schemaValidate: buyerSaveSchema }));

export default router;
