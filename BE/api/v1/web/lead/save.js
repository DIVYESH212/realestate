import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { createLead } from "../../../../services/lead/createLead";
import Message from "../../../../utilities/messages";

/**
 * @swagger
 * /leads: 
 *   post:
 *     tags: [Lead]
 *     security:
 *       - bearerAuth: []
 *     summary: Save a lead
 *     description: Save a lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:        
 *             $ref: '#/components/schemas/Lead'
 *     responses:
 *       200:
 *         description: Lead saved
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error   
 */

export const leadSaveSchema = Joi.object({
  name: Joi.string().trim().optional().allow('', null),
  firstName: Joi.string().trim().optional().allow('', null),
  lastName: Joi.string().trim().optional().allow('', null),
  email: Joi.string().email().trim().optional().allow('', null).messages({
    "string.email": Message.invalidEmail,
  }),
  mobilenumber: Joi.string().trim().pattern(/^[+]?[0-9\s().-]{7,15}$/).optional().allow('', null).messages({
    "string.pattern.base": Message.invalidPhone,
  }),
  phone: Joi.string().trim().pattern(/^[+]?[0-9\s().-]{7,15}$/).optional().allow('', null).messages({
    "string.pattern.base": Message.invalidPhone,
  }),
  ownername: Joi.string().trim().optional().allow('', null),
  ownermailingaddress: Joi.string().trim().optional().allow('', null),
  estimatedvalue: Joi.number().optional().allow(null, ''),
  estimatedtotallens: Joi.number().optional().allow(null, ''),
  estimatedequity: Joi.number().optional().allow(null, ''),
  leadsource: Joi.string().valid('website', 'referral', 'social media', 'other').optional().allow('', null).messages({
    "any.only": Message.leadSourceInvalid,
  }),
  market_segment: Joi.string().valid('residential', 'commercial', 'industrial', 'other').optional().allow('', null).messages({
    "any.only": Message.marketSegmentInvalid,
  }),
  propertyAddress: Joi.string().trim().optional().allow('', null),
  dateCreated: Joi.date().optional().allow(null, ''),
  leadstatus: Joi.string().trim().optional().allow('', null),
  status: Joi.string().trim().optional().allow('', null),
  city: Joi.string().trim().optional().allow('', null),
  state: Joi.string().trim().optional().allow('', null),
  zip: Joi.string().trim().optional().allow('', null),
  propertytype: Joi.string().trim().optional().allow('', null),
  loanamount: Joi.number().optional().allow(null, ''),
  loaninterest: Joi.number().optional().allow(null, ''),
  loanterm: Joi.number().optional().allow(null, ''),
  loanduration: Joi.number().optional().allow(null, ''),
  loanpayment: Joi.number().optional().allow(null, ''),
  notes: Joi.string().trim().optional().allow('', null),
}).unknown(true);

const router = Router();

router.post("/", commonResolver.bind({ modelService: createLead, isRequestValidateRequired: true, schemaValidate: leadSaveSchema }));

export default router;
